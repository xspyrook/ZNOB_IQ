export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type NoteColor = 'default' | 'amber' | 'emerald' | 'sky' | 'indigo' | 'rose' | 'slate';

export type NotePriority = 'low' | 'medium' | 'high';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: NoteColor;
  priority: NotePriority;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isTrash: boolean;
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
  reminderAt?: string | null; // ISO Date string
  reminderNotified?: boolean;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export type ViewMode = 'grid' | 'list';

export type FilterCategory = 'all' | 'reminders' | 'pinned' | 'favorites' | 'archived' | 'trash';

export interface NoteStats {
  total: number;
  remindersCount: number;
  pinnedCount: number;
  favoritesCount: number;
  archivedCount: number;
  trashCount: number;
}
