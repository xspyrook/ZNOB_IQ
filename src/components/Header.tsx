import { Search, Plus, Moon, Sun, Menu, Bell, Download, RefreshCw } from 'lucide-react';
import { ViewMode } from '../types/note';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onNewNote: () => void;
  onOpenMobileMenu: () => void;
  remindersCount: number;
  onShowReminders: () => void;
  onExportBackup: () => void;
  saveStatusText?: string;
}

export function Header({
  searchQuery,
  onSearchChange,
  theme,
  onThemeToggle,
  onNewNote,
  onOpenMobileMenu,
  remindersCount,
  onShowReminders,
  onExportBackup,
  saveStatusText,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <span className="text-base font-bold font-sans">م</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
                مُدَوِّن
              </span>
            </div>
          </a>

          {saveStatusText && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 border-r border-neutral-200 dark:border-neutral-800 pr-3 mr-1">
              <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
              {saveStatusText}
            </span>
          )}
        </div>

        {/* Zone 2: Search input */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث في الملاحظات، المهام، الوسوم..."
              className="w-full pl-4 pr-9 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-100/90 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 rounded-lg border border-transparent focus:border-indigo-500/40 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 absolute left-3 top-1/2 -translate-y-1/2"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active reminders quick button */}
          <button
            type="button"
            onClick={onShowReminders}
            className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="التذكيرات النشطة"
            aria-label="التذكيرات"
          >
            <Bell className="w-4 h-4" />
            {remindersCount > 0 && (
              <span className="absolute top-1.5 left-1.5 w-4 h-4 bg-indigo-600 text-[10px] text-white font-bold rounded-full flex items-center justify-center leading-none">
                {remindersCount}
              </span>
            )}
          </button>

          {/* Backup download button */}
          <button
            type="button"
            onClick={onExportBackup}
            className="hidden sm:flex p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="تصدير نسخة احتياطية من الملاحظات"
            aria-label="تصدير نسخة احتياطية"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={onThemeToggle}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الليلي'}
            aria-label="تبديل المظهر"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onNewNote}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm shadow-indigo-500/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>ملاحظة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
}
