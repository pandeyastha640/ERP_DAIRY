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
  Sparkles,
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
  return <div className={`space-y-6 sm:space-y-8 animate-in fade-in duration-300 ${className}`}>{children}</div>;
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#ede8df] bg-transparent">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-2 font-medium">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-stone-300">/</span>}
                {b.onClick ? (
                  <button
                    onClick={b.onClick}
                    className="hover:text-[#1b4332] transition-colors cursor-pointer"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span className="text-stone-800 font-medium">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-1.5">
          {facility && (
            <span className="inline-flex items-center gap-1 font-medium text-stone-700 bg-white px-2 py-0.5 rounded-md border border-[#ede8df] shadow-xs">
              <Building2 className="w-3 h-3 text-[#2d6a4f]" />
              {facility}
            </span>
          )}
          {facility && dateFilter && <span className="text-stone-300">·</span>}
          {dateFilter && (
            <span className="inline-flex items-center gap-1 text-stone-600 bg-white px-2 py-0.5 rounded-md border border-[#ede8df] shadow-xs">
              <Calendar className="w-3 h-3 text-stone-400" />
              {dateFilter}
            </span>
          )}
          {statusBadge && (
            <>
              <span className="text-stone-300">·</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eef6f0] text-[#1b4332] border border-[#cbe5d4] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] animate-pulse" />
                {statusBadge}
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f2319]">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
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
    <div className="flex items-center justify-between gap-3 mb-3.5">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="w-7 h-7 rounded-lg bg-[#f0f7f2] text-[#1b4332] flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-[#0f2319] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
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
      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2 bg-white border border-[#ede8df] hover:border-[#cbd5e1] rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#52b788] focus:ring-2 focus:ring-[#52b788]/20 transition-all shadow-[0_1px_3px_rgba(27,67,50,0.02)]"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer transition-colors"
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
      <Calendar className="w-3.5 h-3.5 text-stone-500 absolute left-3 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DateFilter)}
        className="pl-9 pr-8 py-2 bg-white border border-[#ede8df] hover:border-[#cbd5e1] rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:border-[#52b788] focus:ring-2 focus:ring-[#52b788]/20 transition-all appearance-none cursor-pointer shadow-[0_1px_3px_rgba(27,67,50,0.02)]"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 pointer-events-none" />
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
      <Building2 className="w-3.5 h-3.5 text-[#2d6a4f] absolute left-3 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Facility)}
        className="pl-9 pr-8 py-2 bg-white border border-[#ede8df] hover:border-[#cbd5e1] rounded-xl text-xs font-medium text-stone-700 focus:outline-none focus:border-[#52b788] focus:ring-2 focus:ring-[#52b788]/20 transition-all appearance-none cursor-pointer shadow-[0_1px_3px_rgba(27,67,50,0.02)]"
      >
        {facilities.map((fac) => (
          <option key={fac} value={fac}>
            {fac}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 pointer-events-none" />
    </div>
  );
};

export interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, onReset }) => {
  return (
    <div className="bg-white border border-[#ede8df] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_10px_-2px_rgba(27,67,50,0.03)] flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">{children}</div>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-[#1b4332] hover:bg-[#f0f7f2] rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
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
      <div className="bg-white border border-[#ede8df] rounded-2xl p-10 text-center text-stone-500 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#faf8f4] border border-[#ede8df] flex items-center justify-center text-stone-400 mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-stone-700">{emptyMessage}</p>
        <p className="text-[11px] text-stone-400 mt-1">Try adjusting your filters or date range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#ede8df] rounded-2xl shadow-[0_2px_12px_-2px_rgba(27,67,50,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#faf8f5] border-b border-[#ede8df] text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${compact ? 'py-2.5 px-3.5' : 'py-3.5 px-4 sm:px-5'} ${
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
          <tbody className="divide-y divide-[#f2eee6]">
            {data.map((item) => {
              const key = keyExtractor(item);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors text-stone-800 ${
                    onRowClick ? 'cursor-pointer hover:bg-[#fbf9f4]/80' : 'hover:bg-[#fbf9f4]/50'
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
                        className={`${compact ? 'py-2 px-3.5' : 'py-3.5 px-4 sm:px-5'} ${
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
    Critical: 'border-rose-200 bg-rose-50/50 text-rose-950',
    High: 'border-[#f2e5c4] bg-[#fbf7ec] text-[#855e16]',
    Medium: 'border-[#cde6d5] bg-[#f0f7f2] text-[#1b4332]',
    Low: 'border-[#ede8df] bg-[#faf8f4] text-stone-800',
  }[priority];

  return (
    <div
      className={`border rounded-2xl p-4 transition-all shadow-[0_2px_8px_-2px_rgba(27,67,50,0.03)] relative group ${priorityStyles}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {priority === 'Critical' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {priority === 'High' && <AlertTriangle className="w-4 h-4 text-[#c59b27] shrink-0" />}
          {priority === 'Medium' && <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0" />}
          {priority === 'Low' && <Info className="w-4 h-4 text-stone-500 shrink-0" />}
          <h4 className="text-xs font-bold text-[#0f2319]">{title}</h4>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-stone-400">{timestamp}</span>
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(id);
              }}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-black/5 cursor-pointer transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-stone-600 leading-relaxed mb-2.5">{description}</p>
      {targetModule && onNavigate && (
        <button
          onClick={() => onNavigate(targetModule)}
          className="text-xs font-semibold text-[#1b4332] hover:text-[#2d6a4f] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
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
  <div className="bg-white border border-[#ede8df] rounded-2xl p-12 text-center shadow-[0_2px_12px_-2px_rgba(27,67,50,0.03)]">
    <div className="w-14 h-14 rounded-2xl bg-[#f0f7f2] border border-[#cbe5d4] flex items-center justify-center text-[#1b4332] mx-auto mb-3.5">
      {icon || <Inbox className="w-7 h-7" />}
    </div>
    <h3 className="text-sm sm:text-base font-bold text-[#0f2319]">{title}</h3>
    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-5 px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading operational telemetry...',
}) => (
  <div className="bg-white border border-[#ede8df] rounded-2xl p-14 text-center shadow-[0_2px_12px_-2px_rgba(27,67,50,0.03)]">
    <Loader2 className="w-8 h-8 text-[#1b4332] animate-spin mx-auto mb-3.5" />
    <p className="text-xs text-stone-500 font-medium">{message}</p>
  </div>
);

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'An error occurred while synchronizing module data.', onRetry }) => (
  <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-8 text-center shadow-xs">
    <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2.5" />
    <h4 className="text-sm font-bold text-rose-900">Operational Sync Failure</h4>
    <p className="text-xs text-rose-700 mt-1 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        className={`w-full ${widthClass} bg-white border-l border-[#ede8df] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4.5 border-b border-[#ede8df] bg-[#faf8f4] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0f2319]">{title}</h3>
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
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
      <div className="space-y-5">
        <p className="text-xs text-stone-600 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ede8df]">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-[#ede8df] text-stone-700 hover:bg-[#faf8f4] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#1b4332] hover:bg-[#2d6a4f]'
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
    <div className="bg-white border border-[#ede8df] rounded-2xl p-5 sm:p-6 shadow-[0_2px_10px_-2px_rgba(27,67,50,0.03)] space-y-4">
      <div className="border-b border-[#ede8df] pb-3">
        <h4 className="text-sm font-bold text-[#0f2319]">{title}</h4>
        {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
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
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ede8df]">
      {events.map((evt) => {
        let dotColor = 'bg-stone-300';
        if (evt.status === 'completed') dotColor = 'bg-[#1b4332]';
        if (evt.status === 'current') dotColor = 'bg-[#2d6a4f] ring-4 ring-[#e2f0e6]';
        if (evt.status === 'warning') dotColor = 'bg-[#c59b27]';

        return (
          <div key={evt.id} className="relative group">
            <span
              className={`absolute -left-6 top-1 w-3 h-3 rounded-full ${dotColor} transition-transform`}
            />
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold text-[#0f2319]">{evt.title}</span>
              <span className="text-[10px] font-mono text-stone-400">{evt.timestamp}</span>
            </div>
            {evt.description && (
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{evt.description}</p>
            )}
            {evt.badge && (
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f0f7f2] text-[#1b4332] border border-[#cbe5d4]">
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
    <div className="divide-y divide-[#f2eee6]">
      {items.map((item) => (
        <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#f0f7f2] text-[#1b4332] flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-stone-800 leading-snug">
                <span className="font-bold text-[#0f2319]">{item.user}</span>{' '}
                <span className="text-stone-500">{item.action}</span>{' '}
                <span className="font-semibold text-[#1b4332] font-mono">{item.target}</span>
              </div>
              {item.role && <div className="text-[10px] text-stone-400 mt-0.5 font-medium">{item.role}</div>}
            </div>
          </div>
          <span className="text-[10px] font-mono text-stone-400 shrink-0">{item.timestamp}</span>
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
    <div className="bg-white border border-[#ede8df] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_-2px_rgba(27,67,50,0.03)] flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-5 pb-3 border-b border-[#ede8df]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0f2319] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
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
