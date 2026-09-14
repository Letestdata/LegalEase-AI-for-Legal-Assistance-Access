import React, { useState } from 'react';
import { useDocument } from '../../context/DocumentContext';
import Modal from '../common/Modal';

export default function MyDocumentsView({ onNavigate, onOpenDocument }) {
  const { documents, selectDocument, deleteDocument, renameDocument } = useDocument();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'PDF' | 'DOCX'
  const [renamingDoc, setRenamingDoc] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [deletingDocId, setDeletingDocId] = useState(null);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedFilter === 'ALL' || (doc.fileType || '').toUpperCase() === selectedFilter;
    return matchesSearch && matchesType;
  });

  const handleOpen = (doc) => {
    selectDocument(doc);
    if (onOpenDocument) onOpenDocument(doc);
    onNavigate('overview');
  };

  const handleStartRename = (doc) => {
    setRenamingDoc(doc);
    setNewTitle(doc.title);
  };

  const handleSaveRename = async () => {
    if (renamingDoc && newTitle.trim()) {
      await renameDocument(renamingDoc.id, newTitle.trim());
      setRenamingDoc(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingDocId) {
      await deleteDocument(deletingDocId);
      setDeletingDocId(null);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-space-xl">
      {/* Header & Search / Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
            My Documents
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your analyzed contracts, search legal terms, and track review status.
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-primary transition-colors cursor-pointer self-start md:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-space-sm p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by name or keyword..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-transparent border-none focus:outline-none text-on-surface placeholder:text-on-surface-variant/60"
          />
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          {['ALL', 'PDF', 'DOCX'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="p-space-xl text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center gap-space-sm my-space-md">
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-1">
            <span className="material-symbols-outlined text-[28px]">folder_open</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
            No documents yet
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            {searchTerm
              ? `No documents matched "${searchTerm}". Try a different search keyword.`
              : 'Upload your first legal document to get started.'}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-2 inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {filteredDocs.map((doc) => {
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

                    <div className="flex items-center gap-1">
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
                  </div>

                  <div className="flex flex-col">
                    <h3
                      className="font-headline-sm text-headline-sm text-primary truncate font-semibold"
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {doc.fileType} • {doc.fileSize} • {doc.analyzedAt}
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartRename(doc)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors cursor-pointer"
                      title="Rename document"
                      aria-label={`Rename ${doc.title}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingDocId(doc.id)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded transition-colors cursor-pointer"
                      title="Delete document"
                      aria-label={`Delete ${doc.title}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpen(doc)}
                    className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-secondary-container text-primary font-label-md text-label-md transition-colors cursor-pointer"
                    type="button"
                  >
                    <span>Open</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename Document Modal */}
      {renamingDoc && (
        <Modal
          isOpen={Boolean(renamingDoc)}
          onClose={() => setRenamingDoc(null)}
          title="Rename Document"
          subtitle={`Rename ${renamingDoc.fileName}`}
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new document title"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container text-sm text-on-surface border border-outline-variant/60 focus:outline-none focus:border-primary"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenamingDoc(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                disabled={!newTitle.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold disabled:opacity-50 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDocId && (
        <Modal
          isOpen={Boolean(deletingDocId)}
          onClose={() => setDeletingDocId(null)}
          title="Delete Document"
          subtitle="Are you sure you want to delete this document?"
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              This action will permanently delete this document and its associated AI analysis from your account. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingDocId(null)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-semibold hover:bg-error/90 cursor-pointer"
              >
                Delete Document
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
