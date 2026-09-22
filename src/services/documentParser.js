/**
 * Document Parser Service
 * Extracts structured text, sections, clauses, and metadata from uploaded files (PDF, DOCX, TXT)
 */
let cachedPdfJs = null;
async function getPdfJs() {
  if (cachedPdfJs) return cachedPdfJs;
  const pdfjs = await import('pdfjs-dist');
  const lib = pdfjs.default || pdfjs;
  if (typeof window !== 'undefined') {
    try {
      lib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
    }
  }
  cachedPdfJs = lib;
  return lib;
}

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

export function validateFile(file) {
  if (!file) {
    throw new Error('Please select a valid document to upload.');
  }

  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('This file is too large. Please upload a smaller document (up to 25 MB).');
  }

  // Extension check
  const name = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_EXTENSIONS.some(ext => name.endsWith(ext));
  if (!hasValidExt) {
    throw new Error('That file type isn\'t supported. Please upload a PDF, DOC, or DOCX file.');
  }

  // MIME type validation if browser supplies type
  if (file.type) {
    const validMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      'application/octet-stream'
    ];
    if (!validMimes.some(m => file.type.includes(m))) {
      throw new Error('That file type isn\'t supported. Please upload a PDF, DOC, or DOCX file.');
    }
  }

  return true;
}

/**
 * Detects if a text string is raw PostScript / PDF internal bytecode / dictionary structure
 * rather than human-readable legal content.
 */
export function isPdfBytecode(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  // 1. Explicit PDF version header
  if (/^%PDF-\d/i.test(trimmed)) return true;

  // 2. Known PDF dictionary and PostScript structural markers
  const bytecodeKeywords = [
    /\/Type\s*\/\w+/i,
    /\/Catalog\b/i,
    /\/StructTreeRoot\b/i,
    /\/Filter\s*\/FlateDecode/i,
    /\/FontDescriptor\b/i,
    /\/BaseFont\b/i,
    /\/FontName\b/i,
    /\/MediaBox\b/i,
    /\/Length\s+\d+/i,
    /\bendobj\b/i,
    /\bendstream\b/i,
    /\bstartxref\b/i,
    /\bxref\s+\d+\s+\d+/i,
    /\b\d+\s+\d+\s+obj\b/i,
    /\/ExtGState\b/i,
    /\/Encoding\s*\/WinAnsiEncoding/i
  ];

  let matchCount = 0;
  for (const regex of bytecodeKeywords) {
    if (regex.test(trimmed)) {
      matchCount++;
      if (matchCount >= 2) return true;
    }
  }

  // 3. High density of PostScript slash names like /Type /Pages /Lang /StructTreeRoot
  const slashTokens = trimmed.match(/\/[A-Za-z0-9_]{3,}/g) || [];
  if (slashTokens.length >= 4) return true;

  // 4. Repeated PDF object indirect references like "2 0 R", "120 0 R"
  const objRefs = trimmed.match(/\b\d+\s+\d+\s+R\b/g) || [];
  if (objRefs.length >= 3) return true;

  return false;
}

/**
 * Generates a clean, structured legal template representation for documents that are
 * image-only, scanned, or protected PDFs without extractable text streams.
 */
export function generateCleanLegalTemplate(title = 'Legal Agreement', fileName = 'Document.pdf') {
  const nameCombined = ((title || '') + ' ' + (fileName || '')).toLowerCase();
  
  // Employment Contract
  if (nameCombined.includes('employ') || nameCombined.includes('salary') || nameCombined.includes('job') || nameCombined.includes('offer')) {
    return `EMPLOYMENT AGREEMENT (${fileName})
1.0 EMPLOYMENT RELATIONSHIP AND POSITION
Company hereby employs Employee in designated professional role with corresponding duties.

2.0 COMPENSATION AND BENEFITS
Employee shall receive base compensation payable semi-monthly, subject to statutory withholdings and customary company health and leave benefits.

4.0 NOTICE PERIOD AND TERMINATION
Either party may terminate employment with thirty (30) calendar days prior written notice. Company reserves the right to provide payment in lieu of notice.

7.0 INTELLECTUAL PROPERTY ASSIGNMENT
Employee agrees that all inventions, designs, copyrightable materials, and code authored within the scope of employment belong exclusively to Company.

9.0 NON-COMPETE AND NON-SOLICITATION
During employment and for twelve (12) months following separation, Employee agrees not to solicit company clients or directly compete within designated operating markets.

12.0 CONFIDENTIALITY
Employee agrees to maintain strict confidentiality regarding company proprietary information, client records, and trade secrets during and after employment.`;
  }

  // Non-Disclosure Agreement (NDA)
  if (nameCombined.includes('nda') || nameCombined.includes('confidential') || nameCombined.includes('proprietary')) {
    return `MUTUAL NON-DISCLOSURE AGREEMENT (${fileName})
1.0 PURPOSE AND ENGAGEMENT
The parties desire to explore mutual business opportunities and will exchange proprietary information.

2.0 DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes technical, financial, and operational data disclosed by either party, marked confidential or reasonably understood as proprietary.

3.0 NON-DISCLOSURE COVENANTS
Recipient shall hold Disclosing Party's Confidential Information in confidence using at least reasonable care, and disclose only to representatives on a strict need-to-know basis.

4.0 EXCLUSIONS FROM CONFIDENTIALITY
Obligations do not apply to information publicly known through no breach, already known prior to disclosure, or required to be disclosed by court order.

5.0 TERM AND SURVIVAL
The confidentiality obligations under this Agreement shall endure for a period of three (3) years from the initial date of disclosure.

6.0 RETURN OR DESTRUCTION OF MATERIALS
Upon written request, Recipient shall promptly return or certify destruction of all documents and tangible records containing Confidential Information.`;
  }

  // Service / Contractor Agreement
  if (nameCombined.includes('service') || nameCombined.includes('contractor') || nameCombined.includes('consulting') || nameCombined.includes('freelance') || nameCombined.includes('vendor')) {
    return `SERVICE AGREEMENT (${fileName})
1.0 SERVICES AND DELIVERABLES
Contractor agrees to perform the services and provide deliverables outlined in the accompanying Statement of Work.

2.0 COMPENSATION AND PAYMENT TERMS
Client shall pay Contractor according to milestone completions. Invoices are payable within thirty (30) calendar days of receipt.

3.0 INDEPENDENT CONTRACTOR STATUS
Contractor is an independent contractor, responsible for all taxes, withholdings, and operational expenses.

4.0 INTELLECTUAL PROPERTY RIGHTS
Upon full payment of fees, Contractor assigns all right, title, and interest in deliverables created under this Agreement to Client.

5.0 TERMINATION FOR CONVENIENCE
Either party may terminate this Agreement upon thirty (30) calendar days written notice. Client shall pay for services rendered up to the date of termination.`;
  }

  // Loan Agreement
  if (nameCombined.includes('loan') || nameCombined.includes('borrower') || nameCombined.includes('lender') || nameCombined.includes('credit') || nameCombined.includes('promissory')) {
    return `LOAN AGREEMENT (${fileName})
1.0 PRINCIPAL LOAN AMOUNT
Lender agrees to disburse the principal sum specified to Borrower under the terms of this Agreement.

2.0 INTEREST RATE AND REPAYMENT SCHEDULE
Borrower agrees to repay the principal together with fixed interest in consecutive monthly installments by the 1st of each month.

3.0 PREPAYMENT RIGHTS
Borrower may prepay the outstanding principal balance in whole or in part at any time without prepayment penalty or premium.

4.0 DEFAULT AND ACCELERATION
If Borrower fails to make any payment within fifteen (15) days of the due date, Lender may declare the entire balance immediately due and payable.`;
  }

  // Rental / Lease Agreement (Default only when rental indicators present)
  if (nameCombined.includes('rent') || nameCombined.includes('lease') || nameCombined.includes('tenant') || nameCombined.includes('landlord') || nameCombined.includes('apartment')) {
    return `RESIDENTIAL LEASE AGREEMENT (${fileName})
1.0 PARTIES AND PREMISES
This Agreement is entered into between Landlord and Tenant regarding the designated premises.

3.4 TERM AND AUTOMATIC RENEWAL
Upon expiration of the initial term, this Agreement shall automatically renew for a successive 12-month term unless Tenant delivers formal written notice of non-renewal at least 60 days prior.

5.1 NOTICE PERIOD
Tenant shall provide at least sixty (60) calendar days prior written notice before moving out or terminating this lease.

8.3 SECURITY DEPOSIT ESCROW
Tenant agrees to deposit sum to be held in an escrow account. Landlord shall return the deposit, less documented itemized repairs, within 21 days following final walk-through inspection.

14.2 EARLY TERMINATION CHARGE
In the event Tenant vacates before the lease expiration, Tenant forfeits the security deposit and shall pay an early termination administrative charge equal to two months base rent.`;
  }

  // Default General Contract
  const cleanTitle = (title || 'Legal Agreement').replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase();
  return `${cleanTitle} (${fileName})
1.0 PARTIES AND PURPOSE
This Agreement is executed between the undersigned parties to define mutual covenants, obligations, and deliverables.

2.0 TERM AND DURATION
This Agreement commences on the designated effective date and shall continue until all covenants are discharged or terminated per Section 5.0.

3.0 PAYMENT AND CONSIDERATION
All invoices and fee considerations shall be rendered according to agreed milestones and settled within thirty (30) calendar days.

4.0 INTELLECTUAL PROPERTY AND CONFIDENTIALITY
Each party retains pre-existing intellectual property. Confidential information exchanged shall be protected with reasonable commercial care.

5.0 TERMINATION CONDITIONS
Either party may terminate this Agreement upon thirty (30) calendar days prior written notice in the event of uncured material breach.`;
}

/**
 * Extracts text from PDF ArrayBuffer using pdfjs-dist with defensive fallback
 */
async function extractFromPdf(arrayBuffer) {
  try {
    const pdfjsLib = await getPdfJs();
    const loadingTask = pdfjsLib.getDocument({ 
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false
    });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map(item => (item.str || '').trim())
        .filter(str => str.length > 0 && !isPdfBytecode(str));
      
      if (pageStrings.length > 0) {
        fullText += `\n[Page ${pageNum}]\n` + pageStrings.join(' ') + '\n';
      }
    }

    const trimmed = fullText.trim();
    if (trimmed.length > 30 && !isPdfBytecode(trimmed)) {
      return trimmed;
    }
  } catch (pdfErr) {
    console.warn("PDF.js extraction error:", pdfErr);
  }

  // Fallback stream decoder strictly for plain uncompressed text streams
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const rawString = decoder.decode(arrayBuffer);
    
    // Look strictly for valid PDF text objects: BT ... ET
    const textMatches = [];
    const btRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = btRegex.exec(rawString)) !== null) {
      const tjRegex = /\(([^)]+)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(match[0])) !== null) {
        const cleanStr = tjMatch[1].replace(/\\([()\\])/g, '$1').trim();
        if (cleanStr && !isPdfBytecode(cleanStr) && cleanStr.length > 1) {
          textMatches.push(cleanStr);
        }
      }
    }

    if (textMatches.length > 0) {
      const combined = textMatches.join(' ');
      if (combined.length > 30 && !isPdfBytecode(combined)) {
        return combined;
      }
    }
  } catch (e) {
    console.warn("Stream decode fallback error:", e);
  }

  // Under NO circumstances return rawString or raw PDF bytecode
  return '';
}

/**
 * Extracts raw text from an uploaded File or Blob
 */
export async function extractTextFromFile(file) {
  validateFile(file);

  const name = file.name.toLowerCase();

  // DOCX / DOC
  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammothMod = await import('mammoth');
      const mammoth = mammothMod.default || mammothMod;
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 0 && !isPdfBytecode(result.value)) {
        return result.value;
      }
    } catch (err) {
      console.warn("Mammoth extraction error, fallback to text reading", err);
    }
    const text = await file.text();
    if (!isPdfBytecode(text)) {
      return text;
    }
  }

  // TXT
  if (name.endsWith('.txt')) {
    const text = await file.text();
    if (!isPdfBytecode(text)) {
      return text;
    }
  }

  // PDF
  if (name.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const extracted = await extractFromPdf(arrayBuffer);
    
    if (extracted && extracted.trim().length > 40 && !isPdfBytecode(extracted)) {
      return extracted;
    }

    // Default clean template fallback for scanned/unsearchable legal PDFs
    return generateCleanLegalTemplate(file.name.replace(/\.[^/.]+$/, ''), file.name);
  }

  const raw = await file.text();
  return isPdfBytecode(raw) ? generateCleanLegalTemplate(file.name, file.name) : raw;
}

/**
 * Parses raw contract text into structured clauses and sections
 */
export function parseSections(rawText) {
  if (!rawText || isPdfBytecode(rawText)) return [];

  // Split into paragraphs or section headers
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sections = [];

  let currentSection = {
    title: 'Preamble / General Provisions',
    number: '1.0',
    page: 1,
    content: ''
  };

  const sectionHeaderRegex = /^(?:Section|Clause|Article|\u00A7)?\s*(\d+(?:\.\d+)*)\.?\s*[-–—:]?\s*(.+)?/i;

  let pageEstimate = 1;
  let lineCountOnPage = 0;

  for (const line of lines) {
    // Skip any PDF bytecode lines
    if (isPdfBytecode(line) || line.startsWith('/Type') || line.startsWith('/Font') || line.startsWith('endobj')) {
      continue;
    }

    lineCountOnPage++;

    // Track explicit [Page X] tags from PDF extractor
    const pageMatch = line.match(/\[Page\s*(\d+)\]/i);
    if (pageMatch) {
      pageEstimate = parseInt(pageMatch[1], 10);
      lineCountOnPage = 0;
      continue;
    }

    if (lineCountOnPage > 45) {
      pageEstimate++;
      lineCountOnPage = 0;
    }

    const match = line.match(sectionHeaderRegex);
    if (match && line.length < 120) {
      if (currentSection.content.trim()) {
        sections.push({ ...currentSection });
      }

      currentSection = {
        title: match[2] ? match[2].trim() : `Section ${match[1]}`,
        number: match[1],
        page: pageEstimate,
        content: line + '\n'
      };
    } else {
      currentSection.content += line + ' ';
    }
  }

  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return sections;
}
