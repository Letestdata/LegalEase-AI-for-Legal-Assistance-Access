import React, { useEffect } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children, 
  maxWidth = 'max-w-2xl' 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div 
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] flex flex-col bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-space-md md:p-space-lg border-b border-outline-variant/20 bg-surface-container-low/40">
          <div className="flex flex-col gap-0.5">
            <h2 id="modal-title" className="font-headline-sm text-headline-sm text-primary font-bold">
              {title}
            </h2>
            {subtitle && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-space-md md:p-space-lg overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
