import React, { useState } from 'react';
import { 
  Pin, 
  Star, 
  Copy, 
  Check, 
  Bell, 
  Trash2, 
  Archive, 
  CheckSquare, 
  MoreVertical, 
  CopyCheck, 
  FileDown, 
  RotateCcw
} from 'lucide-react';
import { Note } from '../types/note';
import { COLOR_SCHEMES, getPriorityBadge } from '../utils/theme';
import { formatArabicDate, formatReminderTime } from '../utils/date';
import { soundService } from '../utils/audio';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onRestoreFromTrash?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onCopy: (note: Note) => void;
  onDuplicate: (note: Note) => void;
  onDownload: (note: Note) => void;
  onToggleCheckItem: (noteId: string, itemId: string) => void;
  onSetReminder: (note: Note) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleFavorite,
  onToggleArchive,
  onRestoreFromTrash,
  onPermanentDelete,
  onCopy,
  onDuplicate,
  onDownload,
  onToggleCheckItem,
  onSetReminder,
}: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const scheme = COLOR_SCHEMES[note.color] || COLOR_SCHEMES.default;
  const priority = getPriorityBadge(note.priority);
  const reminderInfo = note.reminderAt ? formatReminderTime(note.reminderAt) : null;

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playSoftPop();
    onCopy(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedChecklistCount = note.checklistItems?.filter((i) => i.completed).length || 0;
  const totalChecklistCount = note.checklistItems?.length || 0;
  const checklistProgress = totalChecklistCount > 0 ? (completedChecklistCount / totalChecklistCount) * 100 : 0;

  return (
    <article
      onClick={() => onEdit(note)}
      className={`group relative rounded-xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${scheme.bgLight} ${scheme.bgDark} ${scheme.borderLight} ${scheme.borderDark} hover:border-indigo-300 dark:hover:border-indigo-700/60`}
    >
      {/* Top Header Row of Card */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Title */}
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 text-base leading-snug line-clamp-2 text-balance flex-1">
            {note.title || 'بدون عنوان'}
          </h3>

          {/* Quick action buttons: Pin, Favorite */}
          <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onToggleFavorite(note.id)}
              className={`p-1.5 rounded-md transition-colors ${
                note.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-neutral-400 opacity-60 group-hover:opacity-100 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
              title={note.isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              className={`p-1.5 rounded-md transition-colors ${
                note.isPinned
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-neutral-400 opacity-60 group-hover:opacity-100 hover:text-neutral-600 dark:hover:text-neutral-200'
              }`}
              title={note.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        {note.isChecklist && note.checklistItems && note.checklistItems.length > 0 ? (
          <div className="space-y-1.5 my-2.5">
            {note.checklistItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  soundService.playSoftPop();
                  onToggleCheckItem(note.id, item.id);
                }}
                className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                    item.completed
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                  }`}
                >
                  {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={`truncate flex-1 ${item.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
            {note.checklistItems.length > 4 && (
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 pr-5">
                +{note.checklistItems.length - 4} عناصر إضافية...
              </p>
            )}

            {/* Checklist progress bar */}
            <div className="pt-1.5">
              <div className="w-full bg-neutral-200 dark:bg-neutral-700/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 line-clamp-4 leading-relaxed whitespace-pre-line mb-3">
            {note.content || 'لا يوجد محتوى نصي'}
          </p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata (Zero-pill compliant) & Action Affordances */}
      <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between gap-2">
        {/* Unboxed Metadata with Typographic Separators */}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-neutral-500 overflow-hidden truncate">
          <span>{formatArabicDate(note.updatedAt)}</span>
          {note.category && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[80px]">{note.category}</span>
            </>
          )}
          {note.priority === 'high' && (
            <>
              <span aria-hidden="true">·</span>
              <span className={priority.colorClass}>{priority.label}</span>
            </>
          )}
        </div>

        {/* Reminder indicator if present */}
        {reminderInfo && reminderInfo.label && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSetReminder(note);
            }}
            title="تعديل وقت التذكير"
            className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded transition-colors ${
              reminderInfo.isOverdue
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40'
            }`}
          >
            <Bell className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{reminderInfo.label}</span>
          </button>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Fast Copy Button */}
          <button
            type="button"
            onClick={handleCopyClick}
            className={`p-1.5 rounded-md transition-all ${
              copied
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="نسخ محتوى الملاحظة"
            aria-label="نسخ الملاحظة"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reminder Trigger */}
          <button
            type="button"
            onClick={() => onSetReminder(note)}
            className="p-1.5 rounded-md text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="تعيين تذكير للملاحظة"
            aria-label="تعيين تذكير"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* More actions dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="خيارات إضافية"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute left-0 bottom-full mb-1 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl py-1 z-30 text-xs">
                  {note.isTrash ? (
                    <>
                      {onRestoreFromTrash && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onRestoreFromTrash(note.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                          <span>استعادة الملاحظة</span>
                        </button>
                      )}
                      {onPermanentDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onPermanentDelete(note.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف نهائي</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDuplicate(note);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <CopyCheck className="w-3.5 h-3.5 text-neutral-500" />
                        <span>نسخ متطابق (تكرار)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDownload(note);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <FileDown className="w-3.5 h-3.5 text-neutral-500" />
                        <span>تحميل بصيغة Markdown</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onToggleArchive(note.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Archive className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{note.isArchived ? 'إلغاء الأرشفة' : 'أرشفة الملاحظة'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(note.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>نقل إلى سلة المهملات</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
