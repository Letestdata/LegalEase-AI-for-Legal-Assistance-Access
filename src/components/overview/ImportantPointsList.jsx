import React from 'react';

export default function ImportantPointsList({ points, onSelectPoint }) {
  const defaultPoints = [
    {
      id: 'point-1',
      title: 'Early termination',
      importance: 'Review',
      badgeBg: 'bg-[#FFF7E6]',
      badgeText: 'text-[#A46E13]',
      cardBg: 'bg-[#FFF5F5]',
      icon: 'warning',
      iconColor: 'text-error bg-error-container',
      simpleExplanation: 'You may have to pay a charge if you leave before the agreement ends. Section 14.2 outlines a minimum forfeiture of 2 months\' base rent plus reletting administrative fees.',
      originalText: 'In the event of premature termination without cause, tenant agrees to liquidate damages equaling two months rent and forfeiture of initial deposit.',
      whoAffects: 'You, if you relocate or break the agreement before the 12-month tenure expires.',
      whyCare: 'Substantial out-of-pocket financial liability upon early move-out.',
      questionsToConsider: [
        'Can this termination charge be reduced to 30 days?',
        'Are job transfers or military relocations exempt?'
      ],
      source: 'Clause 14.2 • Page 7'
    },
    {
      id: 'point-2',
      title: 'Notice period',
      importance: 'Important',
      badgeBg: 'bg-[#FFFDF0]',
      badgeText: 'text-[#A46E13]',
      cardBg: 'bg-[#FFFDF5]',
      icon: 'notifications_active',
      iconColor: 'text-[#A46E13] bg-[#FFF7E6]',
      simpleExplanation: 'You need to provide 60 days\' notice. This is longer than the standard 30-day requirement typical of standard municipal lease conventions.',
      originalText: 'Notice to terminate tenancy must be delivered in certified written form no less than sixty (60) calendar days prior to expiration.',
      whoAffects: 'Tenant scheduling their move-out timing.',
      whyCare: 'Failing to give 60 full days notice can cause deposit forfeiture or involuntary lease extension.',
      questionsToConsider: [
        'Can notice be delivered via email or digital resident portal?'
      ],
      source: 'Clause 5.1 • Page 3'
    },
    {
      id: 'point-3',
      title: 'Automatic renewal',
      importance: 'Important',
      badgeBg: 'bg-[#FFFDF0]',
      badgeText: 'text-[#A46E13]',
      cardBg: 'bg-[#FFFDF5]',
      icon: 'autorenew',
      iconColor: 'text-[#A46E13] bg-[#FFF7E6]',
      simpleExplanation: 'The agreement may renew automatically unless notice is provided. The contract transitions into an unnegotiated 12-month extension rather than month-to-month.',
      originalText: 'This agreement shall automatically roll over into a successive 12-month contract period unless formal notice is served.',
      whoAffects: 'Tenant at the end of the first year.',
      whyCare: 'You will be locked in for another full 12 months rather than a flexible month-to-month arrangement.',
      questionsToConsider: [
        'Can we amend this clause to roll over month-to-month after year one?'
      ],
      source: 'Clause 3.4 • Page 2'
    },
    {
      id: 'point-4',
      title: 'Security deposit',
      importance: 'Informational',
      badgeBg: 'bg-surface-container',
      badgeText: 'text-primary',
      cardBg: 'bg-surface-container-low',
      icon: 'lock',
      iconColor: 'text-on-secondary-container bg-secondary-container',
      simpleExplanation: 'The document explains when the deposit should be returned. Landlord guarantees return within 21 calendar days following mutual walk-through inspection.',
      originalText: 'Security deposits are held in escrow. Itemized damage estimates and net refund shall be postmarked within 21 calendar days following vacating.',
      whoAffects: 'Your escrow funds return.',
      whyCare: 'Sets a clear legal deadline for getting your $2,450 deposit refunded.',
      questionsToConsider: [
        'Is interest paid on the held escrow amount?'
      ],
      source: 'Clause 8.3 • Page 4'
    }
  ];

  const items = points && points.length > 0 ? points : defaultPoints;

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
            Important points
          </h2>
          <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium">
            {items.length} prioritized
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-space-md">
        {items.map((item) => {
          const isWarning = item.importance === 'Review' || item.importance === 'Critical';
          const isImportant = item.importance === 'Important';

          const cardBg = isWarning
            ? 'bg-[#FFF5F5] border-error/20'
            : isImportant
            ? 'bg-[#FFFDF5] border-[#D89B2B]/30'
            : 'bg-surface-container-low border-outline-variant/30';

          const badgeClass = isWarning
            ? 'bg-[#FFF7E6] text-[#A46E13]'
            : isImportant
            ? 'bg-[#FFFDF0] text-[#A46E13]'
            : 'bg-surface-container text-primary';

          const iconClass = isWarning
            ? 'bg-error-container text-error'
            : isImportant
            ? 'bg-[#FFF7E6] text-[#A46E13]'
            : 'bg-secondary-container text-on-secondary-container';

          const iconName = item.icon || (isWarning ? 'warning' : isImportant ? 'notifications_active' : 'info');

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col gap-space-sm p-space-md rounded-xl shadow-sm hover:shadow-md transition-all border ${cardBg}`}
            >
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClass}`}>
                    <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {item.title}
                  </h3>
                </div>
                <span className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-medium ${badgeClass}`}>
                  {item.importance}
                </span>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant pl-10 leading-relaxed">
                {item.simpleExplanation}
              </p>

              <div className="flex items-center justify-between pt-space-xs pl-10">
                <span className="font-label-sm text-label-sm text-on-surface-variant/70">
                  {item.source}
                </span>
                <button
                  onClick={() => onSelectPoint(item)}
                  className="inline-flex items-center gap-1 font-label-lg text-label-lg text-primary hover:text-secondary group-hover:translate-x-0.5 transition-transform cursor-pointer font-semibold"
                  type="button"
                >
                  <span>Understand</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
