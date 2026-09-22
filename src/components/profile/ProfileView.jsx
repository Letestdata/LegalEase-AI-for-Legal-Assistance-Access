import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../services/firebase';

export default function ProfileView({ onNavigate }) {
  const { currentUser, signOut } = useAuth();
  const [apiKey, setApiKey] = useState(localStorage.getItem('legalease_gemini_api_key') || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('legalease_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('legalease_gemini_api_key');
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-space-lg pb-space-xl">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
          Account Profile & Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Manage your account credentials, security preferences, and AI processing settings.
        </p>
      </div>

      {/* Account Card */}
      <section className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/20 pb-2">
          Account Information
        </h2>

        <div className="flex items-center gap-space-md">
          <img
            alt={currentUser?.displayName || 'User Profile'}
            src={
              currentUser?.photoURL ||
              'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=003747&color=fff'
            }
            className="w-16 h-16 rounded-full object-cover border-2 border-secondary-container shadow-xs"
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-primary font-semibold">
              {currentUser?.displayName || 'Sarah Jenkins'}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {currentUser?.email || 'sarah.jenkins@example.com'}
            </span>
            <span className="text-xs text-secondary mt-1 font-medium">
              Member since {new Date(currentUser?.createdAt || '2025-01-01').toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
          <div className="p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Firebase Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-tertiary' : 'bg-[#D89B2B]'}`}></span>
              <span className="text-sm font-semibold text-primary">
                {isFirebaseConfigured ? 'Connected to Cloud Firebase' : 'Active (Local Offline Simulation)'}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              {isFirebaseConfigured
                ? 'Documents and analyses sync with live Firestore & Storage.'
                : 'Zero-latency local emulation enabled with full mock persistence.'}
            </p>
          </div>

          <div className="p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              AI Reasoner
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="text-sm font-semibold text-primary">
                Grounded Legal NLP Engine
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Client-side private section parser and citation-grounded RAG active.
            </p>
          </div>
        </div>
      </section>

      {/* Security & System Keys */}
      <section className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/20 pb-2">
          Security & API Integration
        </h2>

        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-primary font-semibold flex items-center justify-between">
            <span>Optional Google Gemini API Key</span>
            <span className="text-xs text-on-surface-variant font-normal">
              Stored locally in memory/browser
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty for built-in grounded engine)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container text-sm text-on-surface border border-outline-variant/50 focus:outline-none focus:border-primary font-mono"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors cursor-pointer shrink-0"
            >
              {savedNotice ? 'Saved!' : 'Save Key'}
            </button>
          </div>
          <p className="text-xs text-on-surface-variant">
            Your key is never sent to any intermediary server and is processed purely within your browser session.
          </p>
        </div>
      </section>

      {/* About & Legal Disclaimers */}
      <section className="p-space-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold border-b border-outline-variant/20 pb-2">
          Application Information
        </h2>

        <div className="flex flex-col gap-2 text-sm text-on-surface-variant leading-relaxed">
          <p>
            <strong className="text-primary font-semibold">LegalEase</strong> is designed to help everyday consumers, freelancers, and small business owners understand complicated legal agreements before they sign.
          </p>
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs">
            <strong className="text-primary">Important Disclaimer:</strong> LegalEase provides legal information and document assistance. It does not replace a qualified legal professional or provide definitive legal advice.
          </div>
        </div>

        <div className="flex items-center gap-3 pt-space-xs">
          <button
            onClick={() => onNavigate('privacy')}
            className="text-xs font-semibold text-secondary hover:text-primary underline cursor-pointer"
          >
            Privacy Policy & Data Security
          </button>
          <span className="text-outline-variant">•</span>
          <button
            onClick={() => onNavigate('help')}
            className="text-xs font-semibold text-secondary hover:text-primary underline cursor-pointer"
          >
            Help Center & FAQ
          </button>
        </div>
      </section>

      {/* Sign Out Action */}
      <div className="flex justify-end">
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 px-space-lg py-2.5 rounded-xl border border-error/40 text-error hover:bg-error-container/40 text-sm font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out of LegalEase</span>
        </button>
      </div>
    </div>
  );
}
