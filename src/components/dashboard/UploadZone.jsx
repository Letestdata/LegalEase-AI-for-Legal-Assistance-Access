import React, { useState, useRef } from 'react';
import { useDocument } from '../../context/DocumentContext';

export default function UploadZone({ onUploadComplete }) {
  const { uploadAndAnalyzeDocument, isAnalyzing } = useDocument();
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setLocalError(null);

    try {
      await uploadAndAnalyzeDocument(file);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      setLocalError(err.message || 'Error processing document.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm p-space-md md:p-space-lg lg:p-space-xl border border-outline-variant/30">
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none"></div>
      <div className="absolute right-12 bottom-0 w-64 h-64 rounded-full bg-tertiary-fixed/15 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
        {/* Left column info */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary-container shadow-sm">
              <span className="material-symbols-outlined text-[28px]">description</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-secondary-container uppercase tracking-wider font-semibold">
                Fast Scan Available
              </span>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Understand a document
              </h2>
            </div>
          </div>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
            Upload a PDF or DOCX and get an easy-to-read explanation with high-risk clauses flagged in plain English.
          </p>

          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="cursor-pointer inline-flex items-center gap-space-sm px-space-lg py-3 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span>{isAnalyzing ? 'Analyzing...' : 'Upload Document'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <input
              ref={fileInputRef}
              id="document-upload-input"
              aria-label="Upload legal document (PDF, DOC, DOCX, TXT)"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <span className="inline-flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
              <span>Supports Rental, Employment, NDA, and Service agreements</span>
            </span>
          </div>

          {localError && (
            <div 
              role="alert" 
              aria-live="assertive"
              className="p-3 rounded-lg bg-error-container/40 border border-error/20 text-on-error-container text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-error">error</span>
              <span>{localError}</span>
            </div>
          )}
        </div>

        {/* Right column drag & drop zone */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div
            id="drop-zone"
            role="button"
            tabIndex={0}
            aria-label="Drag and drop or browse to upload document"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`group relative rounded-xl p-space-lg flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer border-2 border-dashed ${
              isDragOver
                ? 'border-primary bg-secondary-container/40'
                : 'border-outline-variant/60 bg-surface-container-low/60 hover:bg-surface-container-low'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-secondary mb-space-sm group-hover:scale-105 transition-transform duration-200">
              <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
            </div>
            <span className="font-label-lg text-label-lg text-primary mb-1 font-semibold">
              Drag & drop your file here
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              or browse on your computer (up to 25 MB)
            </span>
            <div className="mt-space-md flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="px-2 py-0.5 rounded bg-surface-container font-medium">PDF</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-medium">DOCX</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-medium">TXT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
