/**
 * Utility functions for formatting dates and times in Arabic
 */

export function formatArabicDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    // If within last minute
    if (diffSec < 60 && diffSec >= 0) {
      return 'الآن';
    }
    // If within last hour
    if (diffMin < 60 && diffMin > 0) {
      return `منذ ${diffMin} ${diffMin === 1 ? 'دقيقة' : diffMin === 2 ? 'دقيقتين' : diffMin <= 10 ? 'دقائق' : 'دقيقة'}`;
    }
    // If today
    if (diffHour < 24 && date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return `اليوم، ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      return `أمس، ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If this year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatReminderTime(reminderDateString: string): { label: string; isOverdue: boolean; isToday: boolean } {
  try {
    const target = new Date(reminderDateString);
    if (isNaN(target.getTime())) {
      return { label: '', isOverdue: false, isToday: false };
    }

    const now = new Date();
    const isOverdue = target.getTime() < now.getTime();

    const isToday =
      target.getDate() === now.getDate() &&
      target.getMonth() === now.getMonth() &&
      target.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      target.getDate() === tomorrow.getDate() &&
      target.getMonth() === tomorrow.getMonth() &&
      target.getFullYear() === tomorrow.getFullYear();

    const timeStr = target.toLocaleTimeString('ar-SA', { hour: 'numeric', minute: '2-digit' });

    let label = '';
    if (isToday) {
      label = `اليوم ${timeStr}`;
    } else if (isTomorrow) {
      label = `غداً ${timeStr}`;
    } else {
      label = `${target.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })} ${timeStr}`;
    }

    if (isOverdue) {
      label += ' (فات الموعد)';
    }

    return { label, isOverdue, isToday };
  } catch {
    return { label: reminderDateString, isOverdue: false, isToday: false };
  }
}

/**
 * Returns ISO string formatted for <input type="datetime-local" />
 */
export function toDateTimeLocalString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
