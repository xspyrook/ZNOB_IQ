import { Note } from '../types/note';

const STORAGE_KEY = 'modawen_notes_v1';
const THEME_KEY = 'modawen_theme';

export const DEFAULT_CATEGORIES = [
  'الكل',
  'العمل',
  'شخصي',
  'أفكار',
  'دراسة',
  'مهمات',
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'خطة إطلاق وتطوير التطبيق 🚀',
    content: 'أبرز النقاط المستهدفة للإطلاق:\n- مراجعة تجربة المستخدم وسلاسة التصفح\n- التأكد من دقة نظام التنبيهات وجدولة المواعيد\n- دعم حفظ البيانات محلياً مع التصدير والاستيراد\n- تسهيل نسخ ومشاركة الملاحظات بنقرة واحدة',
    category: 'العمل',
    tags: ['تطوير', 'تخطيط', 'أولويات'],
    color: 'emerald',
    priority: 'high',
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    isTrash: false,
    isChecklist: false,
    checklistItems: [],
    reminderAt: new Date(Date.now() + 3600 * 1000 * 4).toISOString(), // in 4 hours
    reminderNotified: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'note-2',
    title: 'قائمة تجهيز حقيبة السفر ✈️',
    content: 'أشياء أساسية يجب التأكد منها قبل مغادرة المنزل:',
    category: 'شخصي',
    tags: ['سفر', 'عطلة', 'تجهيزات'],
    color: 'sky',
    priority: 'medium',
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    isTrash: false,
    isChecklist: true,
    checklistItems: [
      { id: 'chk-1', text: 'جواز السفر وتأشيرات الدخول', completed: true },
      { id: 'chk-2', text: 'تأكيد حجز الفندق وتذاكر الطيران', completed: true },
      { id: 'chk-3', text: 'الشاحن المتنقل والمحولات الكهربائية', completed: true },
      { id: 'chk-4', text: 'حقيبة الأدوية والمستلزمات الشخصية', completed: false },
      { id: 'chk-5', text: 'سماعات إلغاء الضوضاء وكتاب للقراءة', completed: false },
    ],
    reminderAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // Tomorrow
    reminderNotified: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
  {
    id: 'note-3',
    title: 'أفكار لمشروع محتوى تقني إبداعي 💡',
    content: 'سلسلة مقاطع قصيرة تشرح تبسيط التقنيات الحديثة للمستخدم العادي.\nالتركيز على:\n1. كيف تعمل أدوات الذكاء الاصطناعي في حياتنا اليومية\n2. أفضل ممارسات حماية الخصوصية وكلمات المرور\n3. تطبيقات زيادة الإنتاجية وإدارة الملاحظات',
    category: 'أفكار',
    tags: ['إبداع', 'صناعة_محتوى', 'تقنية'],
    color: 'amber',
    priority: 'medium',
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrash: false,
    isChecklist: false,
    checklistItems: [],
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
  {
    id: 'note-4',
    title: 'تذكير: موعد فحص السيارة والصيانة الدورية 🚗',
    content: 'فحص زيت المحرك، ضغط الإطارات، والتأكد من بطارية السيارة قبل بدء فصل الصيف.',
    category: 'مهمات',
    tags: ['سيارة', 'صيانة', 'مهم'],
    color: 'rose',
    priority: 'high',
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrash: false,
    isChecklist: false,
    checklistItems: [],
    reminderAt: new Date(Date.now() + 3600 * 1000 * 2).toISOString(), // in 2 hours
    reminderNotified: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: 'note-5',
    title: 'مراجع وكتب للقراءة هذا الشهر 📚',
    content: '- كتاب التفكير بسرعة وببطء - دانيال كانمان\n- العادات الذرية - جيمس كلير\n- ديب وورك (العمل العميق) - كال نيوبورت',
    category: 'دراسة',
    tags: ['قراءة', 'تطوير_ذاتي'],
    color: 'indigo',
    priority: 'low',
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrash: false,
    isChecklist: false,
    checklistItems: [],
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
  },
];

export function loadNotesFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveNotesToStorage(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_NOTES;
  } catch (err) {
    console.error('Error loading notes:', err);
    return INITIAL_NOTES;
  }
}

export function saveNotesToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Error saving notes to localStorage:', err);
  }
}

export function loadThemePreference(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Error saving theme preference:', err);
  }
}

/**
 * Format note text for clean clipboard copying
 */
export function formatNoteForClipboard(note: Note, rich = false): string {
  const parts: string[] = [];
  
  if (note.title) {
    parts.push(note.title);
  }

  if (note.isChecklist && note.checklistItems?.length > 0) {
    const checklistText = note.checklistItems
      .map(item => `${item.completed ? '☑' : '☐'} ${item.text}`)
      .join('\n');
    parts.push(checklistText);
  } else if (note.content) {
    parts.push(note.content);
  }

  if (rich) {
    const meta: string[] = [];
    if (note.category) meta.push(`التصنيف: ${note.category}`);
    if (note.tags?.length > 0) meta.push(`الوسوم: ${note.tags.map(t => `#${t}`).join(' ')}`);
    if (note.reminderAt) {
      const rem = new Date(note.reminderAt).toLocaleString('ar-SA');
      meta.push(`التذكير: ${rem}`);
    }
    if (meta.length > 0) {
      parts.push('\n---\n' + meta.join(' · '));
    }
  }

  return parts.join('\n\n');
}

/**
 * Copy string to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback using textarea
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

/**
 * Download notes as JSON file
 */
export function exportNotesBackup(notes: Note[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStamp = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `modawen_notes_backup_${dateStamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Download single note as .txt or .md
 */
export function downloadNoteFile(note: Note): void {
  const content = formatNoteForClipboard(note, true);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (note.title || 'ملاحظة').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  a.download = `${safeTitle}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
