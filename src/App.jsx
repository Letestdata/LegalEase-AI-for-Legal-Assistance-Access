import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DocumentProvider } from './context/DocumentContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import DashboardView from './components/dashboard/DashboardView';
import DocumentOverviewView from './components/overview/DocumentOverviewView';
import CompareView from './components/compare/CompareView';
import MyDocumentsView from './components/documents/MyDocumentsView';
import ProfileView from './components/profile/ProfileView';
import PrivacyView from './components/profile/PrivacyView';
import HelpView from './components/profile/HelpView';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState({});

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocument = (doc) => {
    handleNavigate('overview');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
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
        <main className="pt-20 px-space-md md:px-space-lg max-w-[1200px] mx-auto min-h-[calc(100vh-5rem)]">
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
