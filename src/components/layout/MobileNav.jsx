import React from 'react';

export default function MobileNav({ currentView, onNavigate }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'my-documents', label: 'Documents', icon: 'description' },
    { id: 'compare', label: 'Compare', icon: 'compare_arrows' },
    { id: 'profile', label: 'Profile', icon: 'account_circle' }
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant/40 z-50 flex items-center justify-around px-space-xs shadow-lg"
      aria-label="Mobile Navigation"
    >
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-0.5 transition-colors cursor-pointer ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill' : ''}`} aria-hidden="true">
              {item.icon}
            </span>
            <span className="text-[11px] font-medium leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
