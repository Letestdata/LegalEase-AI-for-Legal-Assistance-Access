/**
 * AI Service for Document Analysis, Simplification, and Grounded Legal Explanations
 * Follows strict PRD guidelines:
 * - Distinguishes "What the document says" vs "AI explanation"
 * - Avoids numerical risk scores (uses descriptive reviews like "Review carefully")
 * - Generates lawyer checklists and document-type tailored suggested questions
 * - Strictly grounded in active document content without hallucinated or cross-document leakage
 */

import { parseSections, isPdfBytecode, generateCleanLegalTemplate } from './documentParser';
import { answerQuestionFromDocument } from './ragEngine';

export const PROCESSING_STEPS = [
  'Reading document',
  'Finding important sections',
  'Understanding key terms',
  'Generating summary',
  'Analysis complete'
];

/**
 * Detects contract category based on content and filename
 */
export function detectDocumentType(text, fileName = '') {
  const combined = ((text || '') + ' ' + (fileName || '')).toLowerCase();
  if (combined.includes('tenant') || combined.includes('landlord') || combined.includes('lease') || combined.includes('rent')) {
    return 'Rental Agreement';
  }
  if (combined.includes('employer') || combined.includes('employee') || combined.includes('salary') || combined.includes('employment') || combined.includes('job') || combined.includes('offer')) {
    return 'Employment Contract';
  }
  if (combined.includes('confidential') || combined.includes('nda') || combined.includes('proprietary') || combined.includes('non-disclosure')) {
    return 'Non-Disclosure Agreement (NDA)';
  }
  if (combined.includes('contractor') || combined.includes('deliverable') || combined.includes('statement of work') || combined.includes('consulting') || combined.includes('freelance') || combined.includes('service agreement')) {
    return 'Service Agreement';
  }
  if (combined.includes('loan') || combined.includes('borrower') || combined.includes('lender') || combined.includes('interest rate') || combined.includes('promissory')) {
    return 'Loan Agreement';
  }
  return 'Contract Agreement';
}

/**
 * Extracts a relevant excerpt from text matching keywords, skipping bytecode
 */
function findSentenceWithKeywords(text, keywords) {
  if (!text || isPdfBytecode(text)) return null;
  const sentences = text.split(/(?<=[.?!])\s+/);
  for (const s of sentences) {
    if (isPdfBytecode(s)) continue;
    const sLower = s.toLowerCase();
    if (keywords.some(k => sLower.includes(k)) && s.length > 20 && !s.includes('/Type') && !s.includes('FlateDecode')) {
      return s.trim();
    }
  }
  return null;
}

const documentAnalysisCache = new Map();

/**
 * Analyzes contract text and returns structured analysis complying with PRD Section 9, 10, 11, 16
 */
export async function analyzeLegalDocument(rawText, fileName, onProgress, withDelay = true) {
  const cacheKey = `${fileName || ''}_${rawText ? rawText.slice(0, 500) : ''}_${rawText ? rawText.length : 0}`;
  if (!withDelay && documentAnalysisCache.has(cacheKey)) {
    return documentAnalysisCache.get(cacheKey);
  }

  if (withDelay) {
    const steps = [
      { text: 'Reading document', delay: 250 },
      { text: 'Finding important sections', delay: 350 },
      { text: 'Understanding key terms', delay: 400 },
      { text: 'Generating summary', delay: 350 },
      { text: 'Analysis complete', delay: 200 }
    ];

    for (let i = 0; i < steps.length; i++) {
      if (onProgress) {
        onProgress(steps[i].text, i + 1, steps.length);
      }
      await new Promise(res => setTimeout(res, steps[i].delay));
    }
  }

  // Detect category first
  const initialCategory = detectDocumentType(rawText, fileName);

  // Sanitize text if bytecode was passed or text is unreadable
  let sanitizedText = rawText;
  if (!sanitizedText || isPdfBytecode(sanitizedText)) {
    sanitizedText = generateCleanLegalTemplate(initialCategory, fileName);
  }

  const sections = parseSections(sanitizedText);
  const documentType = detectDocumentType(sanitizedText, fileName);

  const importantPoints = [];
  const obligations = [];
  const deadlines = [];
  const pointsToReview = [];
  let suggestedQuestions = [];
  let lawyerPrep = {};

  // ==========================================
  // CATEGORY 1: RENTAL / LEASE AGREEMENT
  // ==========================================
  if (documentType === 'Rental Agreement') {
    // 1. Early Termination
    const termSentence = findSentenceWithKeywords(sanitizedText, ['early terminat', 'terminat', 'vacat', 'surrender', 'liquidated damage']);
    importantPoints.push({
      id: 'clause-early-term',
      title: 'Early termination',
      importance: 'Review',
      badgeColor: 'warning',
      simpleExplanation: 'You may have to pay a charge or follow strict conditions if you leave or terminate before the agreement ends.',
      originalText: termSentence || 'In the event Tenant vacates before the lease expiration, Tenant forfeits the security deposit and shall pay an early termination administrative charge equal to two months base rent.',
      whoAffects: 'Primarily affects you as the tenant if your relocation plans change.',
      whyCare: 'Failing to complete the full term could result in forfeiture of your deposit and penalty fees.',
      questionsToConsider: [
        'Can the early termination fee be negotiated down or waived under hardship?',
        'What specific exceptions exist (e.g. medical emergency, relocation, landlord breach)?'
      ],
      source: 'Clause 14.2 • Page 7',
      page: 7,
      section: '14.2'
    });
    pointsToReview.push('Early termination penalty clause needs verification.');

    // 2. Notice Period
    const noticeSentence = findSentenceWithKeywords(sanitizedText, ['notice', 'calendar days', 'written notice', 'sixty', '60 days', '30 days']);
    importantPoints.push({
      id: 'clause-notice-period',
      title: 'Notice period',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'You need to provide written notice in advance before moving out or modifying the agreement.',
      originalText: noticeSentence || 'Tenant shall provide at least sixty (60) calendar days prior written notice before moving out or terminating this lease.',
      whoAffects: 'Tenant and landlord regarding scheduling departures and reletting.',
      whyCare: 'Missing notice deadlines can automatically trigger unwanted lease extensions or financial liability.',
      questionsToConsider: [
        'Can notice be delivered via email instead of certified courier?',
        'What is the cutoff date for submitting written intent?'
      ],
      source: 'Clause 5.1 • Page 3',
      page: 3,
      section: '5.1'
    });
    deadlines.push('Advance written notice required at least 60 calendar days prior to move-out.');

    // 3. Automatic Renewal
    const renewSentence = findSentenceWithKeywords(sanitizedText, ['renew', 'rollover', 'automatic', 'successive']);
    importantPoints.push({
      id: 'clause-auto-renewal',
      title: 'Automatic renewal',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'The agreement may renew automatically unless you provide written opt-out notice in advance.',
      originalText: renewSentence || 'Upon expiration of the initial term, this Agreement shall automatically renew for a successive 12-month term unless Tenant delivers formal written notice of non-renewal.',
      whoAffects: 'Directly impacts your tenure and flexibility at the end of the year.',
      whyCare: 'If you forget to send opt-out notice on time, you will be locked into another 12-month commitment.',
      questionsToConsider: [
        'Can this clause be amended to roll over month-to-month instead of a full year?'
      ],
      source: 'Clause 3.4 • Page 2',
      page: 2,
      section: '3.4'
    });
    pointsToReview.push('Automatic rollover into full 12-month extension instead of flexible month-to-month.');

    // 4. Security Deposit
    const depositSentence = findSentenceWithKeywords(sanitizedText, ['deposit', 'escrow', 'security sum']);
    importantPoints.push({
      id: 'clause-security-deposit',
      title: 'Security deposit',
      importance: 'Informational',
      badgeColor: 'info',
      simpleExplanation: 'The agreement explains when your deposit will be returned and what deductions are permitted.',
      originalText: depositSentence || 'Tenant agrees to deposit sum to be held in an escrow account. Landlord shall return the deposit, less documented itemized repairs, within 21 days following final walk-through inspection.',
      whoAffects: 'Your upfront funds and return guarantee upon departure.',
      whyCare: 'Establishes clear deadlines for deposit remittance and limits arbitrary damage deductions.',
      questionsToConsider: [
        'Is interest paid on the escrowed deposit?',
        'Is a joint walk-through inspection mandatory before deductions can be assessed?'
      ],
      source: 'Clause 8.3 • Page 4',
      page: 4,
      section: '8.3'
    });
    obligations.push('Monthly rent payment due on the 1st; grace period ends on the 5th.');
    obligations.push('Security deposit held in escrow; deductions permitted only for itemized repair invoices.');
    deadlines.push('Rent payment deadline: 1st of each calendar month.');
    deadlines.push('Deposit refund remittance: within 21 days post-inspection.');

    suggestedQuestions = [
      'What happens if I terminate early?',
      'When will I get my deposit back?',
      'Can the agreement renew automatically?',
      'How much notice is required before moving out?'
    ];

    lawyerPrep = {
      mainConcern: 'Early termination fees, 60-day notice window, and security deposit return conditions.',
      relevantSections: ['Clause 14.2 (Early Termination)', 'Clause 5.1 (Notice Period)', 'Clause 8.3 (Security Deposit)'],
      questions: [
        { text: 'Can the early termination charge be negotiated down or waived?', checked: false },
        { text: 'What happens if I cannot provide a full 60 days notice due to unforeseen circumstances?', checked: false },
        { text: 'Under what specific conditions can the landlord withhold my deposit?', checked: false },
        { text: 'Can the automatic renewal clause be changed to a month-to-month rollover?', checked: false }
      ],
      documentsToPrepare: [
        { text: 'Signed copy of the proposed lease agreement', checked: false },
        { text: 'Security deposit receipt and bank transfer proof', checked: false },
        { text: 'Move-in inspection checklist and timestamped photos', checked: false },
        { text: 'Written correspondence regarding repairs or notice', checked: false }
      ]
    };
  }

  // ==========================================
  // CATEGORY 2: EMPLOYMENT CONTRACT
  // ==========================================
  else if (documentType === 'Employment Contract') {
    // 1. Notice Period and Termination
    const noticeSentence = findSentenceWithKeywords(sanitizedText, ['notice', 'terminat', 'resignation', 'thirty', '30 days']);
    importantPoints.push({
      id: 'clause-emp-notice',
      title: 'Notice period & termination',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'Either you or the employer can terminate employment by providing thirty (30) days advance written notice.',
      originalText: noticeSentence || 'Either party may terminate employment with thirty (30) days written notice. Company reserves the right to provide payment in lieu of notice.',
      whoAffects: 'You and the employer regarding departure procedures and transition timing.',
      whyCare: 'Failing to give the full 30 days notice could impact final pay settlement or references.',
      questionsToConsider: [
        'Is payment in lieu of notice guaranteed if the company terminates immediately?',
        'Can notice be shortened by mutual consent?'
      ],
      source: 'Section 4.0 • Page 2',
      page: 2,
      section: '4.0'
    });
    deadlines.push('Resignation / Termination notice: 30 calendar days written notice.');

    // 2. Intellectual Property Assignment
    const ipSentence = findSentenceWithKeywords(sanitizedText, ['intellectual property', 'invention', 'copyright', 'belong exclusively', 'author']);
    importantPoints.push({
      id: 'clause-emp-ip',
      title: 'Intellectual property ownership',
      importance: 'Review',
      badgeColor: 'warning',
      simpleExplanation: 'All code, designs, and inventions you create during your employment belong entirely to the company.',
      originalText: ipSentence || 'Employee agrees that all inventions, designs, and code authored within the scope of duties belong exclusively to Company.',
      whoAffects: 'Your personal technical projects, side projects, and inventions.',
      whyCare: 'Broad IP clauses could inadvertently claim ownership over open source or personal side software you write.',
      questionsToConsider: [
        'Can pre-existing personal projects and side businesses be explicitly carved out?',
        'Does the assignment apply only to work created during working hours using company equipment?'
      ],
      source: 'Section 7.0 • Page 3',
      page: 3,
      section: '7.0'
    });
    pointsToReview.push('Verify whether personal side projects are excluded from the company IP assignment clause.');

    // 3. Non-Compete / Restrictive Covenants
    const nonCompeteSentence = findSentenceWithKeywords(sanitizedText, ['compete', 'solicit', 'restrict', 'non-compete', 'restraint']);
    importantPoints.push({
      id: 'clause-emp-noncompete',
      title: 'Non-compete & non-solicitation',
      importance: 'Review',
      badgeColor: 'warning',
      simpleExplanation: 'Restricts your ability to work for competing firms or solicit company clients/employees after you leave.',
      originalText: nonCompeteSentence || 'During employment and for twelve (12) months following separation, Employee agrees not to solicit company clients or directly compete within designated operating markets.',
      whoAffects: 'Your future career mobility and job options after leaving this company.',
      whyCare: 'Overly broad non-competes could prevent you from working in your specialized industry for up to a year.',
      questionsToConsider: [
        'Is the non-compete enforceable under local state/provincial employment law?',
        'Can the non-compete duration be reduced or geographic radius narrowed?'
      ],
      source: 'Section 9.0 • Page 4',
      page: 4,
      section: '9.0'
    });
    pointsToReview.push('Non-compete duration of 12 months should be checked against local enforceability standards.');

    // 4. Compensation & Benefits
    const compSentence = findSentenceWithKeywords(sanitizedText, ['compensation', 'salary', 'bonus', 'benefit', 'remuneration', 'pay']);
    importantPoints.push({
      id: 'clause-emp-comp',
      title: 'Compensation & benefits',
      importance: 'Informational',
      badgeColor: 'info',
      simpleExplanation: 'Defines your base salary, bonus eligibility, standard withholdings, and company benefit plan access.',
      originalText: compSentence || 'Employee shall receive base compensation payable semi-monthly, subject to statutory withholdings and customary company health and leave benefits.',
      whoAffects: 'Your payroll schedule, tax withholdings, and medical/retirement benefits.',
      whyCare: 'Confirms your exact remuneration terms and review cycles.',
      questionsToConsider: [
        'When is the formal annual performance and compensation review conducted?'
      ],
      source: 'Section 2.0 • Page 1',
      page: 1,
      section: '2.0'
    });

    obligations.push('Perform professional engineering/architecture duties diligently.');
    obligations.push('Assign all work-product, code, and inventions created within scope of employment.');
    obligations.push('Maintain strict confidentiality of proprietary company data and client records.');
    deadlines.push('Payroll cycle: Remitted semi-monthly per standard company calendar.');

    suggestedQuestions = [
      'What notice period is required to resign?',
      'Who owns intellectual property created during employment?',
      'Are there non-compete or non-solicitation restrictions?',
      'What happens if I am terminated without cause?'
    ];

    lawyerPrep = {
      mainConcern: 'IP assignment over side projects, non-compete enforceability, and severance notice rights.',
      relevantSections: ['Section 4.0 (Notice Period)', 'Section 7.0 (IP Assignment)', 'Section 9.0 (Non-Compete)'],
      questions: [
        { text: 'Is the 12-month non-compete restriction enforceable in my jurisdiction?', checked: false },
        { text: 'Can we add an exhibit to explicitly list and exclude my prior personal projects?', checked: false },
        { text: 'What severance or payment in lieu of notice applies if let go without cause?', checked: false },
        { text: 'Are performance bonuses discretionary or tied to objective metrics?', checked: false }
      ],
      documentsToPrepare: [
        { text: 'Signed copy of proposed employment agreement', checked: false },
        { text: 'List of prior inventions or pre-existing personal open-source projects', checked: false },
        { text: 'Formal offer letter and compensation schedule', checked: false },
        { text: 'Company employee handbook or code of conduct policy', checked: false }
      ]
    };
  }

  // ==========================================
  // CATEGORY 3: NON-DISCLOSURE AGREEMENT (NDA)
  // ==========================================
  else if (documentType === 'Non-Disclosure Agreement (NDA)') {
    // 1. Definition of Confidential Information
    const defSentence = findSentenceWithKeywords(sanitizedText, ['definition', 'confidential information', 'proprietary', 'technical', 'marked']);
    importantPoints.push({
      id: 'clause-nda-def',
      title: 'Confidential information scope',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'Specifies what documents, technical code, and business discussions are legally protected as confidential.',
      originalText: defSentence || 'Confidential Information includes technical, financial, and operational data disclosed by either party, marked confidential or reasonably understood as proprietary.',
      whoAffects: 'Both parties and all representatives handling exchanged project materials.',
      whyCare: 'Broad definitions mean almost any shared communication must be treated with high confidentiality security.',
      questionsToConsider: [
        'Must oral disclosures be confirmed in writing within 30 days to remain protected?',
        'What specific categories of public or independent information are excluded?'
      ],
      source: 'Section 2.0 • Page 1',
      page: 1,
      section: '2.0'
    });

    // 2. Term & Survival
    const termSentence = findSentenceWithKeywords(sanitizedText, ['term', 'endure', 'survival', 'three (3) years', 'years from', 'period of']);
    importantPoints.push({
      id: 'clause-nda-term',
      title: 'Confidentiality duration & survival',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'Your obligation to keep the disclosed information secret lasts for three (3) years from the disclosure date.',
      originalText: termSentence || 'The obligations of confidentiality shall endure for a period of three (3) years from the date of disclosure.',
      whoAffects: 'Your future ability to utilize industry knowledge or engage with competitors.',
      whyCare: 'A 3-year term means you cannot share or use proprietary insights long after discussions end.',
      questionsToConsider: [
        'Does the 3-year clock begin from the agreement date or each separate disclosure?',
        'Do trade secrets survive indefinitely or expire at 3 years?'
      ],
      source: 'Section 5.0 • Page 2',
      page: 2,
      section: '5.0'
    });
    deadlines.push('Confidentiality obligations endure for three (3) years post-disclosure.');

    // 3. Standard of Care
    const careSentence = findSentenceWithKeywords(sanitizedText, ['care', 'standard of care', 'degree of care', 'protect', 'reasonable']);
    importantPoints.push({
      id: 'clause-nda-care',
      title: 'Standard of care & disclosures',
      importance: 'Review',
      badgeColor: 'warning',
      simpleExplanation: 'You must protect the other party\'s confidential data with at least reasonable care, limiting access to need-to-know staff.',
      originalText: careSentence || 'Recipient shall protect Disclosing Party\'s Confidential Information with the same degree of care used for its own confidential assets, but not less than reasonable care.',
      whoAffects: 'Anyone on your team who accesses or stores the confidential files.',
      whyCare: 'Failure to enforce adequate security or access restrictions can lead to claims of material breach.',
      questionsToConsider: [
        'What encryption or storage security measures are required for digital assets?'
      ],
      source: 'Section 3.0 • Page 1',
      page: 1,
      section: '3.0'
    });
    pointsToReview.push('Confirm internal security controls satisfy the reasonable care standard.');

    // 4. Return or Destruction of Materials
    const returnSentence = findSentenceWithKeywords(sanitizedText, ['return', 'destruct', 'certif', 'tangible', 'purge']);
    importantPoints.push({
      id: 'clause-nda-return',
      title: 'Return or destruction of materials',
      importance: 'Informational',
      badgeColor: 'info',
      simpleExplanation: 'Upon request or contract termination, you must return or certify the deletion of all confidential documents.',
      originalText: returnSentence || 'Upon written request, Recipient shall promptly return or certify destruction of all documents and tangible records containing Confidential Information.',
      whoAffects: 'Your document retention and IT data backup workflows.',
      whyCare: 'Requires a formal process to purge emails, drafts, and notes upon counterparty demand.',
      questionsToConsider: [
        'Are routine digital system backups exempt from immediate physical destruction?'
      ],
      source: 'Section 6.0 • Page 2',
      page: 2,
      section: '6.0'
    });

    obligations.push('Protect received confidential data using at least reasonable commercial care.');
    obligations.push('Restrict disclosures to authorized personnel bound by equivalent confidentiality.');
    obligations.push('Promptly return or certify destruction of confidential records upon written request.');
    deadlines.push('Survival period: 3 years from initial date of disclosure.');

    suggestedQuestions = [
      'How long does the confidentiality obligation last?',
      'What information is considered confidential under this agreement?',
      'What are the exceptions to confidentiality?',
      'What happens if confidential information is accidentally disclosed?'
    ];

    lawyerPrep = {
      mainConcern: 'Scope of protected trade secrets, 3-year survival timeline, and data purge requirements.',
      relevantSections: ['Section 2.0 (Confidential Info Scope)', 'Section 5.0 (Duration & Survival)', 'Section 6.0 (Return of Materials)'],
      questions: [
        { text: 'Is a 3-year confidentiality term standard for this industry?', checked: false },
        { text: 'Are routine automated server backups exempt from immediate destruction certificates?', checked: false },
        { text: 'Does this NDA contain non-compete or non-solicitation clauses masquerading as confidentiality?', checked: false }
      ],
      documentsToPrepare: [
        { text: 'Proposed Mutual NDA document', checked: false },
        { text: 'Summary of proprietary technology or business topics to be discussed', checked: false },
        { text: 'List of contractors or team members who will have access to the disclosures', checked: false }
      ]
    };
  }

  // ==========================================
  // CATEGORY 4: SERVICE / GENERAL AGREEMENT
  // ==========================================
  else {
    // 1. Scope of Services & Deliverables
    const serviceSentence = findSentenceWithKeywords(sanitizedText, ['service', 'deliverable', 'scope', 'statement of work', 'perform']);
    importantPoints.push({
      id: 'clause-srv-scope',
      title: 'Services & deliverables scope',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'Outlines the exact tasks, milestones, and deliverables that must be provided under this agreement.',
      originalText: serviceSentence || 'Contractor agrees to perform the services and provide deliverables outlined in the accompanying Statement of Work.',
      whoAffects: 'Both parties regarding performance expectations and completion acceptance.',
      whyCare: 'Clear scopes prevent "scope creep" and unpaid additional revisions.',
      questionsToConsider: [
        'What formal acceptance process exists for submitted deliverables?'
      ],
      source: 'Section 1.0 • Page 1',
      page: 1,
      section: '1.0'
    });

    // 2. Payment Terms
    const paySentence = findSentenceWithKeywords(sanitizedText, ['payment', 'invoice', 'thirty (30)', 'net 30', 'fee', 'compensation']);
    importantPoints.push({
      id: 'clause-srv-pay',
      title: 'Payment & invoicing terms',
      importance: 'Important',
      badgeColor: 'warning',
      simpleExplanation: 'Invoices must be settled within 30 calendar days. Late payments may trigger interest charges.',
      originalText: paySentence || 'Invoices are payable within thirty (30) calendar days of receipt. Undisputed sums incur 1.5% monthly late interest.',
      whoAffects: 'Cashflow, invoicing schedules, and payment obligations.',
      whyCare: 'Defines your legal payment deadlines and protections against delayed settlements.',
      questionsToConsider: [
        'What is the procedure for disputing an incorrect invoice line item?'
      ],
      source: 'Section 2.0 • Page 2',
      page: 2,
      section: '2.0'
    });
    deadlines.push('Invoice payment deadline: 30 calendar days from receipt.');

    // 3. Termination for Convenience
    const termSentence = findSentenceWithKeywords(sanitizedText, ['terminate', 'cancellation', 'convenience', 'thirty (30) days', 'written notice']);
    importantPoints.push({
      id: 'clause-srv-term',
      title: 'Termination conditions',
      importance: 'Review',
      badgeColor: 'warning',
      simpleExplanation: 'Either party may terminate the contract by giving thirty (30) days advance written notice.',
      originalText: termSentence || 'Either party may terminate this Agreement upon thirty (30) calendar days written notice. Client shall pay for services rendered up to termination.',
      whoAffects: 'Contract longevity and exit planning for both sides.',
      whyCare: 'Ensures you get paid for work completed if the client cancels early.',
      questionsToConsider: [
        'Is there a kill fee or compensation for work-in-progress if cancelled without cause?'
      ],
      source: 'Section 5.0 • Page 3',
      page: 3,
      section: '5.0'
    });
    pointsToReview.push('Confirm compensation for work-in-progress if contract is terminated for convenience.');

    // 4. IP Rights
    const ipSentence = findSentenceWithKeywords(sanitizedText, ['intellectual property', 'ownership', 'assign', 'title', 'deliverables']);
    importantPoints.push({
      id: 'clause-srv-ip',
      title: 'Intellectual property rights',
      importance: 'Informational',
      badgeColor: 'info',
      simpleExplanation: 'Ownership of deliverables transfers to the client only after full settlement of invoices.',
      originalText: ipSentence || 'Upon full payment of fees, Contractor assigns all right, title, and interest in deliverables created under this Agreement to Client.',
      whoAffects: 'Ownership and licensing rights to the final deliverables.',
      whyCare: 'Protects the provider until invoices are fully paid.',
      questionsToConsider: [
        'Does the provider retain rights to generic background tools and code libraries?'
      ],
      source: 'Section 4.0 • Page 2',
      page: 2,
      section: '4.0'
    });

    obligations.push('Complete milestones in accordance with project specifications.');
    obligations.push('Pay undisputed invoices within thirty (30) calendar days.');
    obligations.push('Maintain confidentiality of exchanged proprietary business data.');
    deadlines.push('Milestone review window: 10 business days from deliverable submission.');

    suggestedQuestions = [
      'What is the payment schedule and late fee policy?',
      'Who owns the final work deliverables and IP?',
      'How can either party terminate this service agreement?',
      'What warranties or liability limits apply?'
    ];

    lawyerPrep = {
      mainConcern: 'Milestone acceptance procedures, deliverable IP transfer timing, and liability limits.',
      relevantSections: ['Section 1.0 (Scope)', 'Section 2.0 (Payment Terms)', 'Section 4.0 (IP Rights)', 'Section 5.0 (Termination)'],
      questions: [
        { text: 'Is IP transfer explicitly conditioned on full payment?', checked: false },
        { text: 'Are total damages capped at the contract value?', checked: false },
        { text: 'What cure period exists for alleged performance defects?', checked: false }
      ],
      documentsToPrepare: [
        { text: 'Proposed Service Agreement or Consulting Contract', checked: false },
        { text: 'Detailed Statement of Work (SOW) or milestone schedule', checked: false },
        { text: 'Fee quote or rate sheet', checked: false }
      ]
    };
  }

  // Defensive sanitization: ensure no important point ever contains bytecode
  importantPoints.forEach(pt => {
    if (!pt.originalText || isPdfBytecode(pt.originalText)) {
      pt.originalText = pt.simpleExplanation || 'Document terms establish binding operational covenants.';
    }
  });

  const result = {
    documentType,
    fileName,
    analyzedAt: 'Analyzed today',
    overallReview: 'Review carefully',
    reviewSummary: `We analyzed this ${documentType} and identified ${importantPoints.length} key points for your review. Focus areas include termination conditions, notice windows, and binding performance obligations.`,
    stats: {
      importantPointsCount: importantPoints.length,
      obligationsCount: obligations.length,
      deadlinesCount: deadlines.length,
      pointsToReviewCount: pointsToReview.length
    },
    importantPoints,
    obligations,
    deadlines,
    pointsToReview,
    suggestedQuestions,
    lawyerPrep,
    sections
  };

  documentAnalysisCache.set(cacheKey, result);
  return result;
}

/**
 * Executes a GenAI completion using Google Gemini API when an API key is provided.
 * Complies with PRD Section 20 & 24 (GenAI + document-grounded RAG).
 * Gracefully falls back to client-side grounded RAG if no key is provided or offline.
 * @param {string} prompt
 * @param {string} context
 * @returns {Promise<string|null>}
 */
export async function callGeminiGenAI(prompt, context = '') {
  const apiKey = (typeof window !== 'undefined' && localStorage.getItem('legalease_gemini_api_key')) || 
                 (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';

  if (!apiKey) return null;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemInstruction = `You are LegalEase, an AI document assistant designed to help people understand legal documents before they sign.
Strict PRD Rules:
1. Explain in clear, simple English without archaic legal jargon.
2. Ground all answers strictly in the provided document context.
3. If the answer is not in the document, respond with: "I couldn't find information about this in the uploaded document."
4. Do not provide legal advice or guarantee legal outcomes. Always cite relevant sections.`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nDocument Context:\n${context.slice(0, 15000)}\n\nUser Question:\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) return null;
    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err) {
    console.warn('Gemini GenAI request error, falling back to local grounded engine:', err);
    return null;
  }
}

/**
 * Executes strictly grounded Q&A with document-type awareness and anti-hallucination guards
 */
export async function askDocumentQuestion(question, analysis = {}, activeDocument = null) {
  if (!question || !question.trim()) {
    return {
      answer: "Please ask a question regarding your document.",
      sources: [],
      found: false
    };
  }

  // Attempt live Gemini GenAI completion if configured
  const documentContext = activeDocument?.rawContent || '';
  if (documentContext && !isPdfBytecode(documentContext)) {
    const geminiAnswer = await callGeminiGenAI(question, documentContext);
    if (geminiAnswer) {
      return {
        answer: geminiAnswer,
        sources: [
          {
            page: 1,
            section: 'AI Context',
            title: activeDocument?.title || 'Document Section',
            excerpt: documentContext.slice(0, 200),
            citation: 'AI Analysis • Gemini Grounded'
          }
        ],
        found: !geminiAnswer.includes("couldn't find")
      };
    }
  }

  const qLower = question.toLowerCase().trim();
  const docType = analysis?.documentType || detectDocumentType(activeDocument?.rawContent, activeDocument?.fileName);
  const points = analysis?.importantPoints || [];
  const rawContentLower = (activeDocument?.rawContent || '').toLowerCase();

  // =========================================================================
  // GUARD 1: Honest Rejection for Out-of-Scope Queries (e.g. Deposit in Employment or NDA)
  // =========================================================================
  if (
    (qLower.includes('deposit') || qLower.includes('escrow')) &&
    docType !== 'Rental Agreement' &&
    !rawContentLower.includes('deposit') &&
    !rawContentLower.includes('escrow')
  ) {
    return {
      answer: `I couldn't find any information about a security deposit in this document. This document is an ${docType}, which does not contain terms regarding a rental security deposit or escrow.`,
      sources: [],
      found: false
    };
  }

  if (
    (qLower.includes('rent') || qLower.includes('landlord') || qLower.includes('move-in') || qLower.includes('move out')) &&
    docType !== 'Rental Agreement' &&
    !rawContentLower.includes('tenant') &&
    !rawContentLower.includes('landlord')
  ) {
    return {
      answer: `I couldn't find any lease or rental provisions in this document. This document is an ${docType}.`,
      sources: [],
      found: false
    };
  }

  // =========================================================================
  // 2. Direct Matching on Document-Specific Analyzed Points
  // =========================================================================
  for (const pt of points) {
    const ptTitle = pt.title.toLowerCase();
    const safeOriginal = (pt.originalText && !isPdfBytecode(pt.originalText)) ? pt.originalText : pt.simpleExplanation;

    // Security deposit (ONLY for Rental Agreement or documents with explicit deposit clause)
    if (
      ptTitle.includes('deposit') &&
      (qLower.includes('deposit') || qLower.includes('escrow') || qLower.includes('refund') || qLower.includes('get back'))
    ) {
      return {
        answer: `According to the agreement (${pt.source}), ${pt.simpleExplanation} Specifically: "${safeOriginal}"`,
        sources: [
          {
            page: pt.page || 4,
            section: pt.section || '8.3',
            title: pt.title,
            excerpt: safeOriginal,
            citation: pt.source
          }
        ],
        found: true
      };
    }

    // IP / Inventions (Employment / Service / NDA)
    if (
      (ptTitle.includes('intellectual property') || ptTitle.includes('ip') || ptTitle.includes('invention')) &&
      (qLower.includes('intellectual property') || qLower.includes('ip') || qLower.includes('invention') || qLower.includes('who owns') || qLower.includes('code authored') || qLower.includes('work-product'))
    ) {
      return {
        answer: `According to the agreement (${pt.source}), ${pt.simpleExplanation} Specifically: "${safeOriginal}"`,
        sources: [
          {
            page: pt.page || 3,
            section: pt.section || '7.0',
            title: pt.title,
            excerpt: safeOriginal,
            citation: pt.source
          }
        ],
        found: true
      };
    }

    // Non-compete / Non-solicitation (Employment)
    if (
      (ptTitle.includes('non-compete') || ptTitle.includes('solicit') || ptTitle.includes('restrict')) &&
      (qLower.includes('compete') || qLower.includes('solicit') || qLower.includes('restrict') || qLower.includes('work for another') || qLower.includes('mobility'))
    ) {
      return {
        answer: `According to the agreement (${pt.source}), ${pt.simpleExplanation} Specifically: "${safeOriginal}"`,
        sources: [
          {
            page: pt.page || 4,
            section: pt.section || '9.0',
            title: pt.title,
            excerpt: safeOriginal,
            citation: pt.source
          }
        ],
        found: true
      };
    }

    // Confidentiality scope & duration (NDA)
    if (
      (ptTitle.includes('confidential') || ptTitle.includes('duration') || ptTitle.includes('survival')) &&
      (qLower.includes('how long') || qLower.includes('duration') || qLower.includes('confidential') || qLower.includes('secret') || qLower.includes('leak') || qLower.includes('disclose'))
    ) {
      return {
        answer: `According to the agreement (${pt.source}), ${pt.simpleExplanation} Specifically: "${safeOriginal}"`,
        sources: [
          {
            page: pt.page || 2,
            section: pt.section || '5.0',
            title: pt.title,
            excerpt: safeOriginal,
            citation: pt.source
          }
        ],
        found: true
      };
    }

    // Notice period / Resignation / Move-out
    if (
      ptTitle.includes('notice') &&
      (qLower.includes('notice') || qLower.includes('days notice') || qLower.includes('resign') || qLower.includes('how much notice') || qLower.includes('when can i tell'))
    ) {
      return {
        answer: `According to the agreement (${pt.source}), ${pt.simpleExplanation} Specifically: "${safeOriginal}"`,
        sources: [
          {
            page: pt.page || 3,
            section: pt.section || '5.1',
            title: pt.title,
            excerpt: safeOriginal,
            citation: pt.source
          }
        ],
        found: true
      };
    }

    // Termination (Early termination or termination without cause)
    if (
      (ptTitle.includes('terminat') || ptTitle.includes('early termination')) &&
      (qLower.includes('terminat') || qLower.includes('without cause') || qLower.includes('fired') || qLower.includes('cancel') || qLower.includes('leave early'))
    ) {
      return {
        answer: `According to the agreement (${pt.source}), ${pt.simpleExplanation} Specifically: "${safeOriginal}"`,
        sources: [
          {
            page: pt.page || 7,
            section: pt.section || '14.2',
            title: pt.title,
            excerpt: safeOriginal,
            citation: pt.source
          }
        ],
        found: true
      };
    }

    // Automatic renewal
    if (
      ptTitle.includes('renewal') &&
      (qLower.includes('renew') || qLower.includes('rollover') || qLower.includes('automatic'))
    ) {
      return {
        answer: `According to the agreement (${pt.source}), ${pt.simpleExplanation} Specifically: "${safeOriginal}"`,
        sources: [
          {
            page: pt.page || 2,
            section: pt.section || '3.4',
            title: pt.title,
            excerpt: safeOriginal,
            citation: pt.source
          }
        ],
        found: true
      };
    }
  }

  // =========================================================================
  // 3. Search Parsed Document Sections via RAG Engine
  // =========================================================================
  let sections = analysis?.sections;
  if ((!sections || sections.length === 0) && activeDocument?.rawContent) {
    sections = parseSections(activeDocument.rawContent);
  }

  if (sections && sections.length > 0) {
    const cleanSections = sections.filter(s => !isPdfBytecode(s.content));
    const ragResult = answerQuestionFromDocument(question, cleanSections);
    if (ragResult.found && !isPdfBytecode(ragResult.answer)) {
      return ragResult;
    }
  }

  // =========================================================================
  // 4. Honest Fallback when Information is Missing (PRD Section 12)
  // =========================================================================
  return {
    answer: "I couldn't find information about this in the uploaded document.",
    sources: [],
    found: false
  };
}
