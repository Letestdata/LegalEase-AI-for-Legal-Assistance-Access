import React from 'react';
import { PROCESSING_STEPS } from '../../services/aiService';

export default function LoadingSteps({ currentStep, progressPercent }) {
  const currentIdx = PROCESSING_STEPS.indexOf(currentStep);

  return (
    <div 
      className="flex flex-col items-center justify-center p-space-lg md:p-space-xl bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 max-w-xl mx-auto w-full my-space-lg text-center"
      role="status"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center text-primary-container mb-space-md shadow-sm relative">
        <span className="material-symbols-outlined text-[32px] animate-spin">
          progress_activity
        </span>
      </div>

      <h3 className="font-headline-md text-headline-md text-primary mb-space-xs font-semibold">
        {currentStep || 'Analyzing document...'}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg max-w-md">
        We are translating complex legal clauses into plain English and highlighting key conditions.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden mb-space-lg">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.max(5, progressPercent || 15)}%` }}
        ></div>
      </div>

      {/* Step Sequence List */}
      <div className="w-full flex flex-col gap-2.5 text-left border-t border-outline-variant/20 pt-space-md">
        {PROCESSING_STEPS.map((step, idx) => {
          const isDone = currentIdx > idx;
          const isCurrent = currentIdx === idx;

          return (
            <div 
              key={step}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isCurrent 
                  ? 'bg-secondary-container/40 text-primary font-medium'
                  : isDone 
                    ? 'text-on-surface-variant' 
                    : 'text-on-surface-variant/50'
              }`}
            >
              {isDone ? (
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  check_circle
                </span>
              ) : isCurrent ? (
                <span className="material-symbols-outlined text-[18px] text-secondary animate-pulse">
                  radio_button_checked
                </span>
              ) : (
                <span className="material-symbols-outlined text-[18px] text-outline-variant">
                  radio_button_unchecked
                </span>
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
