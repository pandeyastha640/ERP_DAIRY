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
  let dotColor = 'bg-slate-400';
  let badgeClasses = 'bg-slate-50 text-slate-700 border-slate-200';

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
    dotColor = 'bg-emerald-600';
    badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
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
    dotColor = 'bg-amber-500';
    badgeClasses = 'bg-amber-50 text-amber-800 border-amber-200';
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
    badgeClasses = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (
    s === 'DRY' ||
    s === 'PREGNANT' ||
    s === 'EN ROUTE' ||
    s === 'HOLDING' ||
    s === 'CHILLING' ||
    s === 'INFO'
  ) {
    dotColor = 'bg-blue-600';
    badgeClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md px-2 py-0.5 tracking-tight ${badgeClasses} ${
        size === 'sm' ? 'text-[11px] leading-tight' : 'text-xs leading-normal'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span className="truncate">{status}</span>
    </span>
  );
};
