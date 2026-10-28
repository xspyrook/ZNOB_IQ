package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.modawen.ui.ModawenApp
import com.example.modawen.ui.ModawenViewModel
import com.example.modawen.ui.theme.ModawenTheme

class MainActivity : ComponentActivity() {
    private val viewModel: ModawenViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val isDark by viewModel.isDarkTheme.collectAsState()

            ModawenTheme(darkTheme = isDark) {
                ModawenApp(viewModel = viewModel)
            }
        }
    }
}
