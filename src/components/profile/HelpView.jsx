import React from 'react';

export default function HelpView({ onNavigate }) {
  const faqs = [
    {
      q: 'What file formats can I upload to LegalEase?',
      a: 'LegalEase supports standard PDF, DOC, DOCX, and TXT files up to 25 MB in size.'
    },
    {
      q: 'Does LegalEase provide definitive legal advice?',
      a: 'No. LegalEase provides legal information and document assistance to help you understand terms in simple language. It does not replace a licensed attorney or create an attorney-client relationship.'
    },
    {
      q: 'How does Document Comparison work?',
      a: 'You can upload or select two versions of an agreement (e.g. an original lease and a revised renewal). LegalEase compares notice windows, fees, and obligations, grouping changes into "Important changes", "Changes to review", and "Minor changes".'
    },
    {
      q: 'How can I prepare for a discussion with a lawyer?',
      a: 'Use the "Prepare Questions" tool on any document. LegalEase generates an organized checklist of targeted questions, key section citations, and documentation to bring to your consultation, which you can copy or download.'
    },
    {
      q: 'What if information is missing from the document?',
      a: 'When you ask a question about an unmentioned topic, LegalEase will honestly state: "I couldn\'t find information about this in the uploaded document," rather than hallucinating an answer.'
    }
  ];

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-space-lg pb-space-xl text-left">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1 text-sm text-secondary hover:text-primary cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Home</span>
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
          Help Center & FAQs
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Everything you need to know about understanding agreements with LegalEase.
        </p>
      </div>

      <div className="flex flex-col gap-space-md">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-2"
          >
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              {faq.q}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
