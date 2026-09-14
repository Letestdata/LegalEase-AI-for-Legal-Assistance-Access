import React from 'react';
import UploadZone from './UploadZone';
import QuickActions from './QuickActions';
import RecentDocuments from './RecentDocuments';
import LoadingSteps from '../common/LoadingSteps';
import { useDocument } from '../../context/DocumentContext';

export default function DashboardView({ onNavigate, onOpenDocument }) {
  const { isAnalyzing, analysisStep, analysisProgress } = useDocument();

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Top Welcome & System Status Bar */}
      <div className="relative flex flex-col md:flex-row items-start md:items-end justify-between gap-space-lg">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="inline-flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span>Good morning</span>
            <span className="text-[16px]">👋</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim ml-space-xs"></span>
            <span className="text-tertiary font-label-sm text-label-sm tracking-wide uppercase font-semibold">
              AI Analyzer Ready
            </span>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Understand your legal documents in simple language.
          </h1>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Upload a document to find important points, understand difficult clauses, and prepare questions before you sign.
          </p>
        </div>

        {/* Security & Engine status badge */}
        <div className="hidden lg:flex items-center gap-space-md p-space-sm bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-space-sm px-space-md py-space-xs rounded-lg bg-surface-container-low">
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Analysis Engine
              </span>
              <span className="font-label-md text-label-md text-primary font-semibold">
                Online & Encrypted
              </span>
            </div>
          </div>
          <div className="h-8 w-px bg-surface-container-high"></div>
          <div className="flex items-center gap-space-xs text-on-surface-variant px-space-xs">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="font-label-md text-label-md font-medium">256-bit AES</span>
          </div>
        </div>
      </div>

      {/* Main Upload Zone or Active Analysis Progress */}
      {isAnalyzing ? (
        <LoadingSteps 
          currentStep={analysisStep} 
          progressPercent={analysisProgress} 
        />
      ) : (
        <UploadZone 
          onUploadComplete={() => onNavigate('overview')} 
        />
      )}

      {/* Side-by-side Quick Action Cards */}
      <QuickActions 
        onNavigate={onNavigate}
        onPrepareQuestions={() => onNavigate('overview', { openLawyerChecklist: true })}
      />

      {/* Recent Documents Section */}
      <RecentDocuments 
        onOpenDocument={onOpenDocument}
        onViewAll={() => onNavigate('my-documents')}
      />
    </div>
  );
}
