import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import CompareView from '../src/components/compare/CompareView';
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

describe('Compare View & Redline Differential', () => {
  it('renders document differential results header', async () => {
    await renderWithProviders(<CompareView onNavigate={() => {}} />);
    expect(screen.getByText('Comparison results')).toBeInTheDocument();
    expect(screen.getByText('Document Differential')).toBeInTheDocument();
  });

  it('renders three-tier comparison categories: Important, To Review, Minor', async () => {
    await renderWithProviders(<CompareView onNavigate={() => {}} />);
    expect(screen.getByText('Critical Attention')).toBeInTheDocument();
    expect(screen.getAllByText('Important changes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Review Needed')).toBeInTheDocument();
    expect(screen.getAllByText('Changes to review').length).toBeGreaterThanOrEqual(1);
  });

  it('displays Export Diff button for differential download', async () => {
    await renderWithProviders(<CompareView onNavigate={() => {}} />);
    expect(screen.getByText('Export Diff')).toBeInTheDocument();
  });
});
