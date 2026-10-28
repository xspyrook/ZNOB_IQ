package com.example.modawen.model

data class ChecklistItem(
    val id: String,
    val text: String,
    val completed: Boolean
)

enum class NoteColor(val idName: String, val label: String) {
    DEFAULT("default", "كلاسيكي"),
    AMBER("amber", "عنبري"),
    EMERALD("emerald", "زمردي"),
    SKY("sky", "سماوي"),
    INDIGO("indigo", "بنفسجي"),
    ROSE("rose", "وردي"),
    SLATE("slate", "رمادي");

    companion object {
        fun fromId(id: String): NoteColor {
            return entries.find { it.idName.equals(id, ignoreCase = true) } ?: DEFAULT
        }
    }
}

enum class NotePriority(val label: String) {
    LOW("عادي"),
    MEDIUM("متوسط"),
    HIGH("عاجل ومهم");

    companion object {
        fun fromString(str: String): NotePriority {
            return when (str.lowercase()) {
                "high" -> HIGH
                "low" -> LOW
                else -> MEDIUM
            }
        }
    }
}

data class Note(
    val id: String,
    val title: String,
    val content: String,
    val category: String,
    val tags: List<String> = emptyList(),
    val color: NoteColor = NoteColor.DEFAULT,
    val priority: NotePriority = NotePriority.MEDIUM,
    val isPinned: Boolean = false,
    val isFavorite: Boolean = false,
    val isArchived: Boolean = false,
    val isTrash: Boolean = false,
    val isChecklist: Boolean = false,
    val checklistItems: List<ChecklistItem> = emptyList(),
    val reminderAt: String? = null, // ISO-8601 string
    val reminderNotified: Boolean = false,
    val createdAt: String,
    val updatedAt: String
)

enum class ViewMode {
    GRID, LIST
}

enum class FilterCategory(val label: String) {
    ALL("جميع الملاحظات"),
    REMINDERS("التذكيرات القادمة"),
    PINNED("المثبتة"),
    FAVORITES("المفضلة"),
    ARCHIVED("المؤرشفة"),
    TRASH("سلة المحذوفات")
}

enum class SortOption(val label: String) {
    UPDATED("الأحدث تعديلاً"),
    CREATED("الأحدث إنشاءً"),
    TITLE("أبجدياً (أ-ي)"),
    REMINDER("موعد التذكير")
}

data class NoteStats(
    val total: Int,
    val remindersCount: Int,
    val pinnedCount: Int,
    val favoritesCount: Int,
    val archivedCount: Int,
    val trashCount: Int
)
