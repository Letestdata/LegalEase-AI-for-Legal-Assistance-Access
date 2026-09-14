import React from 'react';

export default function SummaryCards({ stats }) {
  const defaultStats = {
    importantPointsCount: 8,
    obligationsCount: 5,
    deadlinesCount: 3,
    pointsToReviewCount: 4
  };

  const currentStats = stats || defaultStats;

  const items = [
    {
      count: currentStats.importantPointsCount,
      label: 'Important points',
      subtitle: 'Analyzed from key sections',
      icon: 'flag'
    },
    {
      count: currentStats.obligationsCount,
      label: 'Obligations',
      subtitle: 'Signatory responsibilities',
      icon: 'assignment_turned_in'
    },
    {
      count: currentStats.deadlinesCount,
      label: 'Deadlines',
      subtitle: 'Time-sensitive terms',
      icon: 'schedule'
    },
    {
      count: currentStats.pointsToReviewCount,
      label: 'Points to review',
      subtitle: 'Recommended discussion',
      icon: 'priority_high'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-outline-variant/30"
        >
          <div className="flex items-center justify-between">
            <span className="font-display-lg text-display-lg text-primary font-bold">
              {item.count}
            </span>
            <span className="material-symbols-outlined text-secondary text-[24px] p-2 rounded-lg bg-surface-container-low">
              {item.icon}
            </span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant mt-space-xs font-semibold">
            {item.label}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant/70">
            {item.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
