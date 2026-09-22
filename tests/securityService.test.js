import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeText, verifyFileMagicBytes } from '../src/services/securityService';

describe('Security Service & Sanitization', () => {
  it('strips malicious script tags and event handlers via sanitizeHtml', () => {
    const malicious = '<p>Normal text</p><script>alert("xss")</script><img src="x" onerror="stealCookies()">';
    const cleaned = sanitizeHtml(malicious);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('onerror');
    expect(cleaned).toContain('<p>Normal text</p>');
  });

  it('sanitizes plain text stripping all HTML and injection tags', () => {
    const dirty = 'Hello <b>World</b> <script>doEvil()</script>';
    const cleaned = sanitizeText(dirty);
    expect(cleaned).toBe('Hello World ');
    expect(cleaned).not.toContain('<');
    expect(cleaned).not.toContain('>');
  });

  it('validates authentic PDF magic bytes (%PDF-)', async () => {
    // 0x25, 0x50, 0x44, 0x46, 0x2D -> %PDF-
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]);
    const mockPdfFile = new File([pdfBytes], 'Lease.pdf', { type: 'application/pdf' });
    const isValid = await verifyFileMagicBytes(mockPdfFile);
    expect(isValid).toBe(true);
  });

  it('validates authentic DOCX magic bytes (PK zip header)', async () => {
    // 0x50, 0x4B, 0x03, 0x04 -> PK..
    const docxBytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    const mockDocxFile = new File([docxBytes], 'OfferLetter.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const isValid = await verifyFileMagicBytes(mockDocxFile);
    expect(isValid).toBe(true);
  });

  it('rejects executable files disguised with a .pdf extension', async () => {
    // Windows executable starts with MZ (0x4D, 0x5A)
    const exeBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const fakePdf = new File([exeBytes], 'Malicious.pdf', { type: 'application/pdf' });
    const isValid = await verifyFileMagicBytes(fakePdf);
    expect(isValid).toBe(false);
  });

  it('rejects executable files disguised with a .txt extension', async () => {
    const exeBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]);
    const fakeTxt = new File([exeBytes], 'Notes.txt', { type: 'text/plain' });
    const isValid = await verifyFileMagicBytes(fakeTxt);
    expect(isValid).toBe(false);
  });
});
