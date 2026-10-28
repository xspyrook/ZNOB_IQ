import { Bell, Check, Clock, X, ArrowLeft } from 'lucide-react';
import { Note } from '../types/note';

interface NotificationBannerProps {
  activeAlertNote: Note | null;
  onOpenNote: (note: Note) => void;
  onSnooze: (noteId: string, minutes: number) => void;
  onDismiss: (noteId: string) => void;
}

export function NotificationBanner({
  activeAlertNote,
  onOpenNote,
  onSnooze,
  onDismiss,
}: NotificationBannerProps) {
  if (!activeAlertNote) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 transition-all duration-300 pointer-events-auto">
      <div className="bg-white dark:bg-neutral-900 border-2 border-indigo-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                حان وقت التذكير 🔔
              </span>
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-1">
                {activeAlertNote.title || 'ملاحظة بدون عنوان'}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(activeAlertNote.id)}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Note preview */}
        {activeAlertNote.content && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 pr-11">
            {activeAlertNote.content}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => onSnooze(activeAlertNote.id, 15)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>تأجيل 15 دقيقة</span>
          </button>

          <button
            type="button"
            onClick={() => onDismiss(activeAlertNote.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors font-semibold"
          >
            <Check className="w-3.5 h-3.5" />
            <span>تم الإنجاز</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenNote(activeAlertNote)}
            className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <span>فتح الملاحظة</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
