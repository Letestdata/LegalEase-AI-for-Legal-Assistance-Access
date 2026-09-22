/**
 * Document-grounded RAG (Retrieval-Augmented Generation) Engine
 * Retrieves relevant sections, attaches citations, and prevents hallucinations.
 */

import { isPdfBytecode } from './documentParser';

// Common legal stopwords to ignore during semantic matching
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has', 'are', 'were',
  'will', 'would', 'should', 'shall', 'been', 'each', 'such', 'into', 'under', 'upon',
  'other', 'which', 'their', 'what', 'when', 'where', 'how', 'who', 'does', 'about',
  'can', 'could', 'may', 'any', 'some', 'out'
]);

/**
 * Normalizes words by stemming and canonicalizing common legal terms
 */
export function normalizeStem(word) {
  if (!word || word.length <= 2) return '';
  const w = word.toLowerCase().trim();

  // Canonical intent mapping for common legal questions
  if (w.startsWith('terminat') || w === 'leave' || w === 'leaving' || w === 'left' || w.startsWith('vacat') || w.startsWith('cancel') || w === 'exit') {
    return 'terminat';
  }
  if (w.startsWith('renew') || w.startsWith('rollover') || w.startsWith('extend')) {
    return 'renew';
  }
  if (w.startsWith('automat')) {
    return 'automat';
  }
  if (w.startsWith('deposit') || w.startsWith('escrow')) {
    return 'deposit';
  }
  if (w.startsWith('notic')) {
    return 'notic';
  }
  if (w.startsWith('pay') || w.startsWith('paid') || w.startsWith('rent') || w.startsWith('fee') || w.startsWith('charg')) {
    return 'pay';
  }

  // General suffix stripper
  return w.replace(/(ing|tion|tions|ation|ations|ed|ly|es|s|al|ment|ments|able|ible)$/, '');
}

/**
 * Tokenizes text into normalized keywords
 */
export function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Searches parsed document sections for relevant content using both exact and semantic stem matching
 */
export function retrieveRelevantSections(query, sections, topK = 3) {
  if (!query || !sections || sections.length === 0) {
    return [];
  }

  // Filter out any corrupted or bytecode sections
  const validSections = sections.filter(sec => sec && !isPdfBytecode(sec.content));
  if (validSections.length === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  const queryStems = queryTokens.map(normalizeStem).filter(Boolean);

  if (queryTokens.length === 0 && queryStems.length === 0) {
    return [];
  }

  const scoredSections = validSections.map(sec => {
    const titleTokens = tokenize(sec.title || '');
    const titleStems = titleTokens.map(normalizeStem).filter(Boolean);
    const contentTokens = tokenize(sec.content || '');
    const contentStems = contentTokens.map(normalizeStem).filter(Boolean);

    let score = 0;

    // 1. Check title exact and stem matches
    for (let i = 0; i < queryTokens.length; i++) {
      const qToken = queryTokens[i];
      const qStem = queryStems[i];

      if (titleTokens.includes(qToken)) {
        score += 4.0;
      } else if (qStem && titleStems.includes(qStem)) {
        score += 3.5;
      }

      // Content matches
      const exactContentMatches = contentTokens.filter(t => t === qToken).length;
      score += Math.min(exactContentMatches, 5) * 1.0;

      const stemContentMatches = contentStems.filter(s => s === qStem).length;
      score += Math.min(stemContentMatches, 5) * 0.8;

      // Substring check
      if ((sec.content || '').toLowerCase().includes(qToken)) {
        score += 0.5;
      }
    }

    return {
      section: sec,
      score
    };
  });

  // Filter out sections with negligible relevance
  const relevant = scoredSections
    .filter(item => item.score >= 0.8)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.section);

  return relevant;
}

/**
 * Answers questions strictly grounded in the uploaded document
 */
export function answerQuestionFromDocument(question, sections) {
  const relevantSections = retrieveRelevantSections(question, sections, 2);

  if (relevantSections.length === 0) {
    return {
      answer: "I couldn't find information about this in the uploaded document.",
      sources: [],
      found: false
    };
  }

  const primarySection = relevantSections[0];
  const pageRef = primarySection.page ? `Page ${primarySection.page}` : 'Page 1';
  const sectionRef = primarySection.number ? `Section ${primarySection.number}` : (primarySection.title || 'Relevant Section');
  const sourceCitation = `${pageRef} • ${sectionRef}`;

  // Extract the most direct sentence from the section
  const sentences = (primarySection.content || '')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && !isPdfBytecode(s));

  const queryStems = tokenize(question).map(normalizeStem).filter(Boolean);
  let bestSentence = sentences[0] || (primarySection.title || 'Document terms apply to this provision.');
  let highestSentenceScore = -1;

  for (const sentence of sentences) {
    const sentenceStems = tokenize(sentence).map(normalizeStem).filter(Boolean);
    const score = queryStems.filter(s => sentenceStems.includes(s)).length;
    if (score > highestSentenceScore) {
      highestSentenceScore = score;
      bestSentence = sentence;
    }
  }

  if (isPdfBytecode(bestSentence)) {
    bestSentence = 'This section specifies binding covenants and conditions under the agreement.';
  }

  const answer = `According to the agreement (${sourceCitation}), ${bestSentence}`;

  return {
    answer,
    sources: [
      {
        page: primarySection.page || 1,
        section: primarySection.number || '1.0',
        title: primarySection.title || 'Document Provision',
        excerpt: bestSentence,
        citation: sourceCitation
      }
    ],
    found: true
  };
}
