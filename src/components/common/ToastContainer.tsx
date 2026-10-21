import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        const bgClass = isSuccess
          ? 'bg-[#0d1f14] border-emerald-500/30 text-emerald-300'
          : isWarning
          ? 'bg-[#261c0e] border-amber-500/30 text-amber-300'
          : isError
          ? 'bg-[#291215] border-rose-500/30 text-rose-300'
          : 'bg-[#111c2e] border-blue-500/30 text-blue-300';

        const IconComponent = isSuccess
          ? CheckCircle2
          : isWarning
          ? AlertTriangle
          : isError
          ? XCircle
          : Info;

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${bgClass}`}
          >
            <div className="shrink-0 mt-0.5">
              <IconComponent className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              {toast.title && (
                <p className="text-xs font-bold leading-tight mb-0.5 text-slate-100">
                  {toast.title}
                </p>
              )}
              <p className="text-xs text-slate-300 leading-snug break-words">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
