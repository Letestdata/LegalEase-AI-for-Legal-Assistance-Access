import React from 'react';

export default function DisclaimerBanner({ 
  type = 'document', // 'document' | 'qa' | 'lawyer' | 'compact'
  className = '' 
}) {
  const messages = {
    document: 'This analysis explains the uploaded document and is not professional legal advice.',
    qa: 'Answers are based strictly on the uploaded document. They may not reflect applicable statutory law or your specific circumstances.',
    lawyer: 'Use this checklist to prepare for a discussion with a qualified legal professional.',
    compact: 'LegalEase provides legal information and document assistance, not definitive legal advice.'
  };

  const message = messages[type] || messages.compact;

  return (
    <div 
      role="note" 
      aria-label="Legal Disclaimer"
      className={`flex items-center gap-space-sm p-space-sm md:p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant ${className}`}
    >
      <span className="material-symbols-outlined text-[20px] text-secondary shrink-0">
        info
      </span>
      <p className="font-body-sm text-body-sm leading-relaxed">
        {message}
      </p>
    </div>
  );
}
