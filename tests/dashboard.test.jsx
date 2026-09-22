import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import DashboardView from '../src/components/dashboard/DashboardView';
import QuickActions from '../src/components/dashboard/QuickActions';
import RecentDocuments from '../src/components/dashboard/RecentDocuments';
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

describe('Dashboard Experience & Core User Journey', () => {
  it('renders dashboard greeting, status badges, and value proposition', async () => {
    await renderWithProviders(<DashboardView onNavigate={() => {}} onOpenDocument={() => {}} />);
    expect(screen.getByText(/Good morning/i)).toBeInTheDocument();
    expect(screen.getByText('Understand your legal documents in simple language.')).toBeInTheDocument();
    expect(screen.getByText('AI Analyzer Ready')).toBeInTheDocument();
  });

  it('renders quick actions for comparison and questions', () => {
    render(
      <QuickActions 
        onNavigate={() => {}} 
        onPrepareQuestions={() => {}} 
      />
    );
    expect(screen.getByText('Compare documents')).toBeInTheDocument();
    expect(screen.getByText('Ask about a document')).toBeInTheDocument();
  });

  it('renders recent documents section', async () => {
    await renderWithProviders(
      <RecentDocuments 
        onOpenDocument={() => {}} 
        onViewAll={() => {}} 
      />
    );
    expect(screen.getByText('Recent documents')).toBeInTheDocument();
  });
});
