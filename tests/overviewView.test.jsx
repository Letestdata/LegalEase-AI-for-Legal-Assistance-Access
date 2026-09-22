import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import DocumentOverviewView from '../src/components/overview/DocumentOverviewView';
import SummaryCards from '../src/components/overview/SummaryCards';
import AgreementsScope from '../src/components/overview/AgreementsScope';
import DocumentQA from '../src/components/qa/DocumentQA';
import LawyerChecklist from '../src/components/lawyer/LawyerChecklist';
import { DocumentProvider } from '../src/context/DocumentContext';
import { AuthProvider } from '../src/context/AuthContext';

async function renderWithProviders(ui) {
  let res;
  await act(async () => {
    res = render(
      <AuthProvider>
        <DocumentProvider>
          {ui}
        </DocumentProvider>
      </AuthProvider>
    );
  });
  return res;
}

describe('Document Overview & Q&A Experience', () => {
  it('renders SummaryCards with 4 primary PRD metrics', () => {
    const mockStats = {
      importantPointsCount: 3,
      obligationsCount: 5,
      deadlinesCount: 2,
      pointsToReviewCount: 1
    };
    render(<SummaryCards stats={mockStats} />);
    expect(screen.getByText(/Important points/i)).toBeInTheDocument();
    expect(screen.getByText(/Obligations/i)).toBeInTheDocument();
    expect(screen.getByText(/Deadlines/i)).toBeInTheDocument();
    expect(screen.getByText(/Points to review/i)).toBeInTheDocument();
  });

  it('renders AgreementsScope with obligations and agreement terms', () => {
    const obligations = [
      { title: 'Payment obligations', desc: 'Monthly rent due on 1st.' },
      { title: 'Notice requirements', desc: '60 days written notice.' }
    ];
    render(<AgreementsScope obligations={obligations} />);
    expect(screen.getByText('What you are agreeing to')).toBeInTheDocument();
    expect(screen.getByText('Payment obligations')).toBeInTheDocument();
  });

  it('renders DocumentQA with grounded prompt suggestions and disclaimer', async () => {
    await renderWithProviders(
      <DocumentQA
        isOpen={true}
        onClose={() => {}}
      />
    );
    expect(screen.getByText(/Ask about/i)).toBeInTheDocument();
    expect(screen.getByText(/Answers are based strictly on the uploaded document/i)).toBeInTheDocument();
  });

  it('allows user to type into input in DocumentQA', async () => {
    await renderWithProviders(
      <DocumentQA
        isOpen={true}
        onClose={() => {}}
      />
    );
    const input = screen.getByPlaceholderText(/Ask a question about this agreement/i);
    fireEvent.change(input, { target: { value: 'What is the penalty for late rent?' } });
    expect(input.value).toBe('What is the penalty for late rent?');
  });

  it('renders LawyerChecklist with preparation questions and documents to bring', () => {
    render(<LawyerChecklist isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Lawyer Consultation Preparation')).toBeInTheDocument();
    expect(screen.getByText(/Questions to ask your lawyer/i)).toBeInTheDocument();
    expect(screen.getByText(/Information & documents to prepare/i)).toBeInTheDocument();
    expect(screen.getByText('Download Checklist')).toBeInTheDocument();
  });

  it('renders DocumentOverviewView with active document tabs and navigation', async () => {
    await renderWithProviders(<DocumentOverviewView onNavigate={() => {}} />);
    expect(screen.getByText('Overall review')).toBeInTheDocument();
    expect(screen.getByText('Rental Agreement')).toBeInTheDocument();
    expect(screen.getAllByText('Ask about this document').length).toBeGreaterThanOrEqual(1);
  });
});
