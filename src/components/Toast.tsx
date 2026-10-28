import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, Copy, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'info' | 'error' | 'copy';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  type = 'success',
  message,
  actionLabel,
  onAction,
  onClose,
  duration = 3200,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'copy':
        return <Copy className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div
      role="alert"
      className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 rounded-xl shadow-lg border border-neutral-200/80 dark:border-neutral-800 transition-all duration-200 text-sm max-w-md pointer-events-auto"
    >
      {getIcon()}
      <span className="flex-1 font-medium">{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={() => {
            onAction();
            onClose();
          }}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق التنبيه"
        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
