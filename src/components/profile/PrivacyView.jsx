import React from 'react';

export default function PrivacyView({ onNavigate }) {
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
          Privacy Policy & Security Standards
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          How LegalEase safeguards your sensitive legal documents, contracts, and confidential data.
        </p>
      </div>

      <div className="flex flex-col gap-space-md p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm text-sm text-on-surface-variant leading-relaxed">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
          1. 100% Isolated Data Ownership
        </h2>
        <p>
          Your documents belong exclusively to you. Under our strict Cloud Firestore and Firebase Storage security architecture, only authenticated requests bearing your unique User ID (<code className="text-xs bg-surface-container px-1 py-0.5 rounded">request.auth.uid == resource.data.userId</code>) can read, write, or delete your documents.
        </p>

        <h2 className="font-headline-sm text-headline-sm text-primary font-bold pt-2 border-t border-outline-variant/20">
          2. No Public Exposure of Contract URLs
        </h2>
        <p>
          Uploaded documents are never assigned public web URLs. All file transfers occur over 256-bit TLS encrypted channels and reside within restricted storage buckets.
        </p>

        <h2 className="font-headline-sm text-headline-sm text-primary font-bold pt-2 border-t border-outline-variant/20">
          3. Client-Side Parsing Option
        </h2>
        <p>
          LegalEase utilizes in-browser parsing algorithms for standard PDF and DOCX files. Your documents are analyzed locally whenever possible to minimize external data sharing.
        </p>

        <h2 className="font-headline-sm text-headline-sm text-primary font-bold pt-2 border-t border-outline-variant/20">
          4. Complete Document Deletion
        </h2>
        <p>
          When you delete a document from "My Documents", all associated metadata, clause indices, and original file records are immediately and irreversibly purged from our database.
        </p>
      </div>
    </div>
  );
}
