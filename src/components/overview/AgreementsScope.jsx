import React from 'react';

export default function AgreementsScope({ obligations }) {
  const defaultItems = [
    {
      title: 'Payment obligations',
      desc: 'Monthly fee of $2,450 due on the 1st. Grace period ends on the 5th, triggering a $75 late charge.'
    },
    {
      title: 'Notice requirements',
      desc: '60 calendar days written notice delivered via certified mail or designated portal before lease expiration.'
    },
    {
      title: 'Deposit conditions',
      desc: '$2,450 held in an interest-bearing escrow account. Deductions allowed solely for itemized damages.'
    },
    {
      title: 'Confidentiality obligations',
      desc: 'Standard quiet enjoyment terms; tenant agrees to building-wide code of conduct and nondisclosure of negotiated rental rates.'
    },
    {
      title: 'Termination conditions',
      desc: 'Early exit mandates fee schedule adherence and forfeiture of deposit if proper 60-day window is not met.'
    }
  ];

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
          What you are agreeing to
        </h2>
        <span className="font-label-sm text-label-sm text-secondary font-medium">
          Summary scope
        </span>
      </div>

      <div className="flex flex-col gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Signing binds you to the following core parameters across the agreement term:
        </p>

        <ul className="flex flex-col gap-space-md">
          {defaultItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[20px] text-tertiary-container mt-0.5 shrink-0">
                check_circle
              </span>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-primary font-semibold">
                  {item.title}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {item.desc}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Document timeline graphic */}
        <div className="mt-space-xs p-space-md rounded-lg bg-surface-container flex items-center justify-between border border-outline-variant/20">
          <div className="flex flex-col gap-0.5">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
              Document timeline
            </span>
            <span className="font-label-md text-label-md text-primary font-medium">
              Nov 1, 2024 — Oct 31, 2025
            </span>
          </div>
          <span className="px-space-sm py-1 rounded-full bg-surface-container-lowest font-label-sm text-label-sm text-primary shadow-xs font-semibold">
            Fixed Term
          </span>
        </div>
      </div>

      {/* Quick Negotiation Tips Card */}
      <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/30">
        <span className="material-symbols-outlined text-[24px] text-secondary shrink-0">
          lightbulb
        </span>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary font-semibold">
            Negotiation tip
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            You can request a reduction of the 60-day notice requirement to standard 30 days before signing.
          </span>
        </div>
      </div>
    </div>
  );
}
