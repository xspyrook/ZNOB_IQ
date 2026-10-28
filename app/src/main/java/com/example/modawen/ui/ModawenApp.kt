package com.example.modawen.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.DrawerValue
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.modawen.model.FilterCategory
import com.example.modawen.model.Note
import com.example.modawen.model.SortOption
import com.example.modawen.model.ViewMode
import com.example.modawen.ui.components.HeaderBar
import com.example.modawen.ui.components.NoteCardItem
import com.example.modawen.ui.components.NoteEditorSheet
import com.example.modawen.ui.components.ReminderBanner
import com.example.modawen.ui.components.ReminderDialog
import com.example.modawen.ui.components.SidebarDrawer
import com.example.modawen.ui.theme.AccentAmber
import com.example.modawen.ui.theme.PrimaryIndigo
import kotlinx.coroutines.launch

@Composable
fun ModawenApp(
    viewModel: ModawenViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val snackbarHostState = remember { SnackbarHostState() }

    val notes by viewModel.displayNotes.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val isDarkTheme by viewModel.isDarkTheme.collectAsState()
    val currentFilter by viewModel.currentFilter.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val selectedTag by viewModel.selectedTag.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val viewMode by viewModel.viewMode.collectAsState()
    val sortBy by viewModel.sortBy.collectAsState()
    val stats by viewModel.stats.collectAsState()
    val allTags by viewModel.allTags.collectAsState()

    val editingNote by viewModel.editingNote.collectAsState()
    val isEditorOpen by viewModel.isEditorOpen.collectAsState()
    val reminderNote by viewModel.reminderNote.collectAsState()
    val isReminderDialogOpen by viewModel.isReminderDialogOpen.collectAsState()
    val activeAlertNote by viewModel.activeAlertNote.collectAsState()
    val snackbarMsg by viewModel.snackbarMessage.collectAsState()

    var showEmptyTrashDialog by remember { mutableStateOf(false) }
    var sortMenuExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(snackbarMsg) {
        snackbarMsg?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearSnackbar()
        }
    }

    // Force RTL layout direction for Arabic
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                SidebarDrawer(
                    currentFilter = currentFilter,
                    onFilterSelect = { viewModel.setFilter(it) },
                    categories = categories,
                    selectedCategory = selectedCategory,
                    onCategorySelect = { viewModel.setSelectedCategory(it) },
                    onAddCategory = { viewModel.addCategory(it) },
                    allTags = allTags,
                    selectedTag = selectedTag,
                    onTagSelect = { viewModel.setSelectedTag(it) },
                    stats = stats,
                    onExportBackup = {
                        val json = viewModel.exportBackupJson()
                        val sendIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, json)
                            type = "application/json"
                        }
                        context.startActivity(Intent.createChooser(sendIntent, "تصدير نسخة احتياطية من الملاحظات"))
                    },
                    onImportBackupClick = {
                        viewModel.showSnackbar("يمكنك استيراد الملاحظات من خلال إعدادات النسخ الاحتياطي")
                    },
                    onEmptyTrash = { showEmptyTrashDialog = true },
                    onCloseDrawer = { scope.launch { drawerState.close() } }
                )
            }
        ) {
            Scaffold(
                topBar = {
                    HeaderBar(
                        searchQuery = searchQuery,
                        onSearchChange = { viewModel.setSearchQuery(it) },
                        viewMode = viewMode,
                        onViewModeToggle = { viewModel.toggleViewMode() },
                        isDarkTheme = isDarkTheme,
                        onThemeToggle = { viewModel.toggleTheme() },
                        remindersCount = stats.remindersCount,
                        onRemindersClick = { viewModel.setFilter(FilterCategory.REMINDERS) },
                        onMenuClick = { scope.launch { drawerState.open() } }
                    )
                },
                floatingActionButton = {
                    ExtendedFloatingActionButton(
                        onClick = { viewModel.openNewNote() },
                        containerColor = PrimaryIndigo,
                        contentColor = androidx.compose.ui.graphics.Color.White,
                        icon = { Icon(Icons.Default.Add, contentDescription = null) },
                        text = { Text("ملاحظة جديدة", fontWeight = FontWeight.Bold) },
                        modifier = Modifier.testTag("new_note_fab")
                    )
                },
                snackbarHost = { SnackbarHost(snackbarHostState) },
                modifier = modifier.fillMaxSize()
            ) { innerPadding ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    // Alert banner if reminder triggered
                    ReminderBanner(
                        activeAlertNote = activeAlertNote,
                        onOpenNote = {
                            viewModel.editNote(it)
                            viewModel.dismissReminder(it.id)
                        },
                        onSnooze = { id, mins -> viewModel.snoozeReminder(id, mins) },
                        onDismiss = { id -> viewModel.dismissReminder(id) }
                    )

                    // Sub-bar: Title & Filter Label & Sort Selector
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Column {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                val title = when (currentFilter) {
                                    FilterCategory.ALL -> if (selectedCategory == "الكل") "جميع الملاحظات" else "تصنيف: $selectedCategory"
                                    FilterCategory.REMINDERS -> "التذكيرات القادمة 🔔"
                                    FilterCategory.PINNED -> "الملاحظات المثبتة 📌"
                                    FilterCategory.FAVORITES -> "الملاحظات المفضلة ⭐"
                                    FilterCategory.ARCHIVED -> "الأرشيف 📁"
                                    FilterCategory.TRASH -> "سلة المحذوفات 🗑️"
                                }
                                Text(
                                    text = title,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "(${notes.size})",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            if (selectedTag != null) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                                    modifier = Modifier.padding(top = 2.dp)
                                ) {
                                    Text(
                                        text = "تصفية بالوسم: #$selectedTag",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = PrimaryIndigo
                                    )
                                    Text(
                                        text = "(إلغاء التصفية)",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.clickable { viewModel.setSelectedTag(null) }
                                    )
                                }
                            }
                        }

                        // Sort dropdown
                        Box {
                            Surface(
                                onClick = { sortMenuExpanded = true },
                                shape = RoundedCornerShape(8.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Sort,
                                        contentDescription = "ترتيب",
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = sortBy.label,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Icon(
                                        imageVector = Icons.Default.ArrowDropDown,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = sortMenuExpanded,
                                onDismissRequest = { sortMenuExpanded = false }
                            ) {
                                SortOption.entries.forEach { option ->
                                    DropdownMenuItem(
                                        text = { Text(option.label) },
                                        onClick = {
                                            viewModel.setSortBy(option)
                                            sortMenuExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    // Quick Create Bar (when in 'all' view and not searching)
                    if (currentFilter == FilterCategory.ALL && searchQuery.isBlank() && selectedTag == null) {
                        Surface(
                            onClick = { viewModel.openNewNote() },
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surface,
                            tonalElevation = 1.dp,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Box(
                                        contentAlignment = Alignment.Center,
                                        modifier = Modifier
                                            .size(28.dp)
                                            .background(PrimaryIndigo.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
                                    ) {
                                        Icon(Icons.Default.Add, contentDescription = null, tint = PrimaryIndigo, modifier = Modifier.size(18.dp))
                                    }
                                    Text(
                                        text = "اكتب ملاحظة جديدة أو قائمة مهام...",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = PrimaryIndigo.copy(alpha = 0.1f)
                                ) {
                                    Text(
                                        text = "+ إنشاء",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = PrimaryIndigo,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }

                    // Content Area: Empty State or Notes List/Grid
                    if (notes.isEmpty()) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(32.dp)
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Box(
                                    contentAlignment = Alignment.Center,
                                    modifier = Modifier
                                        .size(64.dp)
                                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                                ) {
                                    Icon(
                                        imageVector = if (currentFilter == FilterCategory.REMINDERS) Icons.Default.Notifications else Icons.Default.Description,
                                        contentDescription = null,
                                        tint = if (currentFilter == FilterCategory.REMINDERS) AccentAmber else MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(32.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(14.dp))
                                Text(
                                    text = if (searchQuery.isNotBlank()) "لا توجد نتائج مطابقة لبحثك" else "لا توجد ملاحظات هنا حتى الآن",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = if (searchQuery.isNotBlank()) "جرب البحث بكلمات أخرى أو مسح شريط البحث"
                                    else if (currentFilter == FilterCategory.REMINDERS) "لم تقم بجدولة أي تذكيرات بعد، يمكنك إضافة تذكير لأي ملاحظة بسهولة"
                                    else "ابدأ بتسجيل أفكارك، مهامك، وملاحظاتك اليومية بنقرة واحدة",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textAlign = TextAlign.Center
                                )
                                if (searchQuery.isBlank() && currentFilter != FilterCategory.TRASH) {
                                    Spacer(modifier = Modifier.height(14.dp))
                                    OutlinedButton(
                                        onClick = { viewModel.openNewNote() },
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("إضافة أول ملاحظة")
                                    }
                                }
                            }
                        }
                    } else {
                        // Separate Pinned and Regular notes if in ALL view and not searching
                        val pinnedList = if (currentFilter == FilterCategory.ALL && searchQuery.isBlank() && selectedTag == null) {
                            notes.filter { it.isPinned }
                        } else emptyList()

                        val regularList = if (currentFilter == FilterCategory.ALL && searchQuery.isBlank() && selectedTag == null) {
                            notes.filter { !it.isPinned }
                        } else notes

                        if (viewMode == ViewMode.GRID) {
                            LazyVerticalGrid(
                                columns = GridCells.Adaptive(minSize = 280.dp),
                                contentPadding = PaddingValues(16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp),
                                modifier = Modifier.fillMaxSize()
                            ) {
                                if (pinnedList.isNotEmpty()) {
                                    item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(maxLineSpan) }) {
                                        Text(
                                            text = "الملاحظات المثبتة",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = PrimaryIndigo,
                                            modifier = Modifier.padding(bottom = 4.dp)
                                        )
                                    }
                                    items(pinnedList, key = { it.id }) { note ->
                                        NoteCardItem(
                                            note = note,
                                            onClick = { viewModel.editNote(note) },
                                            onTogglePin = { viewModel.togglePin(note.id) },
                                            onToggleFavorite = { viewModel.toggleFavorite(note.id) },
                                            onToggleCheckItem = { itemId -> viewModel.toggleCheckItem(note.id, itemId) },
                                            onCopy = {
                                                copyNoteToClipboard(context, viewModel.formatNoteForSharing(note))
                                                viewModel.showSnackbar("تم نسخ الملاحظة إلى الحافظة 📋")
                                            },
                                            onSetReminder = { viewModel.openReminderDialog(note) },
                                            onDuplicate = { viewModel.duplicateNote(note) },
                                            onShare = { shareNote(context, viewModel.formatNoteForSharing(note), note.title) },
                                            onToggleArchive = { viewModel.toggleArchive(note.id) },
                                            onMoveToTrash = { viewModel.moveToTrash(note.id) },
                                            onRestoreFromTrash = { viewModel.restoreFromTrash(note.id) },
                                            onPermanentDelete = { viewModel.permanentDelete(note.id) },
                                            isDarkTheme = isDarkTheme
                                        )
                                    }
                                    item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(maxLineSpan) }) {
                                        Text(
                                            text = "الملاحظات الأخرى",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                                        )
                                    }
                                }

                                items(regularList, key = { it.id }) { note ->
                                    NoteCardItem(
                                        note = note,
                                        onClick = { viewModel.editNote(note) },
                                        onTogglePin = { viewModel.togglePin(note.id) },
                                        onToggleFavorite = { viewModel.toggleFavorite(note.id) },
                                        onToggleCheckItem = { itemId -> viewModel.toggleCheckItem(note.id, itemId) },
                                        onCopy = {
                                            copyNoteToClipboard(context, viewModel.formatNoteForSharing(note))
                                            viewModel.showSnackbar("تم نسخ الملاحظة إلى الحافظة 📋")
                                        },
                                        onSetReminder = { viewModel.openReminderDialog(note) },
                                        onDuplicate = { viewModel.duplicateNote(note) },
                                        onShare = { shareNote(context, viewModel.formatNoteForSharing(note), note.title) },
                                        onToggleArchive = { viewModel.toggleArchive(note.id) },
                                        onMoveToTrash = { viewModel.moveToTrash(note.id) },
                                        onRestoreFromTrash = { viewModel.restoreFromTrash(note.id) },
                                        onPermanentDelete = { viewModel.permanentDelete(note.id) },
                                        isDarkTheme = isDarkTheme
                                    )
                                }
                            }
                        } else {
                            // List View
                            LazyColumn(
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp),
                                modifier = Modifier.fillMaxSize()
                            ) {
                                if (pinnedList.isNotEmpty()) {
                                    item {
                                        Text(
                                            text = "الملاحظات المثبتة",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = PrimaryIndigo,
                                            modifier = Modifier.padding(bottom = 4.dp)
                                        )
                                    }
                                    items(pinnedList, key = { it.id }) { note ->
                                        NoteCardItem(
                                            note = note,
                                            onClick = { viewModel.editNote(note) },
                                            onTogglePin = { viewModel.togglePin(note.id) },
                                            onToggleFavorite = { viewModel.toggleFavorite(note.id) },
                                            onToggleCheckItem = { itemId -> viewModel.toggleCheckItem(note.id, itemId) },
                                            onCopy = {
                                                copyNoteToClipboard(context, viewModel.formatNoteForSharing(note))
                                                viewModel.showSnackbar("تم نسخ الملاحظة إلى الحافظة 📋")
                                            },
                                            onSetReminder = { viewModel.openReminderDialog(note) },
                                            onDuplicate = { viewModel.duplicateNote(note) },
                                            onShare = { shareNote(context, viewModel.formatNoteForSharing(note), note.title) },
                                            onToggleArchive = { viewModel.toggleArchive(note.id) },
                                            onMoveToTrash = { viewModel.moveToTrash(note.id) },
                                            onRestoreFromTrash = { viewModel.restoreFromTrash(note.id) },
                                            onPermanentDelete = { viewModel.permanentDelete(note.id) },
                                            isDarkTheme = isDarkTheme
                                        )
                                    }
                                    item {
                                        Text(
                                            text = "الملاحظات الأخرى",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                                        )
                                    }
                                }

                                items(regularList, key = { it.id }) { note ->
                                    NoteCardItem(
                                        note = note,
                                        onClick = { viewModel.editNote(note) },
                                        onTogglePin = { viewModel.togglePin(note.id) },
                                        onToggleFavorite = { viewModel.toggleFavorite(note.id) },
                                        onToggleCheckItem = { itemId -> viewModel.toggleCheckItem(note.id, itemId) },
                                        onCopy = {
                                            copyNoteToClipboard(context, viewModel.formatNoteForSharing(note))
                                            viewModel.showSnackbar("تم نسخ الملاحظة إلى الحافظة 📋")
                                        },
                                        onSetReminder = { viewModel.openReminderDialog(note) },
                                        onDuplicate = { viewModel.duplicateNote(note) },
                                        onShare = { shareNote(context, viewModel.formatNoteForSharing(note), note.title) },
                                        onToggleArchive = { viewModel.toggleArchive(note.id) },
                                        onMoveToTrash = { viewModel.moveToTrash(note.id) },
                                        onRestoreFromTrash = { viewModel.restoreFromTrash(note.id) },
                                        onPermanentDelete = { viewModel.permanentDelete(note.id) },
                                        isDarkTheme = isDarkTheme
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Note Editor Sheet
            NoteEditorSheet(
                note = editingNote,
                isOpen = isEditorOpen,
                categories = categories,
                onClose = { viewModel.closeEditor() },
                onSave = { viewModel.saveNote(it) },
                onCopy = {
                    copyNoteToClipboard(context, viewModel.formatNoteForSharing(it))
                    viewModel.showSnackbar("تم نسخ الملاحظة 📋")
                },
                onShare = { shareNote(context, viewModel.formatNoteForSharing(it), it.title) },
                onOpenReminderModal = { viewModel.openReminderDialog(it) },
                isDarkTheme = isDarkTheme
            )

            // Reminder Dialog
            ReminderDialog(
                note = reminderNote,
                isOpen = isReminderDialogOpen,
                onDismiss = { viewModel.closeReminderDialog() },
                onSaveReminder = { id, time -> viewModel.saveReminder(id, time) },
                onPlayChimePreview = { viewModel.soundManager.playReminderChime() }
            )

            // Confirm Empty Trash Dialog
            if (showEmptyTrashDialog) {
                AlertDialog(
                    onDismissRequest = { showEmptyTrashDialog = false },
                    title = { Text("تفريغ سلة المحذوفات") },
                    text = { Text("هل أنت متأكد من تفريغ سلة المحذوفات بالكامل؟ لا يمكن التراجع عن هذا الإجراء.") },
                    confirmButton = {
                        TextButton(
                            onClick = {
                                viewModel.emptyTrash()
                                showEmptyTrashDialog = false
                            }
                        ) {
                            Text("تفريغ نهائي", color = androidx.compose.ui.graphics.Color(0xFFF43F5E))
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showEmptyTrashDialog = false }) {
                            Text("إلغاء")
                        }
                    }
                )
            }
        }
    }
}

private fun copyNoteToClipboard(context: Context, text: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
    val clip = ClipData.newPlainText("ملاحظة مُدَوِّن", text)
    clipboard?.setPrimaryClip(clip)
}

private fun shareNote(context: Context, content: String, title: String) {
    val sendIntent = Intent().apply {
        action = Intent.ACTION_SEND
        putExtra(Intent.EXTRA_SUBJECT, title)
        putExtra(Intent.EXTRA_TEXT, content)
        type = "text/plain"
    }
    context.startActivity(Intent.createChooser(sendIntent, "مشاركة الملاحظة"))
}
