import { describe, it, expect } from 'vitest';
import { compareDocuments } from '../src/services/compareEngine';

describe('Document Comparison Differential Engine', () => {
  const originalContract = `
Section 4.2 Notice Period
Tenant shall give thirty (30) days notice.
Section 12.4 Security Deposit Return
Landlord returns deposit within 15 days.
  `;

  const revisedContract = `
Section 4.2 Notice Period
Tenant shall give sixty (60) days notice.
Section 12.4 Security Deposit Return
Landlord returns deposit within 30 days.
  `;

  it('identifies key differences and categorizes into Important Changes', () => {
    const comparison = compareDocuments(originalContract, revisedContract);
    expect(comparison.importantChanges.length).toBeGreaterThan(0);
    
    const noticeDiff = comparison.importantChanges.find(c => c.id === 'diff-notice-period');
    expect(noticeDiff).toBeDefined();
    expect(noticeDiff.before.highlight).toBe('30 days');
    expect(noticeDiff.after.highlight).toBe('60 days');
    expect(noticeDiff.plainEnglishImpact).toContain('twice as much notice');
  });

  it('populates secondary changes to review and minor changes', () => {
    const comparison = compareDocuments(originalContract, revisedContract);
    expect(comparison.changesToReview.length).toBeGreaterThan(0);
    expect(comparison.minorChanges.length).toBeGreaterThan(0);
    expect(comparison.totalChangesCount).toBeGreaterThan(5);
  });
});
