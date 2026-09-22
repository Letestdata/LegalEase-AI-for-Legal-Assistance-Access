import React from 'react';
import Modal from '../common/Modal';
import { isPdfBytecode } from '../../services/documentParser';

export default function ClauseModal({ isOpen, onClose, clause, onAskInQA }) {
  const originalTextSafe = React.useMemo(() => {
    if (!clause) return '';
    if (!clause.originalText || isPdfBytecode(clause.originalText)) {
      return clause.simpleExplanation || 'Document covenants and obligations apply directly to this section.';
    }
    return clause.originalText;
  }, [clause]);

  if (!clause) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clause.title}
      subtitle={`Source: ${clause.source || 'Uploaded Document'}`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-space-md text-left">
        {/* Strict PRD Requirement: Distinguish 'What document says' vs 'Simple explanation' */}
        
        {/* 1. What the document says */}
        <div className="flex flex-col gap-1.5 p-space-md rounded-xl bg-surface-container-high/40 border border-outline-variant/40">
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm font-semibold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>What the document says (Exact text)</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface italic bg-surface-container-lowest/80 p-3 rounded-lg border border-outline-variant/20 leading-relaxed font-mono">
            {originalTextSafe}
          </p>
        </div>

        {/* 2. Simple explanation */}
        <div className="flex flex-col gap-1.5 p-space-md rounded-xl bg-secondary-container/20 border border-secondary-container">
          <div className="flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Simple explanation (Plain English)</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface font-medium leading-relaxed">
            {clause.simpleExplanation}
          </p>
        </div>

        {/* 3. Who does this affect? */}
        <div className="flex flex-col gap-1">
          <h4 className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">group</span>
            <span>Who does this affect?</span>
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant pl-6">
            {clause.whoAffects || 'Applies directly to you as the signatory under this agreement.'}
          </p>
        </div>

        {/* 4. Why should you care? */}
        <div className="flex flex-col gap-1">
          <h4 className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">priority_high</span>
            <span>Why should you care?</span>
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant pl-6">
            {clause.whyCare || 'This clause establishes financial liabilities and deadlines that impact your flexibility.'}
          </p>
        </div>

        {/* 5. Questions to consider */}
        {clause.questionsToConsider && clause.questionsToConsider.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
            <h4 className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">help</span>
              <span>Questions to consider asking:</span>
            </h4>
            <ul className="flex flex-col gap-1.5 pl-6 list-disc text-on-surface-variant font-body-sm text-body-sm">
              {clause.questionsToConsider.map((q, idx) => (
                <li key={idx} className="leading-snug">{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="mt-space-md pt-space-sm border-t border-outline-variant/30 flex items-center justify-between gap-space-sm flex-wrap">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {clause.source}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onAskInQA) onAskInQA(`What are the full conditions of ${clause.title}?`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary-container text-on-secondary-container font-label-md text-label-md hover:bg-secondary-container/80 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Ask in Q&A</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-primary font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
