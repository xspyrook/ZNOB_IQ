package com.example.modawen.utils

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class ReminderInfo(
    val label: String,
    val isOverdue: Boolean,
    val isToday: Boolean
)

object DateFormatter {
    private val arabicLocale = Locale("ar", "SA")
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    private val isoFormatSecondary = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    private val timeFormat = SimpleDateFormat("hh:mm a", arabicLocale)
    private val shortDateFormat = SimpleDateFormat("d MMM، hh:mm a", arabicLocale)
    private val fullDateFormat = SimpleDateFormat("d MMM yyyy", arabicLocale)

    fun parseIso(isoString: String): Date? {
        return try {
            isoFormat.parse(isoString) ?: isoFormatSecondary.parse(isoString)
        } catch (_: Exception) {
            try {
                isoFormatSecondary.parse(isoString)
            } catch (_: Exception) {
                null
            }
        }
    }

    fun toIsoString(date: Date): String {
        return isoFormat.format(date)
    }

    fun formatArabicDate(isoString: String): String {
        val date = parseIso(isoString) ?: return isoString
        val now = Date()
        val diffMs = now.time - date.time
        val diffSec = diffMs / 1000
        val diffMin = diffSec / 60
        val diffHour = diffMin / 60

        val calNow = Calendar.getInstance().apply { time = now }
        val calDate = Calendar.getInstance().apply { time = date }

        if (diffSec in 0..59) {
            return "الآن"
        }
        if (diffMin in 1..59) {
            val unit = when {
                diffMin == 1L -> "دقيقة"
                diffMin == 2L -> "دقيقتين"
                diffMin in 3..10 -> "دقائق"
                else -> "دقيقة"
            }
            return "منذ $diffMin $unit"
        }

        val isSameDay = calNow.get(Calendar.YEAR) == calDate.get(Calendar.YEAR) &&
                calNow.get(Calendar.DAY_OF_YEAR) == calDate.get(Calendar.DAY_OF_YEAR)

        if (isSameDay) {
            return "اليوم، ${timeFormat.format(date)}"
        }

        val isYesterday = calNow.get(Calendar.YEAR) == calDate.get(Calendar.YEAR) &&
                calNow.get(Calendar.DAY_OF_YEAR) - calDate.get(Calendar.DAY_OF_YEAR) == 1

        if (isYesterday) {
            return "أمس، ${timeFormat.format(date)}"
        }

        val isSameYear = calNow.get(Calendar.YEAR) == calDate.get(Calendar.YEAR)
        return if (isSameYear) {
            shortDateFormat.format(date)
        } else {
            fullDateFormat.format(date)
        }
    }

    fun formatReminderTime(reminderDateString: String): ReminderInfo {
        val target = parseIso(reminderDateString) ?: return ReminderInfo("", isOverdue = false, isToday = false)
        val now = Date()
        val isOverdue = target.time < now.time

        val calNow = Calendar.getInstance().apply { time = now }
        val calTarget = Calendar.getInstance().apply { time = target }

        val isToday = calNow.get(Calendar.YEAR) == calTarget.get(Calendar.YEAR) &&
                calNow.get(Calendar.DAY_OF_YEAR) == calTarget.get(Calendar.DAY_OF_YEAR)

        val isTomorrow = calNow.get(Calendar.YEAR) == calTarget.get(Calendar.YEAR) &&
                calTarget.get(Calendar.DAY_OF_YEAR) - calNow.get(Calendar.DAY_OF_YEAR) == 1

        val timeStr = timeFormat.format(target)
        var label = when {
            isToday -> "اليوم $timeStr"
            isTomorrow -> "غداً $timeStr"
            else -> "${SimpleDateFormat("d MMM", arabicLocale).format(target)} $timeStr"
        }

        if (isOverdue) {
            label += " (فات الموعد)"
        }

        return ReminderInfo(label = label, isOverdue = isOverdue, isToday = isToday)
    }
}
