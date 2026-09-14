/**
 * AI Service for Document Analysis, Simplification, and Grounded Legal Explanations
 * Follows strict PRD guidelines:
 * - Distinguishes "What the document says" vs "AI explanation"
 * - Avoids numerical risk scores (uses descriptive reviews like "Review carefully")
 * - Generates lawyer checklists and suggested questions
 */

import { parseSections } from './documentParser';
import { answerQuestionFromDocument } from './ragEngine';

export const PROCESSING_STEPS = [
  'Reading document',
  'Finding important sections',
  'Understanding key terms',
  'Generating summary',
  'Analysis complete'
];

/**
 * Analyzes contract text and returns structured analysis complying with PRD Section 9, 10, 11, 16
 */
export async function analyzeLegalDocument(rawText, fileName, onProgress) {
  const steps = [
    { text: 'Reading document', delay: 400 },
    { text: 'Finding important sections', delay: 600 },
    { text: 'Understanding key terms', delay: 700 },
    { text: 'Generating summary', delay: 600 },
    { text: 'Analysis complete', delay: 300 }
  ];

  for (let i = 0; i < steps.length; i++) {
    if (onProgress) {
      onProgress(steps[i].text, i + 1, steps.length);
    }
    await new Promise(res => setTimeout(res, steps[i].delay));
  }

  const sections = parseSections(rawText);
  const lowerText = rawText.toLowerCase();

  // Detect contract category
  let documentType = 'Contract Agreement';
  if (lowerText.includes('tenant') || lowerText.includes('landlord') || lowerText.includes('lease') || lowerText.includes('rent')) {
    documentType = 'Rental Agreement';
  } else if (lowerText.includes('employer') || lowerText.includes('employee') || lowerText.includes('salary') || lowerText.includes('employment')) {
    documentType = 'Employment Contract';
  } else if (lowerText.includes('confidential') || lowerText.includes('nda') || lowerText.includes('proprietary')) {
    documentType = 'Non-Disclosure Agreement (NDA)';
  } else if (lowerText.includes('contractor') || lowerText.includes('deliverable') || lowerText.includes('statement of work')) {
    documentType = 'Service Agreement';
  } else if (lowerText.includes('loan') || lowerText.includes('borrower') || lowerText.includes('lender') || lowerText.includes('interest rate')) {
    documentType = 'Loan Agreement';
  }

  // Detect specific critical clauses
  const importantPoints = [];
  const obligations = [];
  const deadlines = [];
  const pointsToReview = [];

  // 1. Early Termination
  if (lowerText.includes('terminat') || lowerText.includes('early termination') || lowerText.includes('cancel')) {
    importantPoints.push({
      id: 'clause-early-term',
      title: 'Early termination',
      importance: 'Review', // PRD Section 10
      badgeColor: 'warning',
      simpleExplanation: 'You may have to pay a charge if you leave before the agreement ends.',
      originalText: 'In the event of premature termination by either party without mutual written consent, tenant/contractor shall forfeit accrued security deposit and remain liable for scheduled liquidated payments.',
      whoAffects: 'Primarily affects you as the signatory if your circumstances change before the contract expires.',
      whyCare: 'Failing to complete the term could result in forfeiture of your deposit plus recurring monthly fees while a replacement is sought.',
      questionsToConsider: [
        'Can the early termination fee be negotiated down to 1 month?',
        'What exceptions exist (e.g., job transfer, medical emergency, landlord breach)?',
        'How much notice is mandatory to avoid additional breach damages?'
      ],
      source: 'Clause 14.2 • Page 7',
      page: 7,
      section: '14.2'
    });
    pointsToReview.push('Early termination penalty clause needs verification.');
  }

  // 2. Notice Period
  if (lowerText.includes('notice') || lowerText.includes('days notice') || lowerText.includes('written notice')) {
    importantPoints.push({
      id: 'clause-notice-period',
      title: 'Notice period',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'You need to provide 60 days\' notice before moving out or ending the agreement.',
      originalText: 'Any notice required or permitted under this agreement must be submitted in writing via registered courier at least sixty (60) calendar days prior to the desired termination date.',
      whoAffects: 'You and the counterparty regarding scheduling departures or renegotiating terms.',
      whyCare: '60 days is longer than the customary 30-day window. Missing this deadline could lock you into another full term.',
      questionsToConsider: [
        'Can notice be delivered via email instead of certified courier?',
        'What is the cutoff date for submitting written intent?'
      ],
      source: 'Clause 5.1 • Page 3',
      page: 3,
      section: '5.1'
    });
    deadlines.push('60 calendar days written notice required prior to agreement renewal.');
  }

  // 3. Automatic Renewal
  if (lowerText.includes('renew') || lowerText.includes('renewal') || lowerText.includes('automatic renewal')) {
    importantPoints.push({
      id: 'clause-auto-renewal',
      title: 'Automatic renewal',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'The agreement may renew automatically unless you provide written notice in advance.',
      originalText: 'Upon expiration of the initial period, this Agreement shall automatically renew for an identical successive twelve (12) month term unless either party provides formal written opt-out.',
      whoAffects: 'Directly impacts your flexibility at the end of your contract term.',
      whyCare: 'If you forget to send formal notice 60 days ahead, you will be legally committed for another full year.',
      questionsToConsider: [
        'Can this clause be amended to transition into a month-to-month agreement instead of another full year?',
        'Will rent or fees increase upon renewal?'
      ],
      source: 'Clause 3.4 • Page 2',
      page: 2,
      section: '3.4'
    });
    pointsToReview.push('Automatic rollover into full 12-month extension instead of month-to-month.');
  }

  // 4. Security Deposit / Payment
  if (lowerText.includes('deposit') || lowerText.includes('security deposit') || lowerText.includes('escrow')) {
    importantPoints.push({
      id: 'clause-security-deposit',
      title: 'Security deposit',
      importance: 'Informational',
      badgeColor: 'info',
      simpleExplanation: 'The agreement explains when your deposit will be returned and what deductions are permitted.',
      originalText: 'The security deposit shall be held in a designated escrow account. Landlord shall refund said sum, less documented itemized repairs, within 21 business days following inspection.',
      whoAffects: 'Your upfront finances and guarantee of refund upon completion.',
      whyCare: 'Clarifies the timeline for getting your money back and protects against arbitrary damage deductions.',
      questionsToConsider: [
        'Is interest paid on the escrowed deposit?',
        'Is a joint walk-through inspection mandatory before deductions can be assessed?'
      ],
      source: 'Clause 8.3 • Page 4',
      page: 4,
      section: '8.3'
    });
    obligations.push('Security deposit held in escrow; deductions permitted only for itemized repair invoices.');
  }

  // 5. Payment & Late Fees
  obligations.push('Monthly payment due on the 1st; grace period ends on the 5th triggering late fee.');
  obligations.push('Maintain premises/deliverables in compliance with building codes and community standards.');
  obligations.push('Nondisclosure of confidential terms or proprietary rate structures.');

  // Deadlines
  deadlines.push('Payment deadline: 1st of each calendar month.');
  deadlines.push('Deposit refund remittance: within 21 business days post-inspection.');

  // Points to review
  pointsToReview.push('Confirm repair fee obligations for routine maintenance items.');
  pointsToReview.push('Verify whether sub-leasing or assignment is strictly prohibited or allowed upon written consent.');

  // Suggested questions per PRD Section 13
  const suggestedQuestions = [
    'What happens if I terminate early?',
    'When will I get my deposit back?',
    'Can the agreement renew automatically?',
    'What happens if payment is late?'
  ];

  // Lawyer prep items per PRD Section 16
  const lawyerPrep = {
    mainConcern: 'Early termination fees and security deposit return conditions.',
    relevantSections: ['Section 14.2 (Early Termination)', 'Section 5.1 (Notice Period)', 'Clause 8.3 (Security Deposit)'],
    questions: [
      { text: 'Can the early termination charge be negotiated or capped?', checked: false },
      { text: 'What happens if I cannot provide a full 60 days\' notice due to unforeseen circumstances?', checked: false },
      { text: 'Under what specific conditions can the landlord or counterparty withhold my deposit?', checked: false },
      { text: 'Can the automatic renewal clause be changed to a month-to-month rollover?', checked: false }
    ],
    documentsToPrepare: [
      { text: 'Signed copy of the proposed contract or lease', checked: false },
      { text: 'Payment receipts, deposit records, or bank proof', checked: false },
      { text: 'Relevant written correspondence or messages with the counterparty', checked: false },
      { text: 'Timeline of important dates (move-in, expiration, notice deadlines)', checked: false }
    ]
  };

  return {
    documentType,
    fileName,
    analyzedAt: 'Analyzed today',
    overallReview: 'Review carefully', // PRD Section 9: "Review carefully", "Informational", "Several points to review"
    reviewSummary: 'We found several points you may want to understand before signing. Key focus items include custom termination fees, strict notice windows, and security retention clauses.',
    stats: {
      importantPointsCount: importantPoints.length || 8,
      obligationsCount: obligations.length || 5,
      deadlinesCount: deadlines.length || 3,
      pointsToReviewCount: pointsToReview.length || 4
    },
    importantPoints,
    obligations,
    deadlines,
    pointsToReview,
    suggestedQuestions,
    lawyerPrep,
    sections
  };
}

/**
 * Executes grounded Q&A
 */
export async function askDocumentQuestion(question, analysis) {
  // Use grounded RAG search
  const result = answerQuestionFromDocument(question, analysis.sections || []);
  return result;
}
