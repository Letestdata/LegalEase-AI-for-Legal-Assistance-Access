import { describe, it, expect } from 'vitest';
import { 
  validateFile, 
  parseSections, 
  isPdfBytecode, 
  generateCleanLegalTemplate, 
  MAX_FILE_SIZE_BYTES 
} from '../src/services/documentParser';

describe('Document Parser Service', () => {
  it('validates accepted file extensions', () => {
    const validPdf = { name: 'Agreement.pdf', size: 1024 * 1024 };
    const validDocx = { name: 'Contract.docx', size: 2 * 1024 * 1024 };
    const validTxt = { name: 'Notes.txt', size: 500 };

    expect(validateFile(validPdf)).toBe(true);
    expect(validateFile(validDocx)).toBe(true);
    expect(validateFile(validTxt)).toBe(true);
  });

  it('rejects unsupported file formats with user-friendly error', () => {
    const invalidImage = { name: 'Scanned.png', size: 1024 };
    expect(() => validateFile(invalidImage)).toThrow(/That file type isn't supported/);
  });

  it('rejects files exceeding maximum size (25MB)', () => {
    const oversizedFile = { name: 'Huge_Lease.pdf', size: MAX_FILE_SIZE_BYTES + 100 };
    expect(() => validateFile(oversizedFile)).toThrow(/This file is too large/);
  });

  it('parses structured sections and calculates page estimates', () => {
    const sampleContract = `
1.0 PARTIES AND INTENT
This Lease is entered between Landlord and Tenant.

5.1 NOTICE PERIOD
Tenant shall provide at least sixty (60) calendar days prior written notice.

14.2 EARLY TERMINATION CHARGE
Tenant forfeits security deposit upon early departure.
    `;

    const sections = parseSections(sampleContract);
    expect(sections.length).toBeGreaterThanOrEqual(2);
    expect(sections.some(s => s.number === '5.1' || s.title.includes('NOTICE'))).toBe(true);
  });

  it('accurately identifies raw PDF bytecode and dictionary structures', () => {
    // Exact string pattern reported by user in screenshot
    const userScreenshotBytecode = `/Type/Catalog/Pages 2 0 R/Lang(en) /StructTreeRoot 120 0 R/MarkInfo
/Metadata 1868 0 R/ViewerPreferences 1869 0 R endobj 2 0 obj
/Type/Pages/Count 37/Kids 3 0 R 13 0 R 20 0 R 22 0 R 31 0 R 33 0 R 35 0 R
37 0 R 44 0 R 46 0 R 49 0 R 52 0 R 55 0 R 58 0 R 60 0 R 62 0 R 64 0 R 66 0
/Filter/FlateDecode/Length 565 ; endstream endobj 5 0 obj
/Type/Font/Subtype/TrueType/Name/F1/BaseFont/BCDEEE Calibri-Italic/Encoding/WinAnsiEncoding`;

    expect(isPdfBytecode(userScreenshotBytecode)).toBe(true);

    const pdfVersionHeader = '%PDF-1.7 \n 4 0 obj << /Filter /FlateDecode >>';
    expect(isPdfBytecode(pdfVersionHeader)).toBe(true);

    // Legitimate legal text should NOT be flagged as bytecode
    const legitimateLegalText = `This Residential Lease Agreement is entered into between Metropolitan Realty Partners ("Landlord") and Sarah Jenkins ("Tenant").`;
    expect(isPdfBytecode(legitimateLegalText)).toBe(false);

    const plainClauses = `14.2 EARLY TERMINATION CHARGE: In the event Tenant vacates before the lease expiration, Tenant forfeits the security deposit and shall pay an early termination administrative charge equal to two months base rent.`;
    expect(isPdfBytecode(plainClauses)).toBe(false);
  });

  it('refuses to parse PDF bytecode into valid sections', () => {
    const rawBytecode = `/Type/Catalog/Pages 2 0 R /StructTreeRoot 120 0 R endobj /Filter/FlateDecode endstream`;
    const sections = parseSections(rawBytecode);
    expect(sections).toEqual([]);
  });

  it('generates a clean, human-readable legal contract template tailored by document category', () => {
    const empTemplate = generateCleanLegalTemplate('Employment Contract', 'Employment.pdf');
    expect(empTemplate).toContain('EMPLOYMENT AGREEMENT');
    expect(empTemplate).toContain('4.0 NOTICE PERIOD AND TERMINATION');
    expect(empTemplate).toContain('7.0 INTELLECTUAL PROPERTY ASSIGNMENT');
    expect(empTemplate).not.toContain('SECURITY DEPOSIT');
    expect(isPdfBytecode(empTemplate)).toBe(false);

    const rentalTemplate = generateCleanLegalTemplate('Rental Lease', 'Rental_Agreement.pdf');
    expect(rentalTemplate).toContain('RESIDENTIAL LEASE AGREEMENT');
    expect(rentalTemplate).toContain('3.4 TERM AND AUTOMATIC RENEWAL');
    expect(rentalTemplate).toContain('8.3 SECURITY DEPOSIT ESCROW');
    expect(isPdfBytecode(rentalTemplate)).toBe(false);

    const ndaTemplate = generateCleanLegalTemplate('Mutual NDA', 'NDA.pdf');
    expect(ndaTemplate).toContain('MUTUAL NON-DISCLOSURE AGREEMENT');
    expect(ndaTemplate).toContain('5.0 TERM AND SURVIVAL');
    expect(ndaTemplate).not.toContain('SECURITY DEPOSIT');
    expect(isPdfBytecode(ndaTemplate)).toBe(false);
  });
});
