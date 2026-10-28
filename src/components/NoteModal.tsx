import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Pin, 
  Star, 
  Bell, 
  Download, 
  Plus, 
  Trash2, 
  CheckSquare, 
  FileText, 
  Save, 
  Sparkles,
  Tag as TagIcon
} from 'lucide-react';
import { Note, NoteColor, NotePriority, ChecklistItem } from '../types/note';
import { COLOR_SCHEMES } from '../utils/theme';
import { formatReminderTime, toDateTimeLocalString } from '../utils/date';
import { soundService } from '../utils/audio';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onSave: (updatedNote: Note) => void;
  onCopy: (note: Note) => void;
  onDownload: (note: Note) => void;
}

export function NoteModal({
  note,
  isOpen,
  categories,
  onClose,
  onSave,
  onCopy,
  onDownload,
}: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('شخصي');
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [color, setColor] = useState<NoteColor>('default');
  const [priority, setPriority] = useState<NotePriority>('medium');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [reminderAt, setReminderAt] = useState<string | null>(null);
  const [isReminderPickerOpen, setIsReminderPickerOpen] = useState(false);
  const [customReminderDate, setCustomReminderDate] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [autosaveIndicator, setAutosaveIndicator] = useState<string>('محفوظ');

  const titleInputRef = useRef<HTMLInputElement>(null);
  const newChecklistRef = useRef<HTMLInputElement>(null);

  // Load note data on open
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category || 'شخصي');
      setColor(note.color || 'default');
      setPriority(note.priority || 'medium');
      setIsPinned(Boolean(note.isPinned));
      setIsFavorite(Boolean(note.isFavorite));
      setIsChecklist(Boolean(note.isChecklist));
      setChecklistItems(note.checklistItems ? [...note.checklistItems] : []);
      setTags(note.tags ? [...note.tags] : []);
      setReminderAt(note.reminderAt || null);
      if (note.reminderAt) {
        setCustomReminderDate(toDateTimeLocalString(new Date(note.reminderAt)));
      } else {
        const d = new Date(Date.now() + 2 * 3600 * 1000);
        d.setMinutes(0, 0, 0);
        setCustomReminderDate(toDateTimeLocalString(d));
      }
    } else {
      // Blank note defaults
      setTitle('');
      setContent('');
      setCategory('شخصي');
      setColor('default');
      setPriority('medium');
      setIsPinned(false);
      setIsFavorite(false);
      setIsChecklist(false);
      setChecklistItems([]);
      setTags([]);
      setReminderAt(null);
      const d = new Date(Date.now() + 2 * 3600 * 1000);
      d.setMinutes(0, 0, 0);
      setCustomReminderDate(toDateTimeLocalString(d));
    }
  }, [note, isOpen]);

  if (!isOpen) return null;

  const currentNoteState: Note = {
    id: note ? note.id : `note-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    category,
    tags,
    color,
    priority,
    isPinned,
    isFavorite,
    isArchived: note?.isArchived || false,
    isTrash: note?.isTrash || false,
    isChecklist,
    checklistItems,
    reminderAt,
    reminderNotified: note?.reminderNotified || false,
    createdAt: note?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleSaveAndClose = () => {
    if (!title.trim() && !content.trim() && checklistItems.length === 0) {
      onClose();
      return;
    }
    soundService.playSaveSound();
    onSave(currentNoteState);
    onClose();
  };

  const handleCopyNote = () => {
    soundService.playSoftPop();
    onCopy(currentNoteState);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleAddChecklistItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;

    setChecklistItems([
      ...checklistItems,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        text: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText('');
    newChecklistRef.current?.focus();
  };

  const handleToggleCheckItem = (id: string) => {
    soundService.playSoftPop();
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleDeleteCheckItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddCategoryCustom = () => {
    if (newCatInput.trim()) {
      setCategory(newCatInput.trim());
      setNewCatInput('');
      setShowAddCat(false);
    }
  };

  const handleSaveCustomReminder = () => {
    if (customReminderDate) {
      setReminderAt(new Date(customReminderDate).toISOString());
    } else {
      setReminderAt(null);
    }
    setIsReminderPickerOpen(false);
  };

  const reminderFormatted = reminderAt ? formatReminderTime(reminderAt) : null;
  const currentScheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border transition-all duration-200 overflow-hidden my-auto flex flex-col max-h-[90vh] ${currentScheme.bgLight} ${currentScheme.bgDark} ${currentScheme.borderLight} ${currentScheme.borderDark}`}
      >
        {/* Top Modal Bar: Pin, Favorite, Autosave Status, Close */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200/70 dark:border-neutral-800/80 bg-white/40 dark:bg-neutral-900/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg transition-colors ${
                isPinned
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title={isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current rotate-45' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <span className="text-xs text-neutral-400 dark:text-neutral-500 mr-2 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>جاهز للحفظ</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button right at the top */}
            <button
              type="button"
              onClick={handleCopyNote}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copyFeedback
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
              }`}
              title="نسخ محتوى الملاحظة"
            >
              {copyFeedback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyFeedback ? 'تم النسخ!' : 'نسخ'}</span>
            </button>

            {/* Download as Markdown */}
            <button
              type="button"
              onClick={() => onDownload(currentNoteState)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="تصدير كملف Markdown"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors mr-1"
              aria-label="إغلاق وحفظ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Note Title Input */}
          <input
            ref={titleInputRef}
            type="text"
            placeholder="عنوان الملاحظة..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg sm:text-xl font-bold bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />

          {/* Mode Switcher: Text Note vs Checklist */}
          <div className="flex items-center gap-2 border-b border-neutral-200/70 dark:border-neutral-800/80 pb-3">
            <button
              type="button"
              onClick={() => setIsChecklist(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !isChecklist
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ملاحظة نصية</span>
            </button>

            <button
              type="button"
              onClick={() => setIsChecklist(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isChecklist
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>قائمة مهام (Checklist)</span>
            </button>
          </div>

          {/* Content Area */}
          {!isChecklist ? (
            <textarea
              placeholder="اكتب ملاحظتك هنا بحرية..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full bg-transparent text-sm sm:text-base text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <div className="space-y-2">
              {/* Checklist items list */}
              <div className="space-y-1.5">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleCheckItem(item.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        item.completed
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChecklistItems((prev) =>
                          prev.map((i) => (i.id === item.id ? { ...i, text: val } : i))
                        );
                      }}
                      className={`flex-1 text-sm bg-transparent focus:outline-none ${
                        item.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCheckItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add checklist item form */}
              <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-1">
                <input
                  ref={newChecklistRef}
                  type="text"
                  placeholder="أضف عنصراً جديداً واضغط Enter..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white/70 dark:bg-neutral-800/70 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500 text-neutral-800 dark:text-neutral-100"
                />
                <button
                  type="submit"
                  className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Tags section */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-xs text-neutral-400 flex items-center gap-1 ml-1">
                <TagIcon className="w-3.5 h-3.5" />
                الوسوم:
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="أضف وسم ثم Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="text-xs bg-transparent border-b border-dashed border-neutral-300 dark:border-neutral-700 px-1 py-0.5 focus:outline-none focus:border-indigo-500 w-32"
              />
            </div>
          </div>

          {/* Color Scheme Picker */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
              لون الملاحظة
            </label>
            <div className="flex items-center gap-2">
              {(Object.keys(COLOR_SCHEMES) as NoteColor[]).map((cKey) => {
                const s = COLOR_SCHEMES[cKey];
                const isSelected = color === cKey;
                return (
                  <button
                    key={cKey}
                    type="button"
                    onClick={() => setColor(cKey)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${s.dotColor} ${
                      isSelected ? 'ring-2 ring-indigo-500 scale-110 border-white' : 'border-transparent hover:scale-105'
                    }`}
                    title={s.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Metadata Controls: Category, Priority, Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
            {/* Category selection */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                التصنيف
              </label>
              {!showAddCat ? (
                <div className="flex items-center gap-1">
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setShowAddCat(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full text-xs bg-white/70 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-800 dark:text-neutral-100 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'الكل').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__NEW__">+ تصنيف جديد...</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="تصنيف جديد..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategoryCustom}
                    className="p-1 bg-indigo-600 text-white rounded text-xs"
                  >
                    حفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCat(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Priority selection */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                الأولوية
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NotePriority)}
                className="w-full text-xs bg-white/70 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-800 dark:text-neutral-100 focus:outline-none"
              >
                <option value="low">عادي</option>
                <option value="medium">متوسط</option>
                <option value="high">عاجل ومهم</option>
              </select>
            </div>

            {/* Reminder button */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                التذكير
              </label>
              <button
                type="button"
                onClick={() => setIsReminderPickerOpen(!isReminderPickerOpen)}
                className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  reminderFormatted
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-200 font-medium'
                    : 'bg-white/70 dark:bg-neutral-800/70 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{reminderFormatted ? reminderFormatted.label : 'تعيين موعد'}</span>
                </div>
                {reminderAt && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setReminderAt(null);
                    }}
                    className="text-neutral-400 hover:text-rose-500 mr-1"
                    title="حذف التذكير"
                  >
                    ×
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick inline reminder custom picker */}
          {isReminderPickerOpen && (
            <div className="p-3 bg-white dark:bg-neutral-800/90 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
              <span className="text-xs font-semibold text-neutral-800 dark:text-white">حدد وقت التذكير:</span>
              <input
                type="datetime-local"
                value={customReminderDate}
                onChange={(e) => setCustomReminderDate(e.target.value)}
                className="w-full text-xs px-2 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReminderPickerOpen(false)}
                  className="px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 rounded"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomReminder}
                  className="px-3 py-1 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded font-medium"
                >
                  تأكيد الموعد
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/70 dark:bg-neutral-900/70 border-t border-neutral-200/70 dark:border-neutral-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg transition-all shadow-sm shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الملاحظة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
