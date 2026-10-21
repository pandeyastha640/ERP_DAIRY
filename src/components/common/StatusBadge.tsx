import React from 'react';

export type StatusType =
  | 'PASS'
  | 'WARNING'
  | 'FAIL'
  | 'Active'
  | 'Inactive'
  | 'Under Review'
  | 'Milking'
  | 'Dry'
  | 'Pregnant'
  | 'Sick'
  | 'Optimal'
  | 'Low Stock'
  | 'Critical Stockout'
  | 'Completed'
  | 'Delayed'
  | 'En Route'
  | 'Preparing'
  | 'In Progress'
  | 'Paid'
  | 'Pending'
  | 'Critical'
  | 'Sufficient'
  | 'Holding'
  | 'Chilling';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let dotColor = 'bg-stone-400';
  let badgeClasses = 'bg-[#f8f7f4] text-stone-700 border-[#ede8df]';

  const s = (status || '').toUpperCase();

  if (
    s === 'PASS' ||
    s === 'ACTIVE' ||
    s === 'MILKING' ||
    s === 'OPTIMAL' ||
    s === 'COMPLETED' ||
    s === 'PAID' ||
    s === 'SUFFICIENT' ||
    s === 'RECONCILED'
  ) {
    dotColor = 'bg-[#2d6a4f]';
    badgeClasses = 'bg-[#f0f7f2] text-[#1b4332] border-[#cde6d5]';
  } else if (
    s === 'WARNING' ||
    s === 'UNDER REVIEW' ||
    s === 'LOW STOCK' ||
    s === 'PREPARING' ||
    s === 'IN PROGRESS' ||
    s === 'OBSERVATION' ||
    s === 'PENDING' ||
    s === 'VARIANCE DETECTED'
  ) {
    dotColor = 'bg-[#c59b27]';
    badgeClasses = 'bg-[#fbf7ec] text-[#855e16] border-[#f2e5c4]';
  } else if (
    s === 'FAIL' ||
    s === 'SICK' ||
    s === 'CRITICAL' ||
    s === 'CRITICAL STOCKOUT' ||
    s === 'DELAYED' ||
    s === 'OUT OF STOCK' ||
    s === 'CRITICAL VARIANCE'
  ) {
    dotColor = 'bg-rose-600';
    badgeClasses = 'bg-[#fdf2f2] text-rose-800 border-[#fbcfe8]';
  } else if (
    s === 'DRY' ||
    s === 'PREGNANT' ||
    s === 'EN ROUTE' ||
    s === 'HOLDING' ||
    s === 'CHILLING' ||
    s === 'INFO'
  ) {
    dotColor = 'bg-emerald-600';
    badgeClasses = 'bg-[#f2f8f6] text-[#205440] border-[#cbe4dc]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full tracking-tight transition-colors ${badgeClasses} ${
        size === 'sm' ? 'text-[11px] px-2 py-0.5 leading-tight' : 'text-xs px-2.5 py-0.5 leading-normal'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span className="truncate">{status}</span>
    </span>
  );
};
