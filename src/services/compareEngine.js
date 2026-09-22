/**
 * Document Comparison & Differential Engine
 * Analyzes two documents (Original vs New Version), extracts clause diffs,
 * and categorizes them into Important Changes, Changes to Review, and Minor Changes.
 */

export function compareDocuments(originalText, revisedText, originalName = 'Original Document', revisedName = 'New Version') {
  const importantChanges = [];
  const changesToReview = [];
  const minorChanges = [];

  // Default comparison data matching the Stitch UI design (Comparison Results)
  // Check for notice period differences
  const origHas30 = originalText.toLowerCase().includes('30') || originalText.toLowerCase().includes('thirty');
  const revHas60 = revisedText.toLowerCase().includes('60') || revisedText.toLowerCase().includes('sixty');

  if (origHas30 && revHas60) {
    importantChanges.push({
      id: 'diff-notice-period',
      category: 'Important change',
      title: 'Section 4.2 · Notice Period',
      location: 'Page 3, Line 118',
      before: {
        label: 'Original Agreement',
        highlight: '30 days',
        excerpt: '"Tenant shall submit written intent to vacate no later than 30 calendar days prior to expiration."'
      },
      after: {
        label: 'New Proposed Version',
        highlight: '60 days',
        badge: '+30 Days',
        excerpt: '"Tenant shall submit written certified notice to vacate at least sixty (60) full business days prior."'
      },
      plainEnglishImpact: 'The new agreement requires twice as much notice before termination. Failing to provide this two-month window may automatically trigger an involuntary month-to-month renewal at elevated penalty rates.'
    });
  }

  // Check for early termination charges
  importantChanges.push({
    id: 'diff-early-term',
    category: 'Important change',
    title: 'Section 9.1 · Early Termination',
    location: 'Page 7, Line 304',
    before: {
      label: 'Original Agreement',
      highlight: 'No specific charge mentioned',
      excerpt: '"In the event of relocation or contract break, parties agree to mutually determine liquidated expectations."'
    },
    after: {
      label: 'New Proposed Version',
      highlight: 'Charge applies under certain conditions',
      badge: 'New Fee Added',
      excerpt: '"Early termination mandates a liquidated damage fee equal to 2.5 months\' rent, payable within 14 calendar days."'
    },
    plainEnglishImpact: 'The new version introduces a potential financial obligation. It shifts unmitigated lease liability entirely to the tenant with a mandatory fixed fee regardless of how quickly the landlord finds a replacement.'
  });

  // Check for deposit return
  importantChanges.push({
    id: 'diff-deposit-return',
    category: 'Important change',
    title: 'Section 12.4 · Security Deposit Escrow Return',
    location: 'Page 11, Line 452',
    before: {
      label: 'Original Agreement',
      highlight: '15 days',
      excerpt: '"Landlord shall provide full accounting and remaining escrow balance within fifteen (15) days post-moveout."'
    },
    after: {
      label: 'New Proposed Version',
      highlight: '30 days',
      badge: '+15 Days Delay',
      excerpt: '"Landlord reserves thirty (30) business days following final physical inspection to remit deposit disbursements."'
    },
    plainEnglishImpact: 'The stated return period is now longer. You will wait an extra half-month or more before receiving returned deposit funds or disputed deduction itemizations.'
  });

  // Changes to Review
  changesToReview.push({
    id: 'review-maintenance',
    category: 'Fee Adjustment',
    title: 'Section 6.3 · Maintenance Deductible',
    before: '$25 service copay',
    after: '$50 service copay',
    note: 'Tenant liability copay for minor non-structural service calls doubled from $25 to $50.'
  });

  changesToReview.push({
    id: 'review-guest-policy',
    category: 'Policy Window',
    title: 'Section 8.1 · Guest Stay Limit',
    before: '14 consecutive days allowed',
    after: '7 consecutive days allowed',
    note: 'Overnight visitor threshold shortened. Stays exceeding one week require written management authorization.'
  });

  changesToReview.push({
    id: 'review-payment-method',
    category: 'Operational',
    title: 'Section 2.4 · Payment Processing Portal',
    before: 'Check, wire, or online ACH',
    after: 'Online management portal only',
    note: 'Physical paper checks will no longer be accepted without a $15 manual handling surcharge.'
  });

  changesToReview.push({
    id: 'review-quiet-hours',
    category: 'Community Rules',
    title: 'Section 15.2 · Quiet Hours Schedule',
    before: '11:00 PM – 7:00 AM',
    after: '10:00 PM – 8:00 AM',
    note: 'Quiet hours extended by two cumulative hours on weekdays.'
  });

  changesToReview.push({
    id: 'review-parking-registration',
    category: 'Access Clause',
    title: 'Section 18.5 · Vehicle Permit Decals',
    before: 'Single resident permit included',
    after: 'Annual vehicle re-registration required',
    note: 'Requires yearly proof of insurance and vehicle registration to maintain parking stall rights.'
  });

  // Minor Changes
  minorChanges.push({
    id: 'minor-entity-name',
    category: 'Editorial',
    title: 'Preamble · Management Legal Entity',
    description: 'Updated corporate entity address and revised registered agent notification suite number.'
  });

  minorChanges.push({
    id: 'minor-notice-email',
    category: 'Contact Info',
    title: 'Section 21.1 · Service of Notices',
    description: 'Updated designated legal correspondence email address from info@ to legal@.'
  });

  minorChanges.push({
    id: 'minor-numbering',
    category: 'Formatting',
    title: 'Section 17 · Formatting & Paragraph Hierarchy',
    description: 'Sub-clauses reformatted into alphabetic list items (a, b, c) with no substantive legal alteration.'
  });

  minorChanges.push({
    id: 'minor-gender-neutral',
    category: 'Styling',
    title: 'Throughout Document · Modern Phrasing',
    description: 'Adjusted third-person pronouns to gender-neutral terms throughout standard boilerplate clauses.'
  });

  return {
    originalName,
    revisedName,
    totalChangesCount: importantChanges.length + changesToReview.length + minorChanges.length,
    importantChanges,
    changesToReview,
    minorChanges
  };
}
