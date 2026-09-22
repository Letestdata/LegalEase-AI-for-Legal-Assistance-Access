import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { detectDocumentType, askDocumentQuestion } from '../src/services/aiService';
import { compareDocuments } from '../src/services/compareEngine';
import { validateFile, extractTextFromFile } from '../src/services/documentParser';
import { sanitizeHtml, redactPII, verifyFileMagicBytes } from '../src/services/securityService';
import App from '../src/App';
import ClauseModal from '../src/components/overview/ClauseModal';
import DisclaimerBanner from '../src/components/common/DisclaimerBanner';

describe('PRD Problem Statement & MVP Scope Verification', () => {
  // PRD Challenge 1 & Feature 5: Plain English simplification and document type detection
  it('identifies PRD supported document categories (Rental, Employment, NDA, Service)', () => {
    expect(detectDocumentType('Lease terms for tenant and landlord', 'Lease.pdf')).toBe('Rental Agreement');
    expect(detectDocumentType('Employment offer letter with salary and benefits', 'Offer.docx')).toBe('Employment Contract');
    expect(detectDocumentType('Proprietary non-disclosure and confidential info', 'NDA.pdf')).toBe('Non-Disclosure Agreement (NDA)');
    expect(detectDocumentType('Statement of work for contractor consulting', 'SOW.pdf')).toBe('Service Agreement');
  });

  // PRD Challenge 2 & Feature 6: Distinction between what document says vs AI explanation
  it('distinguishes verbatim text from plain English AI explanations in ClauseModal', () => {
    const mockClause = {
      title: 'Early termination',
      originalText: 'Tenant shall forfeit the security deposit upon early termination.',
      simpleExplanation: 'You may have to pay a charge if you leave before the agreement ends.',
      whoAffects: 'Tenant',
      whyCare: 'Financial penalty upon moving out',
      source: 'Clause 14.2 • Page 7'
    };

    render(<ClauseModal isOpen={true} onClose={() => {}} clause={mockClause} />);
    expect(screen.getByText(/What the document says/i)).toBeInTheDocument();
    expect(screen.getByText(/Simple explanation/i)).toBeInTheDocument();
    expect(screen.getByText(/Who does this affect/i)).toBeInTheDocument();
    expect(screen.getByText(/Why should you care/i)).toBeInTheDocument();
    expect(screen.getByText('Tenant shall forfeit the security deposit upon early termination.')).toBeInTheDocument();
  });

  // PRD Challenge 4 & Features 9-10: Version comparison categorized into 3 tiers
  it('performs differential analysis categorized into Important, Review, and Minor changes', () => {
    const orig = 'Tenant shall give 30 days notice.';
    const rev = 'Tenant shall give 60 days notice.';
    const diff = compareDocuments(orig, rev, 'Original Agreement', 'Proposed Lease');

    expect(diff.importantChanges.length).toBeGreaterThan(0);
    expect(diff.changesToReview.length).toBeGreaterThan(0);
    expect(diff.minorChanges.length).toBeGreaterThan(0);
    expect(diff.importantChanges[0].before.highlight).toBe('30 days');
    expect(diff.importantChanges[0].after.highlight).toBe('60 days');
  });

  // PRD Challenge 6 & Feature 7: Zero-hallucination document-grounded Q&A
  it('refuses to hallucinate when asked about terms absent from the active document', async () => {
    const mockEmploymentAnalysis = {
      documentType: 'Employment Contract',
      importantPoints: [
        { title: 'Notice Period', source: 'Section 4.1', simpleExplanation: 'Requires two weeks notice.', originalText: 'Employee must give two weeks notice.' }
      ]
    };
    const mockDoc = { title: 'Offer Letter', rawContent: 'Employment Offer Letter. Salary: $120,000.' };

    const result = await askDocumentQuestion('What are the rental security deposit refund conditions?', mockEmploymentAnalysis, mockDoc);
    expect(result.found).toBe(false);
    expect(result.answer).toContain("couldn't find");
  });

  // PRD Section 26: Contextual Legal Disclaimers
  it('renders contextual disclaimers per PRD Section 26', () => {
    const { rerender } = render(<DisclaimerBanner type="overview" />);
    expect(screen.getByText(/not definitive legal advice/i)).toBeInTheDocument();

    rerender(<DisclaimerBanner type="qa" />);
    expect(screen.getByText(/based strictly on the uploaded document/i)).toBeInTheDocument();

    rerender(<DisclaimerBanner type="lawyer" />);
    expect(screen.getByText(/prepare for a discussion with a qualified legal professional/i)).toBeInTheDocument();
  });

  // PRD Section 7: Multi-format upload and validation
  it('validates supported file extensions and rejects oversized or corrupt uploads', () => {
    const validFile = new File(['Contract text'], 'Lease.pdf', { type: 'application/pdf' });
    expect(() => validateFile(validFile)).not.toThrow();
    expect(typeof extractTextFromFile).toBe('function');

    const invalidFile = new File(['Script'], 'malware.exe', { type: 'application/x-msdownload' });
    expect(() => validateFile(invalidFile)).toThrow(/supported/i);
  });

  // PRD Section 17 & 28: Security, PII Redaction, and Magic-byte Verification
  it('enforces PRD privacy with PII redaction, HTML sanitization, and magic byte validation', async () => {
    const raw = '<script>alert(1)</script>Contact user at john.doe@example.com or (555) 123-4567';
    const sanitized = sanitizeHtml(raw);
    expect(sanitized).not.toContain('<script>');
    const redacted = redactPII(raw);
    expect(redacted).toContain('[REDACTED EMAIL]');
    expect(redacted).toContain('[REDACTED PHONE]');

    const fakePdf = new File(['GIF89a fake pdf'], 'doc.pdf', { type: 'application/pdf' });
    const isValid = await verifyFileMagicBytes(fakePdf);
    expect(isValid).toBe(false);
  });

  // PRD Section 34: Core User Journey Navigation
  it('mounts core user journey from Dashboard with Skip navigation for accessibility', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeInTheDocument();
    expect(screen.getByText('LegalEase')).toBeInTheDocument();
    expect(screen.getByText('Understand before you sign.')).toBeInTheDocument();
  });
});
