import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentView, onNavigate }) {
  const { signOut } = useAuth();

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'my-documents', label: 'My Documents', icon: 'description' },
    { id: 'compare', label: 'Compare', icon: 'compare_arrows' },
    { id: 'profile', label: 'Profile', icon: 'account_circle' }
  ];

  const bottomNavItems = [
    { id: 'privacy', label: 'Privacy', icon: 'verified_user' },
    { id: 'help', label: 'Help', icon: 'help' }
  ];

  const handleSignOut = async (e) => {
    e.preventDefault();
    await signOut();
    onNavigate('profile');
  };

  return (
    <aside 
      className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-surface-container-lowest z-50 flex-col justify-between p-space-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/30"
      aria-label="Main Navigation"
    >
      <div className="flex flex-col gap-space-lg">
        {/* Brand Header */}
        <div className="flex flex-col gap-space-xs px-space-xs pt-space-xs">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-space-sm text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
              LegalEase
            </span>
          </button>
          <span className="font-label-sm text-label-sm text-on-surface-variant pl-0.5">
            Understand before you sign.
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-space-xs" aria-label="Primary Navigation">
          {mainNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-lg transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Items */}
      <div className="flex flex-col gap-space-xs pt-space-md border-t border-outline-variant/30 bg-surface-container-lowest">
        <nav className="flex flex-col gap-space-xs" aria-label="Secondary Navigation">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg font-label-md text-label-md transition-colors text-left cursor-pointer ${
                currentView === item.id
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-space-sm px-space-md py-space-xs rounded-lg font-label-md text-label-md text-error hover:bg-error-container/30 transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
