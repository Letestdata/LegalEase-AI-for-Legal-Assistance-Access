import { describe, it, expect } from 'vitest';
import { tokenize, retrieveRelevantSections, answerQuestionFromDocument } from '../src/services/ragEngine';

describe('Document-Grounded RAG Engine', () => {
  const sampleSections = [
    {
      title: 'Notice Period Requirements',
      number: '5.1',
      page: 3,
      content: 'Tenant must provide at least sixty 60 days written notice prior to terminating lease agreement.'
    },
    {
      title: 'Security Deposit Escrow',
      number: '8.3',
      page: 4,
      content: 'Security deposit of $2,450 will be returned within 21 calendar days following mutual walk-through inspection.'
    },
    {
      title: 'Early Termination Fees',
      number: '14.2',
      page: 7,
      content: 'In the event tenant breaks agreement early, tenant must pay early termination liquidated damages fee equal to two months rent.'
    }
  ];

  it('tokenizes and removes common legal stopwords', () => {
    const tokens = tokenize('What will happen with the notice period for this agreement?');
    expect(tokens).toContain('notice');
    expect(tokens).toContain('period');
    expect(tokens).toContain('agreement');
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('with');
  });

  it('retrieves correct section matching user inquiry', () => {
    const results = retrieveRelevantSections('How much notice do I need to give?', sampleSections);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].number).toBe('5.1');
  });

  it('returns grounded answer with source citation', () => {
    const qResult = answerQuestionFromDocument('When do I get my deposit back?', sampleSections);
    expect(qResult.found).toBe(true);
    expect(qResult.sources[0].citation).toContain('Page 4');
    expect(qResult.answer).toContain('21 calendar days');
  });

  it('honestly reports when information is missing without hallucination', () => {
    const missingResult = answerQuestionFromDocument('Are pets allowed in the swimming pool?', sampleSections);
    expect(missingResult.found).toBe(false);
    expect(missingResult.answer).toBe("I couldn't find information about this in the uploaded document.");
  });
});
