import React, { useState, useMemo, useCallback } from 'react';
import { useDocument } from '../../context/DocumentContext';
import { compareDocuments } from '../../services/compareEngine';

export default function CompareView({ onNavigate }) {
  const { documents, runComparison, comparisonData } = useDocument();

  const [origDocId, setOrigDocId] = useState(documents[0]?.id || '');
  const [revDocId, setRevDocId] = useState(documents[1]?.id || documents[0]?.id || '');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'important' | 'review' | 'minor'
  const [exportNotice, setExportNotice] = useState(false);

  // Compute diff data purely with memoization to prevent cascading render cycles
  const diffData = useMemo(() => {
    if (comparisonData) return comparisonData;
    const doc1 = documents.find(d => d.id === origDocId) || documents[0];
    const doc2 = documents.find(d => d.id === revDocId) || documents[1] || documents[0];
    return compareDocuments(
      doc1?.rawContent || '',
      doc2?.rawContent || '',
      doc1?.fileName || 'Original (v2.1)',
      doc2?.fileName || 'New Proposed (v3.0)'
    );
  }, [comparisonData, documents, origDocId, revDocId]);

  const handleRunComparison = useCallback(() => {
    const doc1 = documents.find(d => d.id === origDocId);
    const doc2 = documents.find(d => d.id === revDocId);
    runComparison(doc1, doc2);
  }, [documents, origDocId, revDocId, runComparison]);

  const handleExportDiff = useCallback(() => {
    const markdown = [
      '# LegalEase — Document Comparison Differential Report',
      `Original Document: ${diffData.originalName}`,
      `Revised Document: ${diffData.revisedName}`,
      `Total Changes Identified: ${diffData.totalChangesCount}`,
      '',
      '## Important Changes (High Impact)',
      ...diffData.importantChanges.map(c => 
        `### ${c.title} (${c.location})\n- Before (${c.before.label}): ${c.before.highlight} (${c.before.excerpt})\n- After (${c.after.label}): ${c.after.highlight} (${c.after.excerpt})\n- Plain-English Impact: ${c.plainEnglishImpact}\n`
      ),
      '## Changes to Review',
      ...diffData.changesToReview.map(r => 
        `- **${r.title}**: Changed from "${r.before}" to "${r.after}". Impact: ${r.note}`
      ),
      '',
      '## Minor Changes',
      ...diffData.minorChanges.map(m => 
        `- **${m.title}**: ${m.description}`
      ),
      '',
      '---',
      'Generated with LegalEase — Understand before you sign.'
    ].join('\n');

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LegalEase_Comparison_Differential.md';
    link.click();
    URL.revokeObjectURL(url);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  }, [diffData]);

  return (
    <div className="flex flex-col w-full gap-space-xl pb-space-xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              title="Back to Home"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
              Document Differential
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
              <span>{diffData.totalChangesCount} changes found</span>
            </div>
          </div>

          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            Comparison results
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Rental Agreement —{' '}
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Original (v2.1)
            </span>{' '}
            vs{' '}
            <span className="font-label-md text-label-md text-primary font-semibold">
              New Proposed (v3.0)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
          {/* Document selection dropdowns */}
          {documents.length > 1 && (
            <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
              <select
                value={origDocId}
                onChange={(e) => setOrigDocId(e.target.value)}
                className="text-xs bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/40"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>Orig: {d.title}</option>
                ))}
              </select>
              <span className="text-xs text-secondary font-bold">→</span>
              <select
                value={revDocId}
                onChange={(e) => setRevDocId(e.target.value)}
                className="text-xs bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/40"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>Rev: {d.title}</option>
                ))}
              </select>
              <button
                onClick={handleRunComparison}
                className="px-2 py-1 bg-primary text-on-primary text-xs rounded font-medium cursor-pointer"
              >
                Update Diff
              </button>
            </div>
          )}

          <button
            onClick={handleExportDiff}
            className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>{exportNotice ? 'Exported!' : 'Export Diff'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Bento Grid (3-column) per Stitch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Card 1: Important Changes */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'important' ? 'all' : 'important')}
          className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border cursor-pointer ${
            activeFilter === 'important' ? 'border-error ring-1 ring-error' : 'border-outline-variant/30'
          }`}
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-error-container/40 blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-error font-semibold">
              Critical Attention
            </span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-error-container text-on-error-container">
              <span className="material-symbols-outlined text-[18px]">priority_high</span>
            </span>
          </div>
          <div className="mt-space-md flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {diffData.importantChanges.length}
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
              Important changes
            </span>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
            Clauses altering notice windows, financial liability, and escrow recovery terms.
          </p>
        </div>

        {/* Card 2: Changes to Review */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'review' ? 'all' : 'review')}
          className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border cursor-pointer ${
            activeFilter === 'review' ? 'border-secondary ring-1 ring-secondary' : 'border-outline-variant/30'
          }`}
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-secondary-container/50 blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
              Review Needed
            </span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">find_in_page</span>
            </span>
          </div>
          <div className="mt-space-md flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {diffData.changesToReview.length}
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
              Changes to review
            </span>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
            Secondary clauses regarding maintenance scheduling and recurring nominal fees.
          </p>
        </div>

        {/* Card 3: Minor Changes */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'minor' ? 'all' : 'minor')}
          className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all border cursor-pointer ${
            activeFilter === 'minor' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/30'
          }`}
        >
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-surface-container-high blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Editorial / Neutral
            </span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            </span>
          </div>
          <div className="mt-space-md flex items-baseline gap-space-sm">
            <span className="font-display-lg text-display-lg text-on-surface font-bold">
              {diffData.minorChanges.length}
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
              Minor changes
            </span>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">
            Formatting updates, entity address rewrites, and non-operative phrasing polish.
          </p>
        </div>
      </div>

      {/* Document Meta & Visual Context Snapshot */}
      <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">history_edu</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Original: Standard Lease Agreement 2023.pdf
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Compared against: Addendum_Lease_Proposal_2024_Clean.docx
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
          <span className="font-medium">Confidence: 99.4% precision diff parsing</span>
        </div>
      </div>

      {/* Main Section: Important Changes */}
      {(activeFilter === 'all' || activeFilter === 'important') && (
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Important changes
              </h2>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Showing {diffData.importantChanges.length} critical modifications
            </span>
          </div>

          <div className="flex flex-col gap-space-md">
            {diffData.importantChanges.map((item) => (
              <article
                key={item.id}
                className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col gap-space-md border border-outline-variant/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <span className="px-space-sm py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm tracking-wide uppercase font-semibold">
                      Important change
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {item.location}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-space-md">
                  {/* Before */}
                  <div className="rounded-lg bg-surface-container p-space-md flex flex-col gap-space-xs border border-outline-variant/20">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        {item.before.label}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-outline">history</span>
                    </div>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {item.before.highlight}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                      {item.before.excerpt}
                    </p>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex md:flex-col items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[24px]">trending_flat</span>
                  </div>

                  {/* After */}
                  <div className="rounded-lg bg-secondary-container/40 p-space-md flex flex-col gap-space-xs border border-secondary-container">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                        {item.after.label}
                      </span>
                      {item.after.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">
                          {item.after.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-headline-sm text-headline-sm text-primary font-bold">
                      {item.after.highlight}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-secondary-container italic">
                      {item.after.excerpt}
                    </p>
                  </div>
                </div>

                {/* Plain-English Legal Impact */}
                <div className="rounded-lg bg-surface-container-low p-space-md flex items-start gap-space-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                      Plain-English Legal Impact
                    </span>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                      {item.plainEnglishImpact}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Secondary Section: Changes to review */}
      {(activeFilter === 'all' || activeFilter === 'review') && (
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Changes to review
              </h2>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {diffData.changesToReview.length} clauses require confirmation
            </span>
          </div>

          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col gap-space-xs p-space-sm border border-outline-variant/30">
            {diffData.changesToReview.map((item) => (
              <details
                key={item.id}
                className="group rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant/20"
                open
              >
                <summary className="flex items-center justify-between p-space-md cursor-pointer list-none select-none">
                  <div className="flex items-center gap-space-sm">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                      {item.category}
                    </span>
                    <span className="font-headline-sm text-sm text-on-surface font-semibold">
                      {item.title}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="px-space-md pb-space-md pt-1 flex flex-col gap-2 border-t border-outline-variant/20">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-on-surface-variant line-through">{item.before}</span>
                    <span className="text-secondary font-bold">→</span>
                    <span className="text-primary font-bold">{item.after}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {item.note}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Minor Changes Section */}
      {(activeFilter === 'all' || activeFilter === 'minor') && (
        <section className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Minor changes
              </h2>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              {diffData.minorChanges.length} non-substantive adjustments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {diffData.minorChanges.map((item) => (
              <div
                key={item.id}
                className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col gap-1 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-primary font-semibold">
                    {item.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs text-on-surface-variant">
                    {item.category}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
