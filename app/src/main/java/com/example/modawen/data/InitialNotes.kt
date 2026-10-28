package com.example.modawen.data

import com.example.modawen.model.ChecklistItem
import com.example.modawen.model.Note
import com.example.modawen.model.NoteColor
import com.example.modawen.model.NotePriority
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

object InitialNotes {
    val DEFAULT_CATEGORIES = listOf(
        "الكل",
        "العمل",
        "شخصي",
        "أفكار",
        "دراسة",
        "مهمات"
    )

    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    private fun isoDate(millis: Long): String = isoFormat.format(Date(millis))

    fun getInitialNotes(): List<Note> {
        val now = System.currentTimeMillis()
        return listOf(
            Note(
                id = "note-1",
                title = "خطة إطلاق وتطوير التطبيق 🚀",
                content = "أبرز النقاط المستهدفة للإطلاق:\n- مراجعة تجربة المستخدم وسلاسة التصفح\n- التأكد من دقة نظام التنبيهات وجدولة المواعيد\n- دعم حفظ البيانات محلياً مع التصدير والاستيراد\n- تسهيل نسخ ومشاركة الملاحظات بنقرة واحدة",
                category = "العمل",
                tags = listOf("تطوير", "تخطيط", "أولويات"),
                color = NoteColor.EMERALD,
                priority = NotePriority.HIGH,
                isPinned = true,
                isFavorite = true,
                isArchived = false,
                isTrash = false,
                isChecklist = false,
                checklistItems = emptyList(),
                reminderAt = isoDate(now + 3600 * 1000 * 4), // in 4 hours
                reminderNotified = false,
                createdAt = isoDate(now - 3600 * 1000 * 24),
                updatedAt = isoDate(now - 3600 * 1000 * 2)
            ),
            Note(
                id = "note-2",
                title = "قائمة تجهيز حقيبة السفر ✈️",
                content = "أشياء أساسية يجب التأكد منها قبل مغادرة المنزل:",
                category = "شخصي",
                tags = listOf("سفر", "عطلة", "تجهيزات"),
                color = NoteColor.SKY,
                priority = NotePriority.MEDIUM,
                isPinned = false,
                isFavorite = true,
                isArchived = false,
                isTrash = false,
                isChecklist = true,
                checklistItems = listOf(
                    ChecklistItem("chk-1", "جواز السفر وتأشيرات الدخول", true),
                    ChecklistItem("chk-2", "تأكيد حجز الفندق وتذاكر الطيران", true),
                    ChecklistItem("chk-3", "الشاحن المتنقل والمحولات الكهربائية", true),
                    ChecklistItem("chk-4", "حقيبة الأدوية والمستلزمات الشخصية", false),
                    ChecklistItem("chk-5", "سماعات إلغاء الضوضاء وكتاب للقراءة", false)
                ),
                reminderAt = isoDate(now + 3600 * 1000 * 24), // Tomorrow
                reminderNotified = false,
                createdAt = isoDate(now - 3600 * 1000 * 12),
                updatedAt = isoDate(now - 3600 * 1000 * 1)
            ),
            Note(
                id = "note-3",
                title = "أفكار لمشروع محتوى تقني إبداعي 💡",
                content = "سلسلة مقاطع قصيرة تشرح تبسيط التقنيات الحديثة للمستخدم العادي.\nالتركيز على:\n1. كيف تعمل أدوات الذكاء الاصطناعي في حياتنا اليومية\n2. أفضل ممارسات حماية الخصوصية وكلمات المرور\n3. تطبيقات زيادة الإنتاجية وإدارة الملاحظات",
                category = "أفكار",
                tags = listOf("إبداع", "صناعة_محتوى", "تقنية"),
                color = NoteColor.AMBER,
                priority = NotePriority.MEDIUM,
                isPinned = false,
                isFavorite = false,
                isArchived = false,
                isTrash = false,
                isChecklist = false,
                checklistItems = emptyList(),
                createdAt = isoDate(now - 3600 * 1000 * 48),
                updatedAt = isoDate(now - 3600 * 1000 * 18)
            ),
            Note(
                id = "note-4",
                title = "تذكير: موعد فحص السيارة والصيانة الدورية 🚗",
                content = "فحص زيت المحرك، ضغط الإطارات، والتأكد من بطارية السيارة قبل بدء فصل الصيف.",
                category = "مهمات",
                tags = listOf("سيارة", "صيانة", "مهم"),
                color = NoteColor.ROSE,
                priority = NotePriority.HIGH,
                isPinned = false,
                isFavorite = false,
                isArchived = false,
                isTrash = false,
                isChecklist = false,
                checklistItems = emptyList(),
                reminderAt = isoDate(now + 3600 * 1000 * 2), // in 2 hours
                reminderNotified = false,
                createdAt = isoDate(now - 3600 * 1000 * 5),
                updatedAt = isoDate(now - 3600 * 1000 * 5)
            ),
            Note(
                id = "note-5",
                title = "مراجع وكتب للقراءة هذا الشهر 📚",
                content = "- كتاب التفكير بسرعة وببطء - دانيال كانمان\n- العادات الذرية - جيمس كلير\n- ديب وورك (العمل العميق) - كال نيوبورت",
                category = "دراسة",
                tags = listOf("قراءة", "تطوير_ذاتي"),
                color = NoteColor.INDIGO,
                priority = NotePriority.LOW,
                isPinned = false,
                isFavorite = false,
                isArchived = false,
                isTrash = false,
                isChecklist = false,
                checklistItems = emptyList(),
                createdAt = isoDate(now - 3600 * 1000 * 72),
                updatedAt = isoDate(now - 3600 * 1000 * 30)
            )
        )
    }
}
