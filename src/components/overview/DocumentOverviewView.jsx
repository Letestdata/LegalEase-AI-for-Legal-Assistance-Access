import React, { useState } from 'react';
import SummaryCards from './SummaryCards';
import ImportantPointsList from './ImportantPointsList';
import AgreementsScope from './AgreementsScope';
import ClauseModal from './ClauseModal';
import DocumentQA from '../qa/DocumentQA';
import LawyerChecklist from '../lawyer/LawyerChecklist';
import { useDocument } from '../../context/DocumentContext';

export default function DocumentOverviewView({ 
  onNavigate, 
  initialOpenQA = false,
  initialOpenLawyer = false 
}) {
  const { activeDocument, activeAnalysis } = useDocument();

  const [selectedClause, setSelectedClause] = useState(null);
  const [isQAOpen, setIsQAOpen] = useState(initialOpenQA);
  const [isLawyerOpen, setIsLawyerOpen] = useState(initialOpenLawyer);
  const [prefilledQuestion, setPrefilledQuestion] = useState('');

  const docTitle = activeDocument?.title || 'Rental Agreement';
  const fileName = activeDocument?.fileName || 'Rental_Agreement.pdf';
  const analyzedAt = activeDocument?.analyzedAt || 'Analyzed today';

  const stats = activeAnalysis?.stats || {
    importantPointsCount: 8,
    obligationsCount: 5,
    deadlinesCount: 3,
    pointsToReviewCount: 4
  };

  const handleAskInQA = (questionText) => {
    setPrefilledQuestion(questionText);
    setIsQAOpen(true);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Top Context Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <button
            onClick={() => onNavigate('my-documents')}
            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-secondary hover:text-primary transition-colors group w-fit cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>Back to documents</span>
          </button>

          <div className="flex items-baseline gap-space-md flex-wrap pt-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              {docTitle}
            </h1>
            <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
              {fileName} • {analyzedAt}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => setIsLawyerOpen(true)}
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high text-primary font-label-lg text-label-lg hover:bg-surface-variant transition-colors shadow-sm cursor-pointer font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            <span>Prepare Questions</span>
          </button>
          <button
            onClick={() => setIsQAOpen(true)}
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-md cursor-pointer font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
            <span>Ask about this document</span>
          </button>
        </div>
      </div>

      {/* Top Overview / Summary Card */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-surface-container-low rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Document synthesis
              </span>
              <span className="px-space-sm py-0.5 rounded-full font-label-sm text-label-sm bg-[#FFF7E6] text-[#A46E13] font-semibold">
                {activeAnalysis?.overallReview || 'Review carefully'}
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Overall review
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {activeAnalysis?.reviewSummary ||
                'We found several points you may want to understand before signing. Key focus items include custom termination fees, strict notice windows, and security retention clauses.'}
            </p>
          </div>

          {/* Visual summary indicator */}
          <div className="flex items-center gap-space-md p-space-sm rounded-xl bg-surface-container-low self-start md:self-center border border-outline-variant/20">
            <div className="relative flex items-center justify-center w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle
                  className="text-surface-container-high"
                  cx="24"
                  cy="24"
                  fill="none"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <circle
                  className="text-secondary"
                  cx="24"
                  cy="24"
                  fill="none"
                  r="20"
                  stroke="currentColor"
                  strokeDasharray="125.6"
                  strokeDashoffset="40"
                  strokeLinecap="round"
                  strokeWidth="4"
                ></circle>
              </svg>
              <span className="material-symbols-outlined text-primary text-[22px] absolute">
                verified
              </span>
            </div>
            <div className="flex flex-col pr-space-sm">
              <span className="font-label-md text-label-md text-primary font-semibold">
                Grounded parse
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {stats.pointsToReviewCount} clauses flagged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Statistics Grid */}
      <SummaryCards stats={stats} />

      {/* Bento Arrangement: Important Points & Structural Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-7">
          <ImportantPointsList
            points={activeAnalysis?.importantPoints}
            onSelectPoint={(clause) => setSelectedClause(clause)}
          />
        </div>
        <div className="lg:col-span-5">
          <AgreementsScope obligations={activeAnalysis?.obligations} />
        </div>
      </div>

      {/* Bottom Sticky Reassurance & Action Bar */}
      <div className="sticky bottom-4 z-30 flex flex-col md:flex-row items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-lowest/95 backdrop-blur-md shadow-xl border border-outline-variant/40">
        <div className="flex items-center gap-space-sm max-w-xl">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">
            info
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            LegalEase provides information and document assistance, not professional legal advice.
          </p>
        </div>
        <div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
          <button
            onClick={() => setIsLawyerOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high text-primary font-label-lg text-label-lg hover:bg-surface-variant transition-colors cursor-pointer font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            <span>Prepare Questions</span>
          </button>
          <button
            onClick={() => setIsQAOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors shadow-sm cursor-pointer font-medium"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
            <span>Ask about this document</span>
          </button>
        </div>
      </div>

      {/* Clause Detail Explanation Modal */}
      <ClauseModal
        isOpen={Boolean(selectedClause)}
        onClose={() => setSelectedClause(null)}
        clause={selectedClause}
        onAskInQA={handleAskInQA}
      />

      {/* Grounded Document Q&A Drawer / Modal */}
      <DocumentQA
        isOpen={isQAOpen}
        onClose={() => {
          setIsQAOpen(false);
          setPrefilledQuestion('');
        }}
        prefilledQuestion={prefilledQuestion}
      />

      {/* Lawyer Consultation Preparation Checklist Modal */}
      <LawyerChecklist
        isOpen={isLawyerOpen}
        onClose={() => setIsLawyerOpen(false)}
        prepData={activeAnalysis?.lawyerPrep}
      />
    </div>
  );
}
