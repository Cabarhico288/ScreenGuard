package com.screenguardproject.blocker

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.screenguardproject.AppBlockerModule
import com.screenguardproject.blocker.AppRestriction 
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class AppAccessibilityService : AccessibilityService() {

    // List to store app restrictions
    private val restrictedApps = mutableListOf<AppRestriction>()
    private var isRestrictedAppsInitialized = false
    private val appBlockerModule by lazy { AppBlockerModule(this) } // Ensure context is correct

    // Called when an accessibility event occurs
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!isRestrictedAppsInitialized) {
            Log.d("AppAccessibilityService", "Restricted apps list not initialized yet.")
            return
        }

        // Check if the event is of type window state changed
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString()
        Log.d("AppAccessibilityService", "Received event for package: $packageName")

        if (packageName != null) {
            val currentTime = getCurrentTime()
            Log.d("AppAccessibilityService", "Current time: $currentTime")

            // Check if the current package is in the restricted apps list and if it's within the block time
            restrictedApps.forEach { appRestriction ->
                if (appRestriction.packageName == packageName &&
                    isWithinBlockTime(currentTime, appRestriction.blockStart, appRestriction.blockEnd)
                ) {
                    Log.d("AppAccessibilityService", "Blocking app: $packageName")
                    return@forEach
                }
            }
        }
    }

    // Get the current time in "h:mm a" format
    private fun getCurrentTime(): String {
        val calendar = Calendar.getInstance()
        val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
        return timeFormat.format(calendar.time)
    }

    

    // Called when the service is connected
    override fun onServiceConnected() {
        super.onServiceConnected()
     
    }

    override fun onInterrupt() {
        Log.d("AppAccessibilityService", "Service interrupted")
    }

    // Redirects the user to the home screen
    private fun redirectToHomeScreen() {
        val intent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
        }
        startActivity(intent)
    }

    // Check if the current time falls within the block time
    private fun isWithinBlockTime(currentTime: String, blockStart: String?, blockEnd: String?): Boolean {
        if (blockStart == null || blockEnd == null) return false
        return try {
            val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
            val current = timeFormat.parse(currentTime)
            val start = timeFormat.parse(blockStart)
            val end = timeFormat.parse(blockEnd)
            current != null && start != null && end != null && (current.after(start) && current.before(end))
        } catch (e: Exception) {
            Log.e("AppAccessibilityService", "Error parsing block times: ${e.message}")
            false
        }
    }
}
