import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DocumentProvider } from './context/DocumentContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import DashboardView from './components/dashboard/DashboardView';

// Code-split heavy views for maximum performance and instant first contentful paint
const DocumentOverviewView = lazy(() => import('./components/overview/DocumentOverviewView'));
const CompareView = lazy(() => import('./components/compare/CompareView'));
const MyDocumentsView = lazy(() => import('./components/documents/MyDocumentsView'));
const ProfileView = lazy(() => import('./components/profile/ProfileView'));
const PrivacyView = lazy(() => import('./components/profile/PrivacyView'));
const HelpView = lazy(() => import('./components/profile/HelpView'));

function ViewLoadingSkeleton() {
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="w-full flex flex-col gap-6 animate-pulse py-8"
    >
      <div className="h-8 bg-surface-container-high rounded-xl w-1/3"></div>
      <div className="h-4 bg-surface-container rounded-lg w-2/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-surface-container rounded-2xl"></div>
        ))}
      </div>
      <div className="h-64 bg-surface-container rounded-2xl mt-4"></div>
      <span className="sr-only">Loading view content...</span>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocument = () => {
    handleNavigate('overview');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* WCAG 2.1 AA Accessibility: Skip link for keyboard/screen reader navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary focus:text-on-primary focus:rounded-xl focus:shadow-xl focus:font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />

      {/* Main Content Area */}
      <div className="md:pl-60 pb-20 md:pb-12">
        {/* Top Header */}
        <Header 
          onNavigate={handleNavigate} 
        />

        {/* Dynamic Route View */}
        <main 
          id="main-content" 
          tabIndex={-1}
          className="pt-20 px-space-md md:px-space-lg max-w-[1200px] mx-auto min-h-[calc(100vh-5rem)] focus:outline-none"
        >
          <Suspense fallback={<ViewLoadingSkeleton />}>
            {currentView === 'home' && (
              <DashboardView 
                onNavigate={handleNavigate} 
                onOpenDocument={handleOpenDocument} 
              />
            )}

            {currentView === 'overview' && (
              <DocumentOverviewView 
                onNavigate={handleNavigate}
                initialOpenQA={Boolean(viewParams.openQA)}
                initialOpenLawyer={Boolean(viewParams.openLawyerChecklist)}
              />
            )}

            {currentView === 'compare' && (
              <CompareView 
                onNavigate={handleNavigate} 
              />
            )}

            {currentView === 'my-documents' && (
              <MyDocumentsView 
                onNavigate={handleNavigate} 
                onOpenDocument={handleOpenDocument} 
              />
            )}

            {currentView === 'profile' && (
              <ProfileView 
                onNavigate={handleNavigate} 
              />
            )}

            {currentView === 'privacy' && (
              <PrivacyView 
                onNavigate={handleNavigate} 
              />
            )}

            {currentView === 'help' && (
              <HelpView 
                onNavigate={handleNavigate} 
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Responsive Mobile Bottom Navigation */}
      <MobileNav 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <AppContent />
      </DocumentProvider>
    </AuthProvider>
  );
}
