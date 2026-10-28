package com.example.modawen.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.modawen.data.NoteRepository
import com.example.modawen.model.FilterCategory
import com.example.modawen.model.Note
import com.example.modawen.model.NoteStats
import com.example.modawen.model.SortOption
import com.example.modawen.model.ViewMode
import com.example.modawen.utils.DateFormatter
import com.example.modawen.utils.SoundManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Date
import java.util.UUID

class ModawenViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NoteRepository(application)
    val soundManager = SoundManager(application)

    private val _notes = MutableStateFlow<List<Note>>(emptyList())
    val notes: StateFlow<List<Note>> = _notes.asStateFlow()

    private val _categories = MutableStateFlow<List<String>>(emptyList())
    val categories: StateFlow<List<String>> = _categories.asStateFlow()

    private val _isDarkTheme = MutableStateFlow(false)
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme.asStateFlow()

    private val _currentFilter = MutableStateFlow(FilterCategory.ALL)
    val currentFilter: StateFlow<FilterCategory> = _currentFilter.asStateFlow()

    private val _selectedCategory = MutableStateFlow("الكل")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _selectedTag = MutableStateFlow<String?>(null)
    val selectedTag: StateFlow<String?> = _selectedTag.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _viewMode = MutableStateFlow(ViewMode.GRID)
    val viewMode: StateFlow<ViewMode> = _viewMode.asStateFlow()

    private val _sortBy = MutableStateFlow(SortOption.UPDATED)
    val sortBy: StateFlow<SortOption> = _sortBy.asStateFlow()

    // Modals & Alert states
    private val _editingNote = MutableStateFlow<Note?>(null)
    val editingNote: StateFlow<Note?> = _editingNote.asStateFlow()

    private val _isEditorOpen = MutableStateFlow(false)
    val isEditorOpen: StateFlow<Boolean> = _isEditorOpen.asStateFlow()

    private val _reminderNote = MutableStateFlow<Note?>(null)
    val reminderNote: StateFlow<Note?> = _reminderNote.asStateFlow()

    private val _isReminderDialogOpen = MutableStateFlow(false)
    val isReminderDialogOpen: StateFlow<Boolean> = _isReminderDialogOpen.asStateFlow()

    private val _activeAlertNote = MutableStateFlow<Note?>(null)
    val activeAlertNote: StateFlow<Note?> = _activeAlertNote.asStateFlow()

    private val _snackbarMessage = MutableStateFlow<String?>(null)
    val snackbarMessage: StateFlow<String?> = _snackbarMessage.asStateFlow()

    init {
        _notes.value = repository.loadNotes()
        _categories.value = repository.loadCategories()
        _isDarkTheme.value = repository.isDarkTheme()

        // Real-time Reminder Evaluation Loop
        viewModelScope.launch {
            while (true) {
                delay(3500)
                checkReminders()
            }
        }
    }

    private fun checkReminders() {
        val now = System.currentTimeMillis()
        val currentNotes = _notes.value
        for (note in currentNotes) {
            if (!note.isTrash && !note.isArchived && note.reminderAt != null && !note.reminderNotified) {
                val remDate = DateFormatter.parseIso(note.reminderAt)
                if (remDate != null && remDate.time <= now) {
                    // Trigger alert!
                    soundManager.playReminderChime()
                    _activeAlertNote.value = note

                    // Mark as notified
                    _notes.value = _notes.value.map {
                        if (it.id == note.id) it.copy(reminderNotified = true) else it
                    }
                    repository.saveNotes(_notes.value)
                    break
                }
            }
        }
    }

    // Statistics
    val stats: StateFlow<NoteStats> = _notes.combine(_currentFilter) { notesList, _ ->
        val nonTrash = notesList.filter { !it.isTrash }
        val now = System.currentTimeMillis()
        NoteStats(
            total = nonTrash.count { !it.isArchived },
            remindersCount = nonTrash.count { n ->
                !n.isArchived && n.reminderAt != null && (DateFormatter.parseIso(n.reminderAt)?.time ?: 0) > now
            },
            pinnedCount = nonTrash.count { !it.isArchived && it.isPinned },
            favoritesCount = nonTrash.count { !it.isArchived && it.isFavorite },
            archivedCount = nonTrash.count { it.isArchived },
            trashCount = notesList.count { it.isTrash }
        )
    }.stateIn(viewModelScope, SharingStarted.Eagerly, NoteStats(0, 0, 0, 0, 0, 0))

    // Unique tags
    val allTags: StateFlow<List<String>> = _notes.combine(_currentFilter) { notesList, _ ->
        val set = mutableSetOf<String>()
        notesList.filter { !it.isTrash }.forEach { note ->
            note.tags.forEach { set.add(it) }
        }
        set.toList()
    }.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    private data class FilterState(
        val filter: FilterCategory,
        val category: String,
        val tag: String?,
        val query: String,
        val sort: SortOption
    )

    private val filterState = combine(
        _currentFilter,
        _selectedCategory,
        _selectedTag,
        _searchQuery,
        _sortBy
    ) { filter, category, tag, query, sort ->
        FilterState(filter, category, tag, query, sort)
    }

    // Filtered & Sorted Notes
    val displayNotes: StateFlow<List<Note>> = combine(
        _notes,
        filterState
    ) { notesList, state ->
        val filtered = notesList.filter { note ->
            if (state.filter == FilterCategory.TRASH) return@filter note.isTrash
            if (note.isTrash) return@filter false

            if (state.filter == FilterCategory.ARCHIVED) return@filter note.isArchived
            if (note.isArchived) return@filter false

            if (state.filter == FilterCategory.REMINDERS && note.reminderAt == null) return@filter false
            if (state.filter == FilterCategory.PINNED && !note.isPinned) return@filter false
            if (state.filter == FilterCategory.FAVORITES && !note.isFavorite) return@filter false

            if (state.filter == FilterCategory.ALL && state.category != "الكل") {
                if (note.category != state.category) return@filter false
            }

            if (state.tag != null && !note.tags.contains(state.tag)) {
                return@filter false
            }

            if (state.query.isNotBlank()) {
                val q = state.query.lowercase().trim()
                val titleMatch = note.title.lowercase().contains(q)
                val contentMatch = note.content.lowercase().contains(q)
                val tagMatch = note.tags.any { it.lowercase().contains(q) }
                val checkMatch = note.checklistItems.any { it.text.lowercase().contains(q) }
                return@filter (titleMatch || contentMatch || tagMatch || checkMatch)
            }

            true
        }

        // Sorting
        when (state.sort) {
            SortOption.UPDATED -> filtered.sortedByDescending { it.updatedAt }
            SortOption.CREATED -> filtered.sortedByDescending { it.createdAt }
            SortOption.TITLE -> filtered.sortedBy { it.title }
            SortOption.REMINDER -> filtered.sortedWith { a, b ->
                if (a.reminderAt == null && b.reminderAt == null) 0
                else if (a.reminderAt == null) 1
                else if (b.reminderAt == null) -1
                else a.reminderAt.compareTo(b.reminderAt)
            }
        }
    }.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    // Actions
    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setFilter(filter: FilterCategory) {
        _currentFilter.value = filter
    }

    fun setSelectedCategory(cat: String) {
        _selectedCategory.value = cat
    }

    fun setSelectedTag(tag: String?) {
        _selectedTag.value = tag
    }

    fun setViewMode(mode: ViewMode) {
        _viewMode.value = mode
    }

    fun toggleViewMode() {
        _viewMode.value = if (_viewMode.value == ViewMode.GRID) ViewMode.LIST else ViewMode.GRID
    }

    fun setSortBy(sort: SortOption) {
        _sortBy.value = sort
    }

    fun toggleTheme() {
        val next = !_isDarkTheme.value
        _isDarkTheme.value = next
        repository.setDarkTheme(next)
    }

    fun openNewNote() {
        _editingNote.value = null
        _isEditorOpen.value = true
    }

    fun editNote(note: Note) {
        _editingNote.value = note
        _isEditorOpen.value = true
    }

    fun closeEditor() {
        _isEditorOpen.value = false
        _editingNote.value = null
    }

    fun saveNote(savedNote: Note) {
        soundManager.playSaveSound()
        val current = _notes.value.toMutableList()
        val index = current.indexOfFirst { it.id == savedNote.id }
        if (index != -1) {
            current[index] = savedNote
        } else {
            current.add(0, savedNote)
        }
        _notes.value = current
        repository.saveNotes(current)

        if (savedNote.category.isNotBlank() && !_categories.value.contains(savedNote.category)) {
            val cats = _categories.value + savedNote.category
            _categories.value = cats
            repository.saveCategories(cats)
        }

        showSnackbar("تم حفظ الملاحظة بنجاح ✨")
    }

    fun togglePin(noteId: String) {
        soundManager.playSoftPop()
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(isPinned = !it.isPinned, updatedAt = DateFormatter.toIsoString(Date())) else it
        }
        repository.saveNotes(_notes.value)
    }

    fun toggleFavorite(noteId: String) {
        soundManager.playSoftPop()
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(isFavorite = !it.isFavorite, updatedAt = DateFormatter.toIsoString(Date())) else it
        }
        repository.saveNotes(_notes.value)
    }

    fun toggleArchive(noteId: String) {
        soundManager.playSoftPop()
        var isNowArchived = false
        _notes.value = _notes.value.map {
            if (it.id == noteId) {
                isNowArchived = !it.isArchived
                it.copy(isArchived = isNowArchived, updatedAt = DateFormatter.toIsoString(Date()))
            } else it
        }
        repository.saveNotes(_notes.value)
        showSnackbar(if (isNowArchived) "تمت أرشفة الملاحظة" else "تمت استعادة الملاحظة من الأرشيف")
    }

    fun moveToTrash(noteId: String) {
        soundManager.playSoftPop()
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(isTrash = true, updatedAt = DateFormatter.toIsoString(Date())) else it
        }
        repository.saveNotes(_notes.value)
        showSnackbar("تم نقل الملاحظة إلى سلة المهملات")
    }

    fun restoreFromTrash(noteId: String) {
        soundManager.playSoftPop()
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(isTrash = false, updatedAt = DateFormatter.toIsoString(Date())) else it
        }
        repository.saveNotes(_notes.value)
        showSnackbar("تمت استعادة الملاحظة بنجاح")
    }

    fun permanentDelete(noteId: String) {
        _notes.value = _notes.value.filter { it.id != noteId }
        repository.saveNotes(_notes.value)
        showSnackbar("تم حذف الملاحظة نهائياً")
    }

    fun emptyTrash() {
        _notes.value = _notes.value.filter { !it.isTrash }
        repository.saveNotes(_notes.value)
        showSnackbar("تم تفريغ سلة المحذوفات بالكامل")
    }

    fun duplicateNote(note: Note) {
        soundManager.playSoftPop()
        val nowIso = DateFormatter.toIsoString(Date())
        val dup = note.copy(
            id = "note-${UUID.randomUUID()}",
            title = "${note.title} (نسخة)",
            createdAt = nowIso,
            updatedAt = nowIso,
            isPinned = false
        )
        _notes.value = listOf(dup) + _notes.value
        repository.saveNotes(_notes.value)
        showSnackbar("تم تكرار الملاحظة بنجاح")
    }

    fun toggleCheckItem(noteId: String, itemId: String) {
        soundManager.playSoftPop()
        _notes.value = _notes.value.map { note ->
            if (note.id == noteId) {
                val updatedItems = note.checklistItems.map { item ->
                    if (item.id == itemId) item.copy(completed = !item.completed) else item
                }
                note.copy(checklistItems = updatedItems, updatedAt = DateFormatter.toIsoString(Date()))
            } else note
        }
        repository.saveNotes(_notes.value)
    }

    fun openReminderDialog(note: Note) {
        _reminderNote.value = note
        _isReminderDialogOpen.value = true
    }

    fun closeReminderDialog() {
        _isReminderDialogOpen.value = false
        _reminderNote.value = null
    }

    fun saveReminder(noteId: String, reminderAt: String?) {
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(reminderAt = reminderAt, reminderNotified = false, updatedAt = DateFormatter.toIsoString(Date())) else it
        }
        repository.saveNotes(_notes.value)
        showSnackbar(if (reminderAt != null) "تم ضبط موعد التذكير بنجاح 🔔" else "تم إلغاء التذكير")
    }

    fun snoozeReminder(noteId: String, minutes: Int) {
        val newTarget = Date(System.currentTimeMillis() + minutes * 60 * 1000)
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(reminderAt = DateFormatter.toIsoString(newTarget), reminderNotified = false) else it
        }
        repository.saveNotes(_notes.value)
        _activeAlertNote.value = null
        showSnackbar("تم تأجيل التذكير لمدة $minutes دقيقة")
    }

    fun dismissReminder(noteId: String) {
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(reminderAt = null, reminderNotified = true) else it
        }
        repository.saveNotes(_notes.value)
        _activeAlertNote.value = null
        showSnackbar("تم إنجاز التذكير")
    }

    fun addCategory(newCategory: String) {
        if (!_categories.value.contains(newCategory)) {
            val list = _categories.value + newCategory
            _categories.value = list
            repository.saveCategories(list)
        }
    }

    fun importBackup(jsonString: String): Boolean {
        return try {
            val imported = repository.parseNotesJson(jsonString)
            if (imported.isNotEmpty()) {
                _notes.value = imported
                repository.saveNotes(imported)
                showSnackbar("تم استيراد ${imported.size} ملاحظة بنجاح 🎉")
                true
            } else false
        } catch (_: Exception) {
            showSnackbar("الملف غير متوافق")
            false
        }
    }

    fun exportBackupJson(): String {
        return repository.serializeNotesToJson(_notes.value)
    }

    fun formatNoteForSharing(note: Note): String {
        return repository.formatNoteForSharing(note)
    }

    fun showSnackbar(message: String) {
        _snackbarMessage.value = message
    }

    fun clearSnackbar() {
        _snackbarMessage.value = null
    }
}
