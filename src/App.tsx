import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Grid, 
  List, 
  ArrowUpDown, 
  FileText, 
  Bell, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  FolderOpen
} from 'lucide-react';

import { Note, FilterCategory, ViewMode, NoteStats } from './types/note';
import { 
  loadNotesFromStorage, 
  saveNotesToStorage, 
  loadThemePreference, 
  saveThemePreference,
  DEFAULT_CATEGORIES,
  copyToClipboard,
  formatNoteForClipboard,
  exportNotesBackup,
  downloadNoteFile
} from './utils/storage';
import { soundService } from './utils/audio';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { ReminderModal } from './components/ReminderModal';
import { NotificationBanner } from './components/NotificationBanner';
import { Toast, ToastProps } from './components/Toast';

type SortOption = 'updated' | 'created' | 'title' | 'reminder';

export default function App() {
  // Persistence & Global state
  const [notes, setNotes] = useState<Note[]>(() => loadNotesFromStorage());
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadThemePreference());

  // Navigation & Filtering
  const [currentFilter, setCurrentFilter] = useState<FilterCategory>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Banners
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [reminderNote, setReminderNote] = useState<Note | null>(null);
  const [activeAlertNote, setActiveAlertNote] = useState<Note | null>(null);

  // Toasts & feedback
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
  const [lastDeletedNote, setLastDeletedNote] = useState<Note | null>(null);

  // Auto-save whenever notes state changes
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  // Apply theme to html document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveThemePreference(theme);
  }, [theme]);

  // Helper to trigger toast
  const showToast = useCallback((message: string, type: 'success' | 'copy' | 'error' | 'info' = 'success', actionLabel?: string, onAction?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, actionLabel, onAction }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Real-time Reminder Evaluation Loop
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();
      notes.forEach((note) => {
        if (!note.isTrash && !note.isArchived && note.reminderAt && !note.reminderNotified) {
          const reminderTime = new Date(note.reminderAt).getTime();
          if (reminderTime <= now) {
            // Trigger alert!
            soundService.playReminderChime();
            setActiveAlertNote(note);

            // Browser notification if granted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`تذكير بملاحظة: ${note.title || 'ملاحظة بدون عنوان'}`, {
                  body: note.content || 'حان موعد التذكير المحدد لهذه الملاحظة.',
                  icon: '/favicon.ico',
                });
              } catch {
                // Ignore notification error
              }
            }

            // Mark note as notified
            setNotes((prevNotes) =>
              prevNotes.map((n) => (n.id === note.id ? { ...n, reminderNotified: true } : n))
            );
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 4000);
    return () => clearInterval(interval);
  }, [notes]);

  // Statistics
  const stats: NoteStats = useMemo(() => {
    const nonTrash = notes.filter((n) => !n.isTrash);
    return {
      total: nonTrash.filter((n) => !n.isArchived).length,
      remindersCount: nonTrash.filter((n) => !n.isArchived && n.reminderAt && new Date(n.reminderAt).getTime() > Date.now()).length,
      pinnedCount: nonTrash.filter((n) => !n.isArchived && n.isPinned).length,
      favoritesCount: nonTrash.filter((n) => !n.isArchived && n.isFavorite).length,
      archivedCount: nonTrash.filter((n) => n.isArchived).length,
      trashCount: notes.filter((n) => n.isTrash).length,
    };
  }, [notes]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => {
      if (!n.isTrash && n.tags) {
        n.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Filter & Search Logic
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Trash filter
      if (currentFilter === 'trash') {
        return note.isTrash;
      }
      if (note.isTrash) return false;

      // Archived filter
      if (currentFilter === 'archived') {
        return note.isArchived;
      }
      if (note.isArchived) return false;

      // Primary filter conditions
      if (currentFilter === 'reminders' && !note.reminderAt) return false;
      if (currentFilter === 'pinned' && !note.isPinned) return false;
      if (currentFilter === 'favorites' && !note.isFavorite) return false;

      // Category filter (if not 'all')
      if (currentFilter === 'all' && selectedCategory !== 'الكل') {
        if (note.category !== selectedCategory) return false;
      }

      // Tag filter
      if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(query);
        const contentMatch = note.content.toLowerCase().includes(query);
        const tagMatch = note.tags?.some((t) => t.toLowerCase().includes(query));
        const checkMatch = note.checklistItems?.some((c) => c.text.toLowerCase().includes(query));
        return titleMatch || contentMatch || tagMatch || checkMatch;
      }

      return true;
    });
  }, [notes, currentFilter, selectedCategory, selectedTag, searchQuery]);

  // Sort Logic
  const sortedNotes = useMemo(() => {
    const list = [...filteredNotes];
    list.sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'ar');
      }
      if (sortBy === 'reminder') {
        if (!a.reminderAt && !b.reminderAt) return 0;
        if (!a.reminderAt) return 1;
        if (!b.reminderAt) return -1;
        return new Date(a.reminderAt).getTime() - new Date(b.reminderAt).getTime();
      }
      return 0;
    });
    return list;
  }, [filteredNotes, sortBy]);

  // Split into Pinned vs Regular (when in 'all' view)
  const pinnedNotes = useMemo(() => {
    if (currentFilter !== 'all' || selectedTag || searchQuery.trim()) return [];
    return sortedNotes.filter((n) => n.isPinned);
  }, [sortedNotes, currentFilter, selectedTag, searchQuery]);

  const regularNotes = useMemo(() => {
    if (currentFilter !== 'all' || selectedTag || searchQuery.trim()) return sortedNotes;
    return sortedNotes.filter((n) => !n.isPinned);
  }, [sortedNotes, currentFilter, selectedTag, searchQuery]);

  // Note Action Handlers
  const handleCreateNewNote = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (savedNote: Note) => {
    setNotes((prevNotes) => {
      const exists = prevNotes.some((n) => n.id === savedNote.id);
      if (exists) {
        return prevNotes.map((n) => (n.id === savedNote.id ? savedNote : n));
      } else {
        return [savedNote, ...prevNotes];
      }
    });

    // Auto extract new category if not existing
    if (savedNote.category && !categories.includes(savedNote.category)) {
      setCategories((prev) => [...prev, savedNote.category]);
    }

    showToast('تم حفظ الملاحظة بنجاح ✨', 'success');
  };

  const handleCopyNote = async (note: Note) => {
    const text = formatNoteForClipboard(note, true);
    const success = await copyToClipboard(text);
    if (success) {
      showToast('تم نسخ الملاحظة إلى الحافظة بنجاح 📋', 'copy');
      // Subtle festive spark
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
          disableForReducedMotion: true,
        });
      } catch {
        // Safe fallback
      }
    } else {
      showToast('تعذر النسخ إلى الحافظة', 'error');
    }
  };

  const handleDuplicateNote = (note: Note) => {
    const duplicated: Note = {
      ...note,
      id: `note-${Date.now()}`,
      title: `${note.title} (نسخة)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };
    setNotes((prev) => [duplicated, ...prev]);
    showToast('تم تكرار الملاحظة بنجاح', 'success');
  };

  const handleMoveToTrash = (id: string) => {
    const noteToDelete = notes.find((n) => n.id === id);
    if (noteToDelete) {
      setLastDeletedNote(noteToDelete);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isTrash: true } : n)));
      showToast('تم نقل الملاحظة إلى سلة المهملات', 'info', 'تراجع', () => {
        handleRestoreFromTrash(id);
      });
    }
  };

  const handleRestoreFromTrash = (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isTrash: false } : n)));
    showToast('تمت استعادة الملاحظة بنجاح', 'success');
  };

  const handlePermanentDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الملاحظة نهائياً؟')) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast('تم حذف الملاحظة نهائياً', 'info');
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm('هل أنت متأكد من تفريغ سلة المهملات بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setNotes((prev) => prev.filter((n) => !n.isTrash));
      showToast('تم تفريغ سلة المهملات بالكامل', 'info');
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleToggleFavorite = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() } : n))
    );
  };

  const handleToggleArchive = (id: string) => {
    setNotes((prev) => {
      const target = prev.find((n) => n.id === id);
      const isNowArchived = !target?.isArchived;
      showToast(isNowArchived ? 'تمت أرشفة الملاحظة' : 'تمت استعادة الملاحظة من الأرشيف', 'info');
      return prev.map((n) => (n.id === id ? { ...n, isArchived: isNowArchived, updatedAt: new Date().toISOString() } : n));
    });
  };

  const handleToggleCheckItem = (noteId: string, itemId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId || !n.checklistItems) return n;
        const updatedItems = n.checklistItems.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...n, checklistItems: updatedItems, updatedAt: new Date().toISOString() };
      })
    );
  };

  const handleSaveReminderFromModal = (noteId: string, reminderAt: string | null) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, reminderAt, reminderNotified: false, updatedAt: new Date().toISOString() } : n))
    );
    showToast(reminderAt ? 'تم ضبط موعد التذكير بنجاح 🔔' : 'تم إلغاء التذكير', 'success');
  };

  const handleSnoozeReminder = (noteId: string, minutes: number) => {
    const newDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, reminderAt: newDate, reminderNotified: false } : n))
    );
    setActiveAlertNote(null);
    showToast(`تم تأجيل التذكير لمدة ${minutes} دقيقة`, 'info');
  };

  const handleDismissReminder = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, reminderAt: null, reminderNotified: true } : n))
    );
    setActiveAlertNote(null);
    showToast('تم إنجاز التذكير', 'success');
  };

  const handleImportBackup = (importedData: unknown) => {
    if (Array.isArray(importedData)) {
      setNotes(importedData as Note[]);
      showToast(`تم استيراد ${importedData.length} ملاحظة بنجاح 🎉`, 'success');
    } else {
      showToast('الملف غير متوافق، يرجى اختيار ملف JSON صالح', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Contract Compliant Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onNewNote={handleCreateNewNote}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        remindersCount={stats.remindersCount}
        onShowReminders={() => setCurrentFilter('reminders')}
        onExportBackup={() => exportNotesBackup(notes)}
        saveStatusText="محفوظ تلقائياً"
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar Navigation */}
        <Sidebar
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={(cat) => setCategories((prev) => [...prev, cat])}
          allTags={allTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          stats={stats}
          onExportBackup={() => exportNotesBackup(notes)}
          onImportBackup={handleImportBackup}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onEmptyTrash={handleEmptyTrash}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Sub-bar / View Controls & Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  {currentFilter === 'all' && (selectedCategory === 'الكل' ? 'جميع الملاحظات' : `تصنيف: ${selectedCategory}`)}
                  {currentFilter === 'reminders' && 'التذكيرات النشطة 🔔'}
                  {currentFilter === 'pinned' && 'الملاحظات المثبتة 📌'}
                  {currentFilter === 'favorites' && 'الملاحظات المفضلة ⭐'}
                  {currentFilter === 'archived' && 'الأرشيف 📁'}
                  {currentFilter === 'trash' && 'سلة المهملات 🗑️'}
                </h1>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 tabular-nums">
                  ({sortedNotes.length})
                </span>
              </div>
              {selectedTag && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                  <span>تصفية بالوسم: #{selectedTag}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="underline text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    (إلغاء التصفية)
                  </button>
                </div>
              )}
            </div>

            {/* View Controls: Segmented Layout & Sort Dropdown */}
            <div className="flex items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-700 dark:text-neutral-300 focus:outline-none"
                >
                  <option value="updated">الأحدث تعديلاً</option>
                  <option value="created">الأحدث إنشاءً</option>
                  <option value="title">أبجدياً (أ-ي)</option>
                  <option value="reminder">موعد التذكير</option>
                </select>
              </div>

              {/* Grid / List Segmented Switcher */}
              <div className="flex items-center gap-1 p-1 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title="عرض شبكي"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title="عرض قائمة"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Create Note Card Trigger */}
          {currentFilter === 'all' && !searchQuery && !selectedTag && (
            <div
              onClick={handleCreateNewNote}
              className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 transition-all cursor-pointer flex items-center justify-between text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">اكتب ملاحظة جديدة أو قائمة مهام...</span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md">
                + إنشاء
              </span>
            </div>
          )}

          {/* Empty State */}
          {sortedNotes.length === 0 && (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 mx-auto flex items-center justify-center text-neutral-400">
                {currentFilter === 'reminders' ? (
                  <Bell className="w-8 h-8 text-amber-500/80" />
                ) : currentFilter === 'trash' ? (
                  <Trash2 className="w-8 h-8 text-neutral-400" />
                ) : (
                  <FileText className="w-8 h-8 text-neutral-400" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-base">
                  {searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد ملاحظات هنا حتى الآن'}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {searchQuery
                    ? 'جرب البحث بكلمات أخرى أو مسح شريط البحث'
                    : currentFilter === 'reminders'
                    ? 'لم تقم بجدولة أي تذكيرات بعد، يمكنك إضافة تذكير لأي ملاحظة بسهولة'
                    : 'ابدأ بتسجيل أفكارك، مهامك، وملاحظاتك اليومية بنقرة واحدة'}
                </p>
              </div>
              {!searchQuery && currentFilter !== 'trash' && (
                <button
                  type="button"
                  onClick={handleCreateNewNote}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة أول ملاحظة</span>
                </button>
              )}
            </div>
          )}

          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>الملاحظات المثبتة</span>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'flex flex-col gap-3'
                }
              >
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleMoveToTrash}
                    onTogglePin={handleTogglePin}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleArchive={handleToggleArchive}
                    onRestoreFromTrash={handleRestoreFromTrash}
                    onPermanentDelete={handlePermanentDelete}
                    onCopy={handleCopyNote}
                    onDuplicate={handleDuplicateNote}
                    onDownload={downloadNoteFile}
                    onToggleCheckItem={handleToggleCheckItem}
                    onSetReminder={(n) => setReminderNote(n)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Regular Notes Section */}
          {regularNotes.length > 0 && (
            <section className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider pt-2">
                  <span>الملاحظات الأخرى</span>
                </div>
              )}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'flex flex-col gap-3'
                }
              >
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleMoveToTrash}
                    onTogglePin={handleTogglePin}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleArchive={handleToggleArchive}
                    onRestoreFromTrash={handleRestoreFromTrash}
                    onPermanentDelete={handlePermanentDelete}
                    onCopy={handleCopyNote}
                    onDuplicate={handleDuplicateNote}
                    onDownload={downloadNoteFile}
                    onToggleCheckItem={handleToggleCheckItem}
                    onSetReminder={(n) => setReminderNote(n)}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Note Editor Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        note={editingNote}
        categories={categories}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        onCopy={handleCopyNote}
        onDownload={downloadNoteFile}
      />

      {/* Dedicated Reminder Scheduler Modal */}
      <ReminderModal
        isOpen={Boolean(reminderNote)}
        note={reminderNote}
        onClose={() => setReminderNote(null)}
        onSaveReminder={handleSaveReminderFromModal}
      />

      {/* Floating Active Reminder Alert Banner */}
      <NotificationBanner
        activeAlertNote={activeAlertNote}
        onOpenNote={(n) => {
          setEditingNote(n);
          setIsNoteModalOpen(true);
          setActiveAlertNote(null);
        }}
        onSnooze={handleSnoozeReminder}
        onDismiss={handleDismissReminder}
      />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
