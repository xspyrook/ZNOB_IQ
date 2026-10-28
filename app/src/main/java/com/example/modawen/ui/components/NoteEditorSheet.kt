package com.example.modawen.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Checklist
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PushPin
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.PushPin
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.modawen.model.ChecklistItem
import com.example.modawen.model.Note
import com.example.modawen.model.NoteColor
import com.example.modawen.model.NotePriority
import com.example.modawen.ui.theme.AccentAmber
import com.example.modawen.ui.theme.AccentEmerald
import com.example.modawen.ui.theme.AccentRose
import com.example.modawen.ui.theme.PrimaryIndigo
import com.example.modawen.ui.theme.getNoteCardColors
import com.example.modawen.utils.DateFormatter
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun NoteEditorSheet(
    note: Note?,
    isOpen: Boolean,
    categories: List<String>,
    onClose: () -> Unit,
    onSave: (Note) -> Unit,
    onCopy: (Note) -> Unit,
    onShare: (Note) -> Unit,
    onOpenReminderModal: (Note) -> Unit,
    isDarkTheme: Boolean = isSystemInDarkTheme()
) {
    if (!isOpen) return

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var title by remember { mutableStateOf(note?.title ?: "") }
    var content by remember { mutableStateOf(note?.content ?: "") }
    var category by remember { mutableStateOf(note?.category ?: "شخصي") }
    var color by remember { mutableStateOf(note?.color ?: NoteColor.DEFAULT) }
    var priority by remember { mutableStateOf(note?.priority ?: NotePriority.MEDIUM) }
    var isPinned by remember { mutableStateOf(note?.isPinned ?: false) }
    var isFavorite by remember { mutableStateOf(note?.isFavorite ?: false) }
    var isChecklist by remember { mutableStateOf(note?.isChecklist ?: false) }
    val checklistItems = remember { mutableStateListOf<ChecklistItem>().apply {
        note?.checklistItems?.let { addAll(it) }
    } }
    var newChecklistText by remember { mutableStateOf("") }
    val tags = remember { mutableStateListOf<String>().apply {
        note?.tags?.let { addAll(it) }
    } }
    var tagInput by remember { mutableStateOf("") }

    var categoryDropdownOpen by remember { mutableStateOf(false) }
    var isCreatingCategory by remember { mutableStateOf(false) }
    var newCategoryInput by remember { mutableStateOf("") }

    var priorityDropdownOpen by remember { mutableStateOf(false) }

    val noteColors = getNoteCardColors(color, isDarkTheme)

    val buildCurrentNote = {
        val nowIso = DateFormatter.toIsoString(java.util.Date())
        Note(
            id = note?.id ?: "note-${UUID.randomUUID()}",
            title = title.trim(),
            content = content.trim(),
            category = category,
            tags = tags.toList(),
            color = color,
            priority = priority,
            isPinned = isPinned,
            isFavorite = isFavorite,
            isArchived = note?.isArchived ?: false,
            isTrash = note?.isTrash ?: false,
            isChecklist = isChecklist,
            checklistItems = checklistItems.toList(),
            reminderAt = note?.reminderAt,
            reminderNotified = note?.reminderNotified ?: false,
            createdAt = note?.createdAt ?: nowIso,
            updatedAt = nowIso
        )
    }

    ModalBottomSheet(
        onDismissRequest = {
            if (title.isNotBlank() || content.isNotBlank() || checklistItems.isNotEmpty()) {
                onSave(buildCurrentNote())
            }
            onClose()
        },
        sheetState = sheetState,
        containerColor = noteColors.bg,
        modifier = Modifier
            .fillMaxHeight(0.95f)
            .testTag("note_editor_sheet")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
        ) {
            // Top Bar: Pin, Star, Copy, Share, Close
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // Pin toggle
                    IconButton(onClick = { isPinned = !isPinned }) {
                        Icon(
                            imageVector = if (isPinned) Icons.Default.PushPin else Icons.Outlined.PushPin,
                            contentDescription = "تثبيت في الأعلى",
                            tint = if (isPinned) PrimaryIndigo else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.rotate(if (isPinned) 45f else 0f)
                        )
                    }

                    // Favorite toggle
                    IconButton(onClick = { isFavorite = !isFavorite }) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Default.Star else Icons.Outlined.StarOutline,
                            contentDescription = "إضافة للمفضلة",
                            tint = if (isFavorite) AccentAmber else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.padding(start = 6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = AccentEmerald,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "جاهز للحفظ",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                            fontSize = 11.sp
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // Copy
                    IconButton(onClick = { onCopy(buildCurrentNote()) }) {
                        Icon(
                            imageVector = Icons.Default.ContentCopy,
                            contentDescription = "نسخ",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Share
                    IconButton(onClick = { onShare(buildCurrentNote()) }) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "مشاركة",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Close
                    IconButton(
                        onClick = {
                            if (title.isNotBlank() || content.isNotBlank() || checklistItems.isNotEmpty()) {
                                onSave(buildCurrentNote())
                            }
                            onClose()
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "إغلاق",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            HorizontalDivider(color = noteColors.border)

            // Scrollable Editor Body
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Title Field
                TextField(
                    value = title,
                    onValueChange = { title = it },
                    placeholder = {
                        Text(
                            text = "عنوان الملاحظة...",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                    },
                    textStyle = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    singleLine = true,
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("note_title_input")
                )

                // Mode Switcher (Text Note vs Checklist)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Surface(
                        onClick = { isChecklist = false },
                        shape = RoundedCornerShape(8.dp),
                        color = if (!isChecklist) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.padding(vertical = 8.dp)
                        ) {
                            Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("ملاحظة نصية", fontSize = 12.sp, fontWeight = if (!isChecklist) FontWeight.Bold else FontWeight.Normal)
                        }
                    }

                    Surface(
                        onClick = { isChecklist = true },
                        shape = RoundedCornerShape(8.dp),
                        color = if (isChecklist) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.padding(vertical = 8.dp)
                        ) {
                            Icon(Icons.Default.Checklist, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("قائمة مهام (Checklist)", fontSize = 12.sp, fontWeight = if (isChecklist) FontWeight.Bold else FontWeight.Normal)
                        }
                    }
                }

                // Content: Text or Checklist
                if (!isChecklist) {
                    TextField(
                        value = content,
                        onValueChange = { content = it },
                        placeholder = {
                            Text(
                                text = "اكتب ملاحظتك هنا بحرية...",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                            )
                        },
                        textStyle = MaterialTheme.typography.bodyLarge,
                        minLines = 8,
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("note_content_input")
                    )
                } else {
                    // Checklist Items
                    Column(
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        checklistItems.forEachIndexed { index, item ->
                            Card(
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.6f)),
                                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Checkbox(
                                        checked = item.completed,
                                        onCheckedChange = { checked ->
                                            checklistItems[index] = item.copy(completed = checked)
                                        },
                                        colors = CheckboxDefaults.colors(checkedColor = PrimaryIndigo),
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    TextField(
                                        value = item.text,
                                        onValueChange = { newText ->
                                            checklistItems[index] = item.copy(text = newText)
                                        },
                                        colors = TextFieldDefaults.colors(
                                            focusedContainerColor = Color.Transparent,
                                            unfocusedContainerColor = Color.Transparent,
                                            focusedIndicatorColor = Color.Transparent,
                                            unfocusedIndicatorColor = Color.Transparent
                                        ),
                                        singleLine = true,
                                        modifier = Modifier.weight(1f)
                                    )
                                    IconButton(
                                        onClick = { checklistItems.removeAt(index) },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "حذف العنصر",
                                            tint = AccentRose,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }

                        // Add new checklist item
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp)
                        ) {
                            OutlinedTextField(
                                value = newChecklistText,
                                onValueChange = { newChecklistText = it },
                                placeholder = { Text("أضف عنصراً جديداً...", fontSize = 12.sp) },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Button(
                                onClick = {
                                    if (newChecklistText.isNotBlank()) {
                                        checklistItems.add(
                                            ChecklistItem(
                                                id = "chk-${System.currentTimeMillis()}",
                                                text = newChecklistText.trim(),
                                                completed = false
                                            )
                                        )
                                        newChecklistText = ""
                                    }
                                },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                                modifier = Modifier.height(48.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "إضافة")
                            }
                        }
                    }
                }

                // Tags Section
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "الوسوم",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        tags.forEach { tag ->
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.padding(vertical = 2.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text("#$tag", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "حذف الوسم",
                                        tint = AccentRose,
                                        modifier = Modifier
                                            .size(12.dp)
                                            .clickable { tags.remove(tag) }
                                    )
                                }
                            }
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(
                                value = tagInput,
                                onValueChange = { tagInput = it },
                                placeholder = { Text("أضف وسماً...", fontSize = 11.sp) },
                                singleLine = true,
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier
                                    .width(130.dp)
                                    .height(42.dp)
                            )
                            IconButton(
                                onClick = {
                                    val clean = tagInput.trim().removePrefix("#")
                                    if (clean.isNotBlank() && !tags.contains(clean)) {
                                        tags.add(clean)
                                        tagInput = ""
                                    }
                                }
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "إضافة وسم", tint = PrimaryIndigo)
                            }
                        }
                    }
                }

                // Note Color Picker
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "لون الملاحظة",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        NoteColor.entries.forEach { c ->
                            val s = getNoteCardColors(c, isDarkTheme)
                            val isSelected = color == c
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .size(28.dp)
                                    .clip(CircleShape)
                                    .background(s.dot)
                                    .border(
                                        width = if (isSelected) 3.dp else 1.dp,
                                        color = if (isSelected) PrimaryIndigo else Color.Transparent,
                                        shape = CircleShape
                                    )
                                    .clickable { color = c }
                            ) {
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(color = noteColors.border.copy(alpha = 0.5f))

                // Metadata selectors: Category, Priority, Reminder
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Category Picker
                    Box(modifier = Modifier.weight(1f)) {
                        OutlinedButton(
                            onClick = { categoryDropdownOpen = true },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(horizontalAlignment = Alignment.Start) {
                                Text("التصنيف", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(category, fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                            }
                        }

                        DropdownMenu(
                            expanded = categoryDropdownOpen,
                            onDismissRequest = { categoryDropdownOpen = false }
                        ) {
                            categories.filter { it != "الكل" }.forEach { cat ->
                                DropdownMenuItem(
                                    text = { Text(cat) },
                                    onClick = {
                                        category = cat
                                        categoryDropdownOpen = false
                                    }
                                )
                            }
                            DropdownMenuItem(
                                text = { Text("+ تصنيف جديد...", color = PrimaryIndigo) },
                                onClick = {
                                    categoryDropdownOpen = false
                                    isCreatingCategory = true
                                }
                            )
                        }
                    }

                    // Priority Picker
                    Box(modifier = Modifier.weight(1f)) {
                        OutlinedButton(
                            onClick = { priorityDropdownOpen = true },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(horizontalAlignment = Alignment.Start) {
                                Text("الأولوية", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(priority.label, fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                            }
                        }

                        DropdownMenu(
                            expanded = priorityDropdownOpen,
                            onDismissRequest = { priorityDropdownOpen = false }
                        ) {
                            NotePriority.entries.forEach { p ->
                                DropdownMenuItem(
                                    text = { Text(p.label) },
                                    onClick = {
                                        priority = p
                                        priorityDropdownOpen = false
                                    }
                                )
                            }
                        }
                    }

                    // Reminder Button
                    val reminderInfo = note?.reminderAt?.let { DateFormatter.formatReminderTime(it) }
                    OutlinedButton(
                        onClick = { onOpenReminderModal(buildCurrentNote()) },
                        shape = RoundedCornerShape(8.dp),
                        colors = if (reminderInfo != null) ButtonDefaults.outlinedButtonColors(containerColor = AccentAmber.copy(alpha = 0.15f)) else ButtonDefaults.outlinedButtonColors(),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(horizontalAlignment = Alignment.Start) {
                            Text("التذكير", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(
                                text = reminderInfo?.label ?: "تعيين موعد",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                color = if (reminderInfo != null) AccentAmber else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                // If adding category custom input
                if (isCreatingCategory) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        OutlinedTextField(
                            value = newCategoryInput,
                            onValueChange = { newCategoryInput = it },
                            placeholder = { Text("اسم التصنيف الجديد...", fontSize = 11.sp) },
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Button(
                            onClick = {
                                if (newCategoryInput.isNotBlank()) {
                                    category = newCategoryInput.trim()
                                    newCategoryInput = ""
                                    isCreatingCategory = false
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                        ) {
                            Text("إضافة")
                        }
                    }
                }
            }

            // Bottom Action Bar: Cancel & Save
            Surface(
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 4.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    OutlinedButton(
                        onClick = onClose,
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("إلغاء")
                    }

                    Button(
                        onClick = {
                            if (title.isNotBlank() || content.isNotBlank() || checklistItems.isNotEmpty()) {
                                onSave(buildCurrentNote())
                            }
                            onClose()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.testTag("save_note_button")
                    ) {
                        Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("حفظ الملاحظة", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
