import React from 'react';

export default function QuickActions({ onNavigate, onPrepareQuestions }) {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        {/* Compare documents card */}
        <div className="group flex flex-col justify-between p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 border border-outline-variant/30">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary-container transition-colors duration-200">
                <span className="material-symbols-outlined text-[24px]">compare_arrows</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full font-medium">
                Side-by-side
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-space-xs">
              <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                Compare documents
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                See what changed between two versions with redlines translated into straightforward impact summaries.
              </p>
            </div>
          </div>
          <div className="pt-space-lg mt-space-md flex items-center justify-between">
            <button
              onClick={() => onNavigate('compare')}
              className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high text-primary font-label-lg text-label-lg hover:bg-secondary-container transition-colors cursor-pointer"
              type="button"
            >
              <span>Compare</span>
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            </button>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Diff revision detection
            </span>
          </div>
        </div>

        {/* Ask about a document card */}
        <div className="group flex flex-col justify-between p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 border border-outline-variant/30">
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary-container transition-colors duration-200">
                <span className="material-symbols-outlined text-[24px]">forum</span>
              </div>
              <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed/30 px-2.5 py-1 rounded-full font-medium">
                Interactive Q&A
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-space-xs">
              <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                Ask about a document
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Ask targeted questions about documents you have analyzed to quickly clarify obligations and deadlines.
              </p>
            </div>
          </div>
          <div className="pt-space-lg mt-space-md flex items-center justify-between">
            <button
              onClick={() => onNavigate('overview', { openQA: true })}
              className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high text-primary font-label-lg text-label-lg hover:bg-secondary-container transition-colors cursor-pointer"
              type="button"
            >
              <span>Ask a Question</span>
              <span className="material-symbols-outlined text-[16px]">chat</span>
            </button>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Context-aware answers
            </span>
          </div>
        </div>
      </section>

      {/* Lawyer prep assistance banner */}
      <section className="rounded-2xl bg-surface-container p-space-lg shadow-sm border border-outline-variant/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-space-md max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">balance</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">
                Need professional legal help?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                LegalEase can help you prepare organized information and targeted questions for a qualified legal professional, saving you time and consultation fees.
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                if (onPrepareQuestions) onPrepareQuestions();
                else onNavigate('overview', { openLawyerChecklist: true });
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">list_alt</span>
              <span>Prepare Questions</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
