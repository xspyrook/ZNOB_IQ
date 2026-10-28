import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Bell, 
  Pin, 
  Star, 
  Archive, 
  Trash2, 
  FolderPlus, 
  Tag as TagIcon, 
  Upload, 
  Download, 
  X,
  Plus
} from 'lucide-react';
import { FilterCategory, NoteStats } from '../types/note';

interface SidebarProps {
  currentFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onAddCategory: (cat: string) => void;
  allTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  stats: NoteStats;
  onExportBackup: () => void;
  onImportBackup: (importedNotes: unknown) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onEmptyTrash: () => void;
}

export function Sidebar({
  currentFilter,
  onFilterChange,
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  allTags,
  selectedTag,
  onSelectTag,
  stats,
  onExportBackup,
  onImportBackup,
  isMobileOpen,
  onCloseMobile,
  onEmptyTrash,
}: SidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportBackup(json);
      } catch (err) {
        console.error('Invalid backup file', err);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navItems: { id: FilterCategory; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'جميع الملاحظات', icon: <FileText className="w-4 h-4" />, count: stats.total },
    { id: 'reminders', label: 'التذكيرات القادمة', icon: <Bell className="w-4 h-4 text-amber-500" />, count: stats.remindersCount },
    { id: 'pinned', label: 'المثبتة', icon: <Pin className="w-4 h-4 text-indigo-500" />, count: stats.pinnedCount },
    { id: 'favorites', label: 'المفضلة', icon: <Star className="w-4 h-4 text-yellow-500" />, count: stats.favoritesCount },
    { id: 'archived', label: 'المؤرشفة', icon: <Archive className="w-4 h-4 text-neutral-400" />, count: stats.archivedCount },
    { id: 'trash', label: 'سلة المحذوفات', icon: <Trash2 className="w-4 h-4 text-rose-500" />, count: stats.trashCount },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6 text-sm">
      {/* Primary Navigation Filters */}
      <div className="space-y-1">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
          التنقل السريع
        </div>
        {navItems.map((item) => {
          const isActive = currentFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onFilterChange(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <span className={`text-xs tabular-nums ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-400'}`}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Trash Empty Action (Only when in trash and trash > 0) */}
      {currentFilter === 'trash' && stats.trashCount > 0 && (
        <button
          type="button"
          onClick={onEmptyTrash}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>تفريغ سلة المحذوفات</span>
        </button>
      )}

      {/* Categories Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
          <span>التصنيفات</span>
          <button
            type="button"
            onClick={() => setIsAddingCategory(!isAddingCategory)}
            className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded transition-colors"
            title="إضافة تصنيف جديد"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {isAddingCategory && (
          <form onSubmit={handleAddCategorySubmit} className="px-2 pt-1 pb-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="اسم التصنيف..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs text-white bg-indigo-600 rounded-md font-medium hover:bg-indigo-700"
              >
                إضافة
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat && currentFilter === 'all';
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onSelectCategory(cat);
                  onFilterChange('all');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>{cat}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Cloud */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
            <span>الوسوم الشائعة</span>
            {selectedTag && (
              <button
                type="button"
                onClick={() => onSelectTag(null)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                مسح الفلتر
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 px-2">
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onSelectTag(isSelected ? null : tag);
                    onFilterChange('all');
                    onCloseMobile();
                  }}
                  className={`text-xs px-2 py-0.5 rounded transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Backup and Restore Utilities */}
      <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 space-y-1 mt-auto">
        <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
          النسخ الاحتياطي
        </div>
        <button
          type="button"
          onClick={onExportBackup}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          <span>تصدير الملاحظات (JSON)</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-500" />
          <span>استيراد نسخة احتياطية</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-l border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-neutral-900 h-full shadow-2xl z-10 flex flex-col">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="font-bold text-neutral-900 dark:text-white">القوائم والتصنيفات</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
