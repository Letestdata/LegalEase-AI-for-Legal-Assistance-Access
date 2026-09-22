import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from '../src/App';
import Modal from '../src/components/common/Modal';
import UploadZone from '../src/components/dashboard/UploadZone';
import { DocumentProvider } from '../src/context/DocumentContext';
import { AuthProvider } from '../src/context/AuthContext';

describe('WCAG 2.1 AA Accessibility & Keyboard Usability', () => {
  it('provides a skip-to-main-content link targeting #main-content', async () => {
    await act(async () => {
      render(<App />);
    });
    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('contains proper semantic ARIA landmark regions (banner, main, navigation)', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getAllByRole('navigation').length).toBeGreaterThanOrEqual(1);
  });

  it('modal implements WCAG dialog role, aria-modal, and labeledby attribute', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Dialog Title">
        <p>Dialog content</p>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    expect(screen.getByRole('button', { name: /Close dialog/i })).toBeInTheDocument();
  });

  it('upload zone provides accessible role, tabIndex, and aria-label for keyboard and screen reader users', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <DocumentProvider>
            <UploadZone onUploadComplete={() => {}} />
          </DocumentProvider>
        </AuthProvider>
      );
    });
    const dropZone = screen.getByRole('button', { name: /Drag and drop or browse to upload document/i });
    expect(dropZone).toBeInTheDocument();
    expect(dropZone.getAttribute('tabIndex')).toBe('0');
    expect(screen.getByLabelText(/Upload legal document/i)).toBeInTheDocument();
  });
});
