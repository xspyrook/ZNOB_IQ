package com.example.modawen.ui.theme

import androidx.compose.ui.graphics.Color
import com.example.modawen.model.NoteColor

val PrimaryIndigo = Color(0xFF4F46E5)
val PrimaryIndigoDark = Color(0xFF6366F1)
val SecondaryViolet = Color(0xFF8B5CF6)
val AccentAmber = Color(0xFFF59E0B)
val AccentEmerald = Color(0xFF10B981)
val AccentRose = Color(0xFFF43F5E)

// Neutral surfaces
val LightBackground = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val LightBorder = Color(0xFFE2E8F0)
val LightTextPrimary = Color(0xFF0F172A)
val LightTextSecondary = Color(0xFF64748B)

val DarkBackground = Color(0xFF0A0A0A)
val DarkSurface = Color(0xFF171717)
val DarkBorder = Color(0xFF262626)
val DarkTextPrimary = Color(0xFFF8FAFC)
val DarkTextSecondary = Color(0xFF94A3B8)

data class NoteCardColors(
    val bg: Color,
    val border: Color,
    val dot: Color,
    val textAccent: Color
)

fun getNoteCardColors(color: NoteColor, isDark: Boolean): NoteCardColors {
    return if (!isDark) {
        when (color) {
            NoteColor.DEFAULT -> NoteCardColors(
                bg = Color(0xFFFFFFFF),
                border = Color(0xFFE2E8F0),
                dot = Color(0xFF94A3B8),
                textAccent = Color(0xFF334155)
            )
            NoteColor.AMBER -> NoteCardColors(
                bg = Color(0xFFFEF3C7).copy(alpha = 0.5f),
                border = Color(0xFFFDE68A),
                dot = Color(0xFFF59E0B),
                textAccent = Color(0xFF92400E)
            )
            NoteColor.EMERALD -> NoteCardColors(
                bg = Color(0xFFD1FAE5).copy(alpha = 0.5f),
                border = Color(0xFFA7F3D0),
                dot = Color(0xFF10B981),
                textAccent = Color(0xFF065F46)
            )
            NoteColor.SKY -> NoteCardColors(
                bg = Color(0xFFE0F2FE).copy(alpha = 0.5f),
                border = Color(0xFFBAE6FD),
                dot = Color(0xFF0EA5E9),
                textAccent = Color(0xFF0369A1)
            )
            NoteColor.INDIGO -> NoteCardColors(
                bg = Color(0xFFEEF2FF).copy(alpha = 0.6f),
                border = Color(0xFFC7D2FE),
                dot = Color(0xFF6366F1),
                textAccent = Color(0xFF3730A3)
            )
            NoteColor.ROSE -> NoteCardColors(
                bg = Color(0xFFFFE4E6).copy(alpha = 0.5f),
                border = Color(0xFFFECDD3),
                dot = Color(0xFFF43F5E),
                textAccent = Color(0xFF9F1239)
            )
            NoteColor.SLATE -> NoteCardColors(
                bg = Color(0xFFF1F5F9),
                border = Color(0xFFCBD5E1),
                dot = Color(0xFF64748B),
                textAccent = Color(0xFF334155)
            )
        }
    } else {
        when (color) {
            NoteColor.DEFAULT -> NoteCardColors(
                bg = Color(0xFF171717),
                border = Color(0xFF262626),
                dot = Color(0xFF737373),
                textAccent = Color(0xFFE5E5E5)
            )
            NoteColor.AMBER -> NoteCardColors(
                bg = Color(0xFF451A03).copy(alpha = 0.35f),
                border = Color(0xFF78350F).copy(alpha = 0.6f),
                dot = Color(0xFFF59E0B),
                textAccent = Color(0xFFFDE68A)
            )
            NoteColor.EMERALD -> NoteCardColors(
                bg = Color(0xFF064E3B).copy(alpha = 0.35f),
                border = Color(0xFF065F46).copy(alpha = 0.6f),
                dot = Color(0xFF10B981),
                textAccent = Color(0xFFA7F3D0)
            )
            NoteColor.SKY -> NoteCardColors(
                bg = Color(0xFF082F49).copy(alpha = 0.35f),
                border = Color(0xFF075985).copy(alpha = 0.6f),
                dot = Color(0xFF0EA5E9),
                textAccent = Color(0xFFBAE6FD)
            )
            NoteColor.INDIGO -> NoteCardColors(
                bg = Color(0xFF1E1B4B).copy(alpha = 0.4f),
                border = Color(0xFF3730A3).copy(alpha = 0.6f),
                dot = Color(0xFF6366F1),
                textAccent = Color(0xFFC7D2FE)
            )
            NoteColor.ROSE -> NoteCardColors(
                bg = Color(0xFF4C0519).copy(alpha = 0.35f),
                border = Color(0xFF881337).copy(alpha = 0.6f),
                dot = Color(0xFFF43F5E),
                textAccent = Color(0xFFFECDD3)
            )
            NoteColor.SLATE -> NoteCardColors(
                bg = Color(0xFF1E293B).copy(alpha = 0.5f),
                border = Color(0xFF334155),
                dot = Color(0xFF64748B),
                textAccent = Color(0xFFE2E8F0)
            )
        }
    }
}
