package com.example.modawen.data

import android.content.Context
import com.example.modawen.model.ChecklistItem
import com.example.modawen.model.Note
import com.example.modawen.model.NoteColor
import com.example.modawen.model.NotePriority
import org.json.JSONArray
import org.json.JSONObject

class NoteRepository(context: Context) {
    private val prefs = context.getSharedPreferences("modawen_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_NOTES = "modawen_notes_v1"
        private const val KEY_CATEGORIES = "modawen_categories_v1"
        private const val KEY_THEME = "modawen_theme_mode"
    }

    fun loadNotes(): List<Note> {
        val raw = prefs.getString(KEY_NOTES, null) ?: return InitialNotes.getInitialNotes()
        return try {
            val list = parseNotesJson(raw)
            if (list.isEmpty()) InitialNotes.getInitialNotes() else list
        } catch (_: Exception) {
            InitialNotes.getInitialNotes()
        }
    }

    fun saveNotes(notes: List<Note>) {
        try {
            val json = serializeNotesToJson(notes)
            prefs.edit().putString(KEY_NOTES, json).apply()
        } catch (_: Exception) {}
    }

    fun loadCategories(): List<String> {
        val raw = prefs.getString(KEY_CATEGORIES, null)
        if (raw != null) {
            try {
                val array = JSONArray(raw)
                val list = mutableListOf<String>()
                for (i in 0 until array.length()) {
                    list.add(array.getString(i))
                }
                if (list.isNotEmpty()) return list
            } catch (_: Exception) {}
        }
        return InitialNotes.DEFAULT_CATEGORIES
    }

    fun saveCategories(categories: List<String>) {
        val array = JSONArray()
        categories.forEach { array.put(it) }
        prefs.edit().putString(KEY_CATEGORIES, array.toString()).apply()
    }

    fun isDarkTheme(): Boolean {
        return prefs.getBoolean(KEY_THEME, false)
    }

    fun setDarkTheme(isDark: Boolean) {
        prefs.edit().putBoolean(KEY_THEME, isDark).apply()
    }

    fun serializeNotesToJson(notes: List<Note>): String {
        val array = JSONArray()
        notes.forEach { note ->
            val obj = JSONObject()
            obj.put("id", note.id)
            obj.put("title", note.title)
            obj.put("content", note.content)
            obj.put("category", note.category)

            val tagsArray = JSONArray()
            note.tags.forEach { tagsArray.put(it) }
            obj.put("tags", tagsArray)

            obj.put("color", note.color.idName)
            obj.put("priority", note.priority.name.lowercase())
            obj.put("isPinned", note.isPinned)
            obj.put("isFavorite", note.isFavorite)
            obj.put("isArchived", note.isArchived)
            obj.put("isTrash", note.isTrash)
            obj.put("isChecklist", note.isChecklist)

            val itemsArray = JSONArray()
            note.checklistItems.forEach { item ->
                val itemObj = JSONObject()
                itemObj.put("id", item.id)
                itemObj.put("text", item.text)
                itemObj.put("completed", item.completed)
                itemsArray.put(itemObj)
            }
            obj.put("checklistItems", itemsArray)

            if (note.reminderAt != null) {
                obj.put("reminderAt", note.reminderAt)
            }
            obj.put("reminderNotified", note.reminderNotified)
            obj.put("createdAt", note.createdAt)
            obj.put("updatedAt", note.updatedAt)

            array.put(obj)
        }
        return array.toString(2)
    }

    fun parseNotesJson(jsonString: String): List<Note> {
        val array = JSONArray(jsonString)
        val list = mutableListOf<Note>()
        for (i in 0 until array.length()) {
            val obj = array.getJSONObject(i)
            val tags = mutableListOf<String>()
            val tagsArray = obj.optJSONArray("tags")
            if (tagsArray != null) {
                for (j in 0 until tagsArray.length()) {
                    tags.add(tagsArray.getString(j))
                }
            }

            val checklistItems = mutableListOf<ChecklistItem>()
            val itemsArray = obj.optJSONArray("checklistItems")
            if (itemsArray != null) {
                for (k in 0 until itemsArray.length()) {
                    val itemObj = itemsArray.getJSONObject(k)
                    checklistItems.add(
                        ChecklistItem(
                            id = itemObj.optString("id", "chk-$k"),
                            text = itemObj.optString("text", ""),
                            completed = itemObj.optBoolean("completed", false)
                        )
                    )
                }
            }

            val note = Note(
                id = obj.getString("id"),
                title = obj.optString("title", ""),
                content = obj.optString("content", ""),
                category = obj.optString("category", "شخصي"),
                tags = tags,
                color = NoteColor.fromId(obj.optString("color", "default")),
                priority = NotePriority.fromString(obj.optString("priority", "medium")),
                isPinned = obj.optBoolean("isPinned", false),
                isFavorite = obj.optBoolean("isFavorite", false),
                isArchived = obj.optBoolean("isArchived", false),
                isTrash = obj.optBoolean("isTrash", false),
                isChecklist = obj.optBoolean("isChecklist", false),
                checklistItems = checklistItems,
                reminderAt = if (obj.has("reminderAt") && !obj.isNull("reminderAt")) obj.getString("reminderAt") else null,
                reminderNotified = obj.optBoolean("reminderNotified", false),
                createdAt = obj.optString("createdAt", ""),
                updatedAt = obj.optString("updatedAt", "")
            )
            list.add(note)
        }
        return list
    }

    fun formatNoteForSharing(note: Note): String {
        val sb = StringBuilder()
        if (note.title.isNotBlank()) {
            sb.append(note.title).append("\n\n")
        }
        if (note.isChecklist && note.checklistItems.isNotEmpty()) {
            note.checklistItems.forEach {
                sb.append(if (it.completed) "☑ " else "☐ ").append(it.text).append("\n")
            }
        } else if (note.content.isNotBlank()) {
            sb.append(note.content).append("\n")
        }

        val meta = mutableListOf<String>()
        if (note.category.isNotBlank()) meta.add("التصنيف: ${note.category}")
        if (note.tags.isNotEmpty()) meta.add("الوسوم: ${note.tags.joinToString(" ") { "#$it" }}")
        if (note.reminderAt != null) meta.add("التذكير: ${DateFormatter.formatArabicDate(note.reminderAt)}")

        if (meta.isNotEmpty()) {
            sb.append("\n---\n").append(meta.joinToString(" · "))
        }

        return sb.toString().trim()
    }
}
