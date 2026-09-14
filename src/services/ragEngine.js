/**
 * Document-grounded RAG (Retrieval-Augmented Generation) Engine
 * Retrieves relevant sections, attaches citations, and prevents hallucinations.
 */

// Common legal stopwords to ignore during semantic matching
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has', 'are', 'were',
  'will', 'would', 'should', 'shall', 'been', 'each', 'such', 'into', 'under', 'upon',
  'other', 'which', 'their', 'what', 'when', 'where', 'how', 'who', 'does', 'about'
]);

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
 * Searches parsed document sections for relevant content
 */
export function retrieveRelevantSections(query, sections, topK = 3) {
  if (!query || !sections || sections.length === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return [];
  }

  const scoredSections = sections.map(sec => {
    const titleTokens = tokenize(sec.title || '');
    const contentTokens = tokenize(sec.content || '');

    let score = 0;
    for (const token of queryTokens) {
      // Direct title match gets high priority weight
      if (titleTokens.includes(token)) {
        score += 4.0;
      }
      // Exact substring occurrences in content
      const contentMatches = contentTokens.filter(t => t === token).length;
      score += Math.min(contentMatches, 5) * 1.0;

      // Partial stem matching
      if (sec.content.toLowerCase().includes(token)) {
        score += 0.5;
      }
    }

    return {
      section: sec,
      score
    };
  });

  // Filter out sections with zero or negligible relevance
  const relevant = scoredSections
    .filter(item => item.score > 1.2)
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
  const sentences = primarySection.content
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  const queryTokens = tokenize(question);
  let bestSentence = sentences[0] || primarySection.content.slice(0, 200);
  let highestSentenceScore = -1;

  for (const sentence of sentences) {
    const sentenceTokens = tokenize(sentence);
    const score = queryTokens.filter(t => sentenceTokens.includes(t)).length;
    if (score > highestSentenceScore) {
      highestSentenceScore = score;
      bestSentence = sentence;
    }
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
