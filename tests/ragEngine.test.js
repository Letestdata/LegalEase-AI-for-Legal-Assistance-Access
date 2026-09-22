import { describe, it, expect } from 'vitest';
import { tokenize, retrieveRelevantSections, answerQuestionFromDocument } from '../src/services/ragEngine';
import { analyzeLegalDocument, askDocumentQuestion } from '../src/services/aiService';

describe('Document-Grounded RAG Engine', () => {
  const sampleSections = [
    {
      title: 'Automatic Renewal',
      number: '3.4',
      page: 2,
      content: 'Upon expiration of initial period, this Agreement shall automatically renew for an identical successive twelve 12 month term unless notice is provided.'
    },
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

  it('answers "What happens if I terminate early?" accurately', async () => {
    const analysis = await analyzeLegalDocument(
      '14.2 EARLY TERMINATION\nTenant pays early termination charge of two months rent if vacating early.',
      'Rental_Agreement.pdf',
      null,
      false
    );
    const res = await askDocumentQuestion('What happens if I terminate early?', analysis);
    expect(res.found).toBe(true);
    expect(res.answer).toMatch(/terminate|charge|pay/i);
    expect(res.sources.length).toBeGreaterThan(0);
  });

  it('answers "Can the agreement renew automatically?" accurately', async () => {
    const analysis = await analyzeLegalDocument(
      '3.4 AUTOMATIC RENEWAL\nAgreement automatically renews for successive 12-month term.',
      'Rental_Agreement.pdf',
      null,
      false
    );
    const res = await askDocumentQuestion('Can the agreement renew automatically?', analysis);
    expect(res.found).toBe(true);
    expect(res.answer).toMatch(/renew|automatically/i);
    expect(res.sources.length).toBeGreaterThan(0);
  });

  it('honestly reports when information is missing without hallucination', () => {
    const missingResult = answerQuestionFromDocument('Are pets allowed in the swimming pool?', sampleSections);
    expect(missingResult.found).toBe(false);
    expect(missingResult.answer).toBe("I couldn't find information about this in the uploaded document.");
  });

  it('strictly prevents security deposit leakage into Employment contracts', async () => {
    const empAnalysis = await analyzeLegalDocument(
      `EMPLOYMENT AGREEMENT\n1.0 POSITION\nSenior Architect.\n4.0 NOTICE PERIOD\n30 days written notice.\n7.0 INTELLECTUAL PROPERTY\nCompany owns all inventions.`,
      'Employment_Contract.pdf',
      null,
      false
    );

    expect(empAnalysis.documentType).toBe('Employment Contract');
    // Ensure no deposit clause in important points
    expect(empAnalysis.importantPoints.some(p => p.title.toLowerCase().includes('deposit'))).toBe(false);

    // Asking about deposit on Employment Contract must honestly reject, not return Clause 8.3!
    const res = await askDocumentQuestion('When will I get my deposit back?', empAnalysis, {
      title: 'Employment Contract',
      rawContent: 'Senior Architect employment terms.'
    });

    expect(res.found).toBe(false);
    expect(res.answer).toContain("I couldn't find any information about a security deposit in this document");
    expect(res.answer).toContain('Employment Contract');
    expect(res.sources).toEqual([]);
  });

  it('strictly prevents security deposit leakage into NDAs', async () => {
    const ndaAnalysis = await analyzeLegalDocument(
      `MUTUAL NDA\n1.0 PURPOSE\nProprietary discussions.\n3.0 CARE\nReasonable care.\n5.0 TERM\nThree years duration.`,
      'Mutual_NDA.docx',
      null,
      false
    );

    expect(ndaAnalysis.documentType).toBe('Non-Disclosure Agreement (NDA)');
    expect(ndaAnalysis.importantPoints.some(p => p.title.toLowerCase().includes('deposit'))).toBe(false);

    const res = await askDocumentQuestion('When will I get my deposit back?', ndaAnalysis, {
      title: 'Mutual NDA',
      rawContent: 'Proprietary non-disclosure terms.'
    });

    expect(res.found).toBe(false);
    expect(res.answer).toContain("I couldn't find any information about a security deposit in this document");
    expect(res.sources).toEqual([]);
  });
});
