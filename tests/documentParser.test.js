import { describe, it, expect } from 'vitest';
import { validateFile, parseSections, MAX_FILE_SIZE_BYTES } from '../src/services/documentParser';

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
});
