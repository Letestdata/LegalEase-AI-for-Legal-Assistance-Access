import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DisclaimerBanner from '../src/components/common/DisclaimerBanner';
import LoadingSteps from '../src/components/common/LoadingSteps';
import Modal from '../src/components/common/Modal';
import SummaryCards from '../src/components/overview/SummaryCards';

describe('UI Components & Accessibility', () => {
  it('renders contextual legal disclaimers', () => {
    render(<DisclaimerBanner type="document" />);
    expect(screen.getByRole('note')).toBeInTheDocument();
    expect(screen.getByText(/is not professional legal advice/i)).toBeInTheDocument();
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
});
