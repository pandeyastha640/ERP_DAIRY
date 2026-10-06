import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Building2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Clock,
  User,
  Inbox,
  Loader2,
} from 'lucide-react';
import { StatusBadge, StatusType } from './StatusBadge';
import { MetricCard, MetricCardProps } from './MetricCard';
import { Modal } from './Modal';
import { Facility, DateFilter } from '../../types/dairy';

// ==========================================
// 1. PAGE CONTAINER & HEADERS
// ==========================================

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
};

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  facility?: string;
  dateFilter?: string;
  statusBadge?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  facility,
  dateFilter,
  statusBadge = 'Live Operations',
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 bg-white">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                {b.onClick ? (
                  <button
                    onClick={b.onClick}
                    className="hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span className="text-slate-800">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
          {facility && <span className="font-medium text-slate-700">{facility}</span>}
          {facility && dateFilter && <span>·</span>}
          {dateFilter && <span>Period: {dateFilter}</span>}
          {statusBadge && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {statusBadge}
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
};

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-500">{icon}</span>}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// ==========================================
// 2. SEARCH & FILTER CONTROLS
// ==========================================

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors shadow-2xs"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export interface DateRangeSelectorProps {
  value: DateFilter;
  onChange: (date: DateFilter) => void;
  options?: DateFilter[];
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  options = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom'],
}) => {
  return (
    <div className="relative inline-flex items-center">
      <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DateFilter)}
        className="pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors appearance-none cursor-pointer shadow-2xs"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
    </div>
  );
};

export interface FacilitySelectorProps {
  value: Facility;
  onChange: (facility: Facility) => void;
  facilities?: Facility[];
}

export const FacilitySelector: React.FC<FacilitySelectorProps> = ({
  value,
  onChange,
  facilities = [
    'Main Dairy Plant',
    'Anand Collection Centre',
    'Baroda Bulk Chilling Unit',
    'Mehsana Procurement Hub',
  ],
}) => {
  return (
    <div className="relative inline-flex items-center">
      <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Facility)}
        className="pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors appearance-none cursor-pointer shadow-2xs"
      >
        {facilities.map((fac) => (
          <option key={fac} value={fac}>
            {fac}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
    </div>
  );
};

export interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, onReset }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">{children}</div>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};

// ==========================================
// 3. ENTERPRISE DATA TABLE
// ==========================================

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  compact?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No records found matching current criteria.',
  compact = false,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 shadow-2xs">
        <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-medium text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${compact ? 'py-2 px-3' : 'py-3 px-4'} ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => {
              const key = keyExtractor(item);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors text-slate-800 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/40'
                  }`}
                >
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(item)
                      : (item as Record<string, unknown>)[col.key] !== undefined
                      ? String((item as Record<string, unknown>)[col.key])
                      : '';

                    return (
                      <td
                        key={col.key}
                        className={`${compact ? 'py-2 px-3' : 'py-3 px-4'} ${
                          col.align === 'right'
                            ? 'text-right font-mono tabular-nums'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 4. ALERT CARD
// ==========================================

export interface AlertCardProps {
  id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  targetModule?: string;
  onNavigate?: (module: string) => void;
  onDismiss?: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  id,
  title,
  description,
  priority,
  timestamp,
  targetModule,
  onNavigate,
  onDismiss,
}) => {
  const priorityStyles = {
    Critical: 'border-l-4 border-l-rose-600 bg-rose-50/50 border-rose-200 text-rose-950',
    High: 'border-l-4 border-l-amber-500 bg-amber-50/40 border-amber-200 text-amber-950',
    Medium: 'border-l-4 border-l-blue-500 bg-blue-50/30 border-blue-200 text-blue-950',
    Low: 'border-l-4 border-l-slate-400 bg-slate-50/80 border-slate-200 text-slate-900',
  }[priority];

  return (
    <div
      className={`border rounded-lg p-3.5 transition-all shadow-2xs relative group ${priorityStyles}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          {priority === 'Critical' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {priority === 'High' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
          {priority === 'Medium' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
          {priority === 'Low' && <Info className="w-4 h-4 text-slate-500 shrink-0" />}
          <h4 className="text-xs font-semibold text-slate-900">{title}</h4>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-500">{timestamp}</span>
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(id);
              }}
              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed mb-2">{description}</p>
      {targetModule && onNavigate && (
        <button
          onClick={() => onNavigate(targetModule)}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Investigate in {targetModule}</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      )}
    </div>
  );
};

// ==========================================
// 5. STATES: EMPTY, LOADING, ERROR
// ==========================================

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-2xs">
    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
      {icon || <Inbox className="w-6 h-6" />}
    </div>
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading operational telemetry...',
}) => (
  <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-2xs">
    <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-3" />
    <p className="text-xs text-slate-500 font-medium">{message}</p>
  </div>
);

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'An error occurred while synchronizing module data.', onRetry }) => (
  <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-6 text-center shadow-2xs">
    <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
    <h4 className="text-sm font-semibold text-rose-900">Operational Sync Failure</h4>
    <p className="text-xs text-rose-700 mt-1 mb-3">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-md shadow-2xs cursor-pointer"
      >
        Retry Synchronization
      </button>
    )}
  </div>
);

// ==========================================
// 6. DRAWER COMPONENT
// ==========================================

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
}) => {
  if (!isOpen) return null;

  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div
        className={`w-full ${widthClass} bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// 7. CONFIRMATION DIALOG
// ==========================================

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-white rounded-lg text-xs font-medium cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ==========================================
// 8. FORM SECTION
// ==========================================

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
};

// ==========================================
// 9. TIMELINE & ACTIVITY LOG
// ==========================================

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: 'completed' | 'current' | 'upcoming' | 'warning';
  badge?: string;
}

export const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((evt) => {
        let dotColor = 'bg-slate-300';
        if (evt.status === 'completed') dotColor = 'bg-emerald-600';
        if (evt.status === 'current') dotColor = 'bg-blue-600 ring-4 ring-blue-100';
        if (evt.status === 'warning') dotColor = 'bg-amber-500';

        return (
          <div key={evt.id} className="relative group">
            <span
              className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${dotColor} transition-transform`}
            />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900">{evt.title}</span>
              <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
            </div>
            {evt.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{evt.description}</p>
            )}
            {evt.badge && (
              <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {evt.badge}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export interface ActivityLogItem {
  id: string;
  user: string;
  role?: string;
  action: string;
  target: string;
  timestamp: string;
}

export const ActivityLog: React.FC<{ items: ActivityLogItem[] }> = ({ items }) => {
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-slate-800">
                <span className="font-semibold text-slate-900">{item.user}</span>{' '}
                <span className="text-slate-500">{item.action}</span>{' '}
                <span className="font-medium text-emerald-800 font-mono">{item.target}</span>
              </div>
              {item.role && <div className="text-[10px] text-slate-400 mt-0.5">{item.role}</div>}
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.timestamp}</span>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 10. CHART CONTAINER
// ==========================================

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  legend?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  legend,
  actions,
  children,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {legend}
          {actions}
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};
