import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onNavigate }) {
  const { currentUser } = useAuth();

  const displayName = currentUser?.displayName || 'Sarah Jenkins';
  const photoURL = currentUser?.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuApfp-7bfhNreITR4xIA52b9v9CMJld7IulirKCc6uTEOuocEB8gV4VF8IxgKGOk5rV7sLS--1o9nuwlnuLfi9fElymz8vW2VodFS7u_WlyyjdOXqmIWjDCHCbF-_QgEOefb-NPl9cUdSuGMkHXHDrmREQXJl0W1BbZ1Zis3DMN1eudijRwqUSxUARuE8E2xQ24UzQ5OyIyGCx_9stJLMCJAf6gGtLThDwCZnNDswUwovAgQ0BNGkHU';

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
      <div className="h-16 max-w-[1200px] mx-auto px-space-md md:px-space-lg flex items-center justify-between">
        {/* Workspace status badge */}
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/40">
            <span className="material-symbols-outlined text-[14px] text-primary" aria-hidden="true">shield</span>
            <span className="font-medium">Workspace Secure</span>
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary ml-0.5" aria-hidden="true"></span>
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-space-sm md:gap-space-md">
          <button 
            onClick={() => onNavigate('help')}
            className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center justify-center cursor-pointer"
            title="Help & FAQ"
            aria-label="Help and FAQ"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">help_outline</span>
          </button>

          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-space-sm pl-1 py-1 pr-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30"
            aria-label={`Profile for ${displayName}`}
          >
            <img 
              alt={displayName} 
              className="w-7 h-7 rounded-full object-cover shadow-xs" 
              src={photoURL}
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=003747&color=fff';
              }}
            />
            <span className="font-label-md text-label-md text-on-surface font-medium hidden sm:inline">
              {displayName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
