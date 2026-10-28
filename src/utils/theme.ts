import { NoteColor, NotePriority } from '../types/note';

export interface ColorScheme {
  id: NoteColor;
  label: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  dotColor: string;
  accentText: string;
}

export const COLOR_SCHEMES: Record<NoteColor, ColorScheme> = {
  default: {
    id: 'default',
    label: 'كلاسيكي',
    bgLight: 'bg-white',
    bgDark: 'dark:bg-neutral-900',
    borderLight: 'border-neutral-200',
    borderDark: 'dark:border-neutral-800',
    dotColor: 'bg-neutral-400',
    accentText: 'text-neutral-700 dark:text-neutral-300',
  },
  amber: {
    id: 'amber',
    label: 'عنبري',
    bgLight: 'bg-amber-50/70',
    bgDark: 'dark:bg-amber-950/25',
    borderLight: 'border-amber-200/80',
    borderDark: 'dark:border-amber-900/40',
    dotColor: 'bg-amber-500',
    accentText: 'text-amber-800 dark:text-amber-300',
  },
  emerald: {
    id: 'emerald',
    label: 'زمردي',
    bgLight: 'bg-emerald-50/70',
    bgDark: 'dark:bg-emerald-950/25',
    borderLight: 'border-emerald-200/80',
    borderDark: 'dark:border-emerald-900/40',
    dotColor: 'bg-emerald-500',
    accentText: 'text-emerald-800 dark:text-emerald-300',
  },
  sky: {
    id: 'sky',
    label: 'سماوي',
    bgLight: 'bg-sky-50/70',
    bgDark: 'dark:bg-sky-950/25',
    borderLight: 'border-sky-200/80',
    borderDark: 'dark:border-sky-900/40',
    dotColor: 'bg-sky-500',
    accentText: 'text-sky-800 dark:text-sky-300',
  },
  indigo: {
    id: 'indigo',
    label: 'بنفسجي',
    bgLight: 'bg-indigo-50/70',
    bgDark: 'dark:bg-indigo-950/25',
    borderLight: 'border-indigo-200/80',
    borderDark: 'dark:border-indigo-900/40',
    dotColor: 'bg-indigo-500',
    accentText: 'text-indigo-800 dark:text-indigo-300',
  },
  rose: {
    id: 'rose',
    label: 'وردي',
    bgLight: 'bg-rose-50/70',
    bgDark: 'dark:bg-rose-950/25',
    borderLight: 'border-rose-200/80',
    borderDark: 'dark:border-rose-900/40',
    dotColor: 'bg-rose-500',
    accentText: 'text-rose-800 dark:text-rose-300',
  },
  slate: {
    id: 'slate',
    label: 'رمادي',
    bgLight: 'bg-slate-100/70',
    bgDark: 'dark:bg-slate-900/60',
    borderLight: 'border-slate-300/70',
    borderDark: 'dark:border-slate-700/50',
    dotColor: 'bg-slate-500',
    accentText: 'text-slate-800 dark:text-slate-300',
  },
};

export function getPriorityBadge(priority: NotePriority): { label: string; colorClass: string } {
  switch (priority) {
    case 'high':
      return { label: 'عاجل', colorClass: 'text-rose-600 dark:text-rose-400 font-medium' };
    case 'medium':
      return { label: 'متوسط', colorClass: 'text-amber-600 dark:text-amber-400' };
    case 'low':
      return { label: 'عادي', colorClass: 'text-neutral-500 dark:text-neutral-400' };
  }
}
