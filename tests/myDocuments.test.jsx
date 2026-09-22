import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MyDocumentsView from '../src/components/documents/MyDocumentsView';
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

describe('My Documents View', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders My Documents header and search input', async () => {
    await renderWithProviders(<MyDocumentsView onNavigate={() => {}} onOpenDocument={() => {}} />);
    expect(screen.getByText('My Documents')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search documents by name or keyword/i)).toBeInTheDocument();
  });

  it('renders format filter tabs (ALL, PDF, DOCX)', async () => {
    await renderWithProviders(<MyDocumentsView onNavigate={() => {}} onOpenDocument={() => {}} />);
    expect(screen.getByRole('tab', { name: /Filter by ALL format/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Filter by PDF format/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Filter by DOCX format/i })).toBeInTheDocument();
  });

  it('allows user to type into search input', async () => {
    await renderWithProviders(<MyDocumentsView onNavigate={() => {}} onOpenDocument={() => {}} />);
    const searchInput = screen.getByPlaceholderText(/Search documents by name or keyword/i);
    fireEvent.change(searchInput, { target: { value: 'Lease' } });
    expect(searchInput.value).toBe('Lease');
  });
});
