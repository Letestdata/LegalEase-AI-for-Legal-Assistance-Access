import React, { useState } from 'react';
import Modal from '../common/Modal';
import DisclaimerBanner from '../common/DisclaimerBanner';

export default function LawyerChecklist({ isOpen, onClose, prepData }) {
  const defaultPrep = {
    mainConcern: 'Early termination fees, notice windows, and security deposit recovery conditions.',
    relevantSections: [
      'Section 14.2 (Early Termination Charge)',
      'Section 5.1 (60-Day Notice Period)',
      'Section 8.3 (Security Deposit Escrow)'
    ],
    questions: [
      { text: 'Can the early termination liquidated damages fee be amended or capped at 1 month?', checked: false },
      { text: 'What happens if unforeseen circumstances (e.g. medical or job relocation) prevent providing 60 days notice?', checked: false },
      { text: 'Under what specific conditions can the counterparty lawfully withhold my security deposit?', checked: false },
      { text: 'Can the automatic 12-month renewal rollover be modified to standard month-to-month tenancy?', checked: false }
    ],
    documentsToPrepare: [
      { text: 'Signed or proposed agreement contract in full', checked: false },
      { text: 'Proof of deposits, fee schedules, or previous payment receipts', checked: false },
      { text: 'All written correspondence, emails, or messages exchanged regarding terms', checked: false },
      { text: 'Chronological timeline of important dates and notice deadlines', checked: false }
    ]
  };

  const data = prepData || defaultPrep;

  const [questions, setQuestions] = useState(data.questions);
  const [documents, setDocuments] = useState(data.documentsToPrepare);
  const [copyNotice, setCopyNotice] = useState(false);

  const toggleQuestion = (index) => {
    setQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], checked: !next[index].checked };
      return next;
    });
  };

  const toggleDocument = (index) => {
    setDocuments(prev => {
      const next = [...prev];
      next[index] = { ...next[index], checked: !next[index].checked };
      return next;
    });
  };

  const handleCopyQuestions = () => {
    const textToCopy = [
      'LEGAL CONSULTATION QUESTIONS — LegalEase',
      `Main Concern: ${data.mainConcern}`,
      '',
      'Relevant Sections:',
      ...data.relevantSections.map(s => `• ${s}`),
      '',
      'Questions to ask lawyer:',
      ...questions.map(q => `[${q.checked ? 'X' : ' '}] ${q.text}`),
      '',
      'Documents to bring:',
      ...documents.map(d => `[${d.checked ? 'X' : ' '}] ${d.text}`)
    ].join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2500);
  };

  const handleDownloadChecklist = () => {
    const content = [
      '# LegalEase — Consultation Preparation Checklist',
      '',
      '> Use this checklist to prepare for a discussion with a qualified legal professional.',
      '',
      `## Main Concern:`,
      data.mainConcern,
      '',
      `## Relevant Sections:`,
      ...data.relevantSections.map(s => `- ${s}`),
      '',
      `## Key Questions to Discuss:`,
      ...questions.map(q => `- [${q.checked ? 'x' : ' '}] ${q.text}`),
      '',
      `## Documentation to Prepare:`,
      ...documents.map(d => `- [${d.checked ? 'x' : ' '}] ${d.text}`),
      '',
      '---',
      'Generated with LegalEase — Understand before you sign.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LegalEase_Lawyer_Checklist.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lawyer Consultation Preparation"
      subtitle="Organized questions and document checklist to optimize your legal consultation"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-space-md text-left">
        {/* Contextual disclaimer per PRD §26 */}
        <DisclaimerBanner type="lawyer" />

        {/* Main concern */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Primary Area of Concern
          </span>
          <p className="font-headline-sm text-sm text-primary font-semibold">
            {data.mainConcern}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {data.relevantSections.map((sec, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-surface-container text-xs text-on-surface-variant font-medium"
              >
                {sec}
              </span>
            ))}
          </div>
        </div>

        {/* Questions checklist */}
        <div className="flex flex-col gap-2">
          <h3 className="font-label-lg text-label-lg text-primary font-bold flex items-center justify-between">
            <span>Questions to ask your lawyer</span>
            <span className="text-xs font-normal text-on-surface-variant">
              {questions.filter(q => q.checked).length} of {questions.length} checked
            </span>
          </h3>

          <div className="flex flex-col gap-1.5">
            {questions.map((q, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  q.checked
                    ? 'bg-secondary-container/30 border-secondary'
                    : 'bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="checkbox"
                  checked={q.checked}
                  onChange={() => toggleQuestion(idx)}
                  className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className={`text-sm leading-snug ${q.checked ? 'text-primary font-medium' : 'text-on-surface'}`}>
                  {q.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Documents to bring checklist */}
        <div className="flex flex-col gap-2">
          <h3 className="font-label-lg text-label-lg text-primary font-bold flex items-center justify-between">
            <span>Information & documents to prepare</span>
            <span className="text-xs font-normal text-on-surface-variant">
              {documents.filter(d => d.checked).length} of {documents.length} ready
            </span>
          </h3>

          <div className="flex flex-col gap-1.5">
            {documents.map((docItem, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  docItem.checked
                    ? 'bg-tertiary-fixed/30 border-tertiary'
                    : 'bg-surface-container-lowest border-outline-variant/40 hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="checkbox"
                  checked={docItem.checked}
                  onChange={() => toggleDocument(idx)}
                  className="mt-0.5 rounded border-outline-variant text-tertiary focus:ring-tertiary w-4 h-4 cursor-pointer"
                />
                <span className={`text-sm leading-snug ${docItem.checked ? 'text-tertiary font-medium' : 'text-on-surface'}`}>
                  {docItem.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-space-sm pt-space-md border-t border-outline-variant/30 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuestions}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high hover:bg-secondary-container text-primary font-label-md text-label-md transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              <span>{copyNotice ? 'Copied to Clipboard!' : 'Copy Questions'}</span>
            </button>

            <button
              onClick={handleDownloadChecklist}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Checklist</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
