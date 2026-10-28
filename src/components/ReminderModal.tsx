import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Volume2, X, Trash2, Check } from 'lucide-react';
import { Note } from '../types/note';
import { toDateTimeLocalString } from '../utils/date';
import { soundService } from '../utils/audio';

interface ReminderModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReminder: (noteId: string, reminderAt: string | null) => void;
}

export function ReminderModal({ note, isOpen, onClose, onSaveReminder }: ReminderModalProps) {
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    if (note) {
      if (note.reminderAt) {
        const date = new Date(note.reminderAt);
        setSelectedDateTime(toDateTimeLocalString(date));
      } else {
        // Default to 2 hours from now
        const defaultDate = new Date(Date.now() + 2 * 3600 * 1000);
        defaultDate.setMinutes(0, 0, 0);
        setSelectedDateTime(toDateTimeLocalString(defaultDate));
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, [note, isOpen]);

  if (!isOpen || !note) return null;

  const handlePreset = (hoursOffset: number, specificHour?: number) => {
    const d = new Date();
    if (specificHour !== undefined) {
      d.setHours(specificHour, 0, 0, 0);
      if (d.getTime() <= Date.now()) {
        d.setDate(d.getDate() + 1);
      }
    } else {
      d.setTime(d.getTime() + hoursOffset * 3600 * 1000);
    }
    setSelectedDateTime(toDateTimeLocalString(d));
  };

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setHasNotificationPermission(perm === 'granted');
    }
  };

  const handleSave = () => {
    if (!selectedDateTime) {
      onSaveReminder(note.id, null);
    } else {
      const iso = new Date(selectedDateTime).toISOString();
      onSaveReminder(note.id, iso);
    }
    onClose();
  };

  const handleClear = () => {
    onSaveReminder(note.id, null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
            <Bell className="w-5 h-5" />
            <h3 className="text-base text-neutral-900 dark:text-white">جدولة تذكير للملاحظة</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Title Preview */}
        <div className="px-5 pt-3 pb-1">
          <p className="text-xs text-neutral-400">الملاحظة المعنية:</p>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {note.title || 'ملاحظة بدون عنوان'}
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              اختصارات المواعيد السريعة
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handlePreset(1)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>بعد ساعة واحدة</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreset(0, 20)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>الليلة (8:00 م)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreset(0, 9)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>صباح الغد (9:00 ص)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreset(48)}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>بعد يومين</span>
              </button>
            </div>
          </div>

          {/* Custom Date Time Picker */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              تحديد الوقت والتاريخ يدوياً
            </label>
            <input
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Audio Chime preview and Browser Notification Permission */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
            <button
              type="button"
              onClick={() => soundService.playReminderChime()}
              className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              <Volume2 className="w-4 h-4" />
              <span>معاينة نغمة التنبيه</span>
            </button>

            {!hasNotificationPermission && typeof window !== 'undefined' && 'Notification' in window && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
              >
                تفعيل إشعارات المتصفح
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800">
          {note.reminderAt ? (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إلغاء التذكير</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>حفظ التذكير</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
