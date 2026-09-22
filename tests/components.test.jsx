import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DisclaimerBanner from '../src/components/common/DisclaimerBanner';
import LoadingSteps from '../src/components/common/LoadingSteps';
import Modal from '../src/components/common/Modal';
import SummaryCards from '../src/components/overview/SummaryCards';
import ClauseModal from '../src/components/overview/ClauseModal';
import AgreementsScope from '../src/components/overview/AgreementsScope';
import LawyerChecklist from '../src/components/lawyer/LawyerChecklist';

describe('UI Components & Accessibility', () => {
  it('renders contextual legal disclaimers for document overview and global app', () => {
    const { rerender } = render(<DisclaimerBanner type="document" />);
    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(screen.getByText(/is not professional legal advice/i)).toBeInTheDocument();

    rerender(<DisclaimerBanner type="global" />);
    expect(screen.getByText(/provides legal information and document assistance/i)).toBeInTheDocument();
  });

  it('renders progressive loading stages during document analysis', () => {
    render(<LoadingSteps currentStep="Finding important sections" progressPercent={40} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getAllByText('Finding important sections').length).toBeGreaterThanOrEqual(1);
  });

  it('renders accessible modal dialog with proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Early termination" subtitle="Section 14.2">
        <p>Modal content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Early termination')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders document summary cards with 4 key metrics', () => {
    const stats = {
      importantPointsCount: 8,
      obligationsCount: 5,
      deadlinesCount: 3,
      pointsToReviewCount: 4
    };
    render(<SummaryCards stats={stats} />);
    expect(screen.getByText('Important points')).toBeInTheDocument();
    expect(screen.getByText('Obligations')).toBeInTheDocument();
    expect(screen.getByText('Deadlines')).toBeInTheDocument();
    expect(screen.getByText('Points to review')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('safely sanitizes clause modal when originalText contains raw PDF bytecode', () => {
    const clauseWithBytecode = {
      id: 'test-clause',
      title: 'Early termination',
      simpleExplanation: 'You may have to pay a penalty charge if you leave early.',
      originalText: '/Type/Catalog/Pages 2 0 R /Filter/FlateDecode/Length 565 ; endstream endobj',
      source: 'Clause 14.2 • Page 7',
      whoAffects: 'Tenant',
      whyCare: 'Financial charge',
      questionsToConsider: ['Can fee be waived?']
    };

    render(
      <ClauseModal
        isOpen={true}
        onClose={() => {}}
        clause={clauseWithBytecode}
      />
    );

    // Bytecode must NEVER appear in the document
    expect(screen.queryByText(/\/Type\/Catalog/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\/Filter\/FlateDecode/)).not.toBeInTheDocument();

    // Plain English explanation should be shown as fallback
    expect(screen.getAllByText('You may have to pay a penalty charge if you leave early.').length).toBeGreaterThanOrEqual(1);
  });

  it('renders agreements scope with dynamically passed obligations', () => {
    const mockObligations = [
      { id: 'ob-1', title: 'Monthly Maintenance Duty', simpleExplanation: 'Keep air filters replaced every 90 days.' },
      { id: 'ob-2', title: 'Rent Remittance', simpleExplanation: 'Transfer funds on or before the 1st of each calendar month.' }
    ];

    render(<AgreementsScope obligations={mockObligations} />);
    expect(screen.getByText('What you are agreeing to')).toBeInTheDocument();
    expect(screen.getByText('Monthly Maintenance Duty')).toBeInTheDocument();
    expect(screen.getByText('Keep air filters replaced every 90 days.')).toBeInTheDocument();
    expect(screen.getByText('Rent Remittance')).toBeInTheDocument();
  });

  it('renders lawyer prep checklist modal with tailored questions and preparation items', () => {
    const prepData = {
      mainConcern: 'Liquidated damages penalty upon early termination.',
      relevantSections: ['Section 14.2', 'Section 5.1'],
      questions: [
        { text: 'Can the termination fee be capped at one month?', checked: false }
      ],
      documentsToPrepare: [
        { text: 'Complete executed agreement copy', checked: false }
      ]
    };

    render(<LawyerChecklist isOpen={true} onClose={() => {}} prepData={prepData} />);
    expect(screen.getByText(/Questions to ask your lawyer/i)).toBeInTheDocument();
    expect(screen.getByText('Liquidated damages penalty upon early termination.')).toBeInTheDocument();
    expect(screen.getByText('Can the termination fee be capped at one month?')).toBeInTheDocument();
    expect(screen.getByText('Complete executed agreement copy')).toBeInTheDocument();
    expect(screen.getByText('Download Checklist')).toBeInTheDocument();
  });
});
