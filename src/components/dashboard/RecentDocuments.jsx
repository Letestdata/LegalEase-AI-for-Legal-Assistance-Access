import React from 'react';
import { useDocument } from '../../context/DocumentContext';

export default function RecentDocuments({ onOpenDocument, onViewAll }) {
  const { documents, selectDocument } = useDocument();

  const displayDocs = documents.slice(0, 3);

  const handleOpen = (doc) => {
    selectDocument(doc);
    if (onOpenDocument) {
      onOpenDocument(doc);
    }
  };

  if (displayDocs.length === 0) {
    return (
      <section className="flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
          Recent documents
        </h2>
        <div className="p-space-xl text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-space-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">description</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-primary">No documents yet</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Upload your first legal document to get started understanding complicated terms.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
            Recent documents
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
            {documents.length} files
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-space-xs text-secondary hover:text-primary font-label-lg text-label-lg transition-colors cursor-pointer"
        >
          <span>View all documents</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {displayDocs.map((doc) => {
          const isReview = doc.statusType === 'review';

          return (
            <div
              key={doc.id}
              className="flex flex-col justify-between p-space-md bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-outline-variant/30 group"
            >
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold font-label-sm text-label-sm ${
                      doc.fileType === 'DOCX'
                        ? 'bg-primary-fixed text-primary'
                        : isReview
                        ? 'bg-error-container/40 text-error'
                        : 'bg-secondary-container text-primary'
                    }`}
                  >
                    {doc.fileType || 'PDF'}
                  </div>

                  {isReview ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container/50 text-on-error-container font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      {doc.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed/40 text-tertiary font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      Ready
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <h3
                    className="font-headline-sm text-headline-sm text-primary truncate font-semibold"
                    title={doc.title}
                  >
                    {doc.title}
                  </h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {doc.analyzedAt} • {doc.pages} pages
                  </span>
                </div>

                <div className="p-space-xs rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm leading-snug">
                  <span className="font-semibold text-primary">
                    {isReview ? 'Key risk: ' : 'Status: '}
                  </span>
                  {doc.riskSummary}
                </div>
              </div>

              <div className="mt-space-md pt-space-xs flex items-center justify-between border-t border-outline-variant/20">
                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  {doc.updatedAt}
                </span>
                <button
                  onClick={() => handleOpen(doc)}
                  className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-secondary-container text-primary font-label-md text-label-md transition-colors cursor-pointer group-hover:bg-secondary-container"
                  type="button"
                >
                  <span>Open</span>
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
