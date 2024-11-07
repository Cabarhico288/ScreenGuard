package com.screenguardproject

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.screenguardproject.blocker.AppAccessibilityService
import java.util.Calendar
import android.util.Log
import android.content.SharedPreferences
import java.util.Locale
import java.text.SimpleDateFormat
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import com.google.firebase.database.*
import android.app.NotificationChannel
import android.app.NotificationManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

// Updated Data Class to Include packageName
data class ScheduledAppDetails(
    val scheduleName: String,
    val startDate: String?,
    val endDate: String?,
    val appName: String?,
    val blockStart: String?,
    val blockEnd: String?,
    val category: String?,
    val icon: String?,
    val packageName: String? // Add this field
)

class AppBlockerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var initializedSchedules: List<ScheduledAppDetails> = listOf()
    private val sharedPreferences: SharedPreferences = reactContext.getSharedPreferences(
        "your_app_prefs", Context.MODE_PRIVATE
    )
    private val database: DatabaseReference = FirebaseDatabase.getInstance().reference
    override fun getName(): String {
        return "AppBlockerModule"
    }
    private val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

constructor(context: Context) : this(ReactApplicationContext(context as android.app.Application))

    // Starts the AppAccessibilityService
    @ReactMethod
    fun startAppAccessibilityService(promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, AppAccessibilityService::class.java)
            context.startService(intent)
            promise.resolve("Service started successfully.")
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }

    // Stops the AppAccessibilityService
    @ReactMethod
    fun stopAppAccessibilityService(promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, AppAccessibilityService::class.java)
            context.stopService(intent)
            promise.resolve("Service stopped successfully.")
        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }

   @Suppress("DEPRECATION")
@ReactMethod
fun checkUsageAccessPermission(promise: Promise) {
    try {
        val appOpsManager = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
        val mode = appOpsManager.checkOpNoThrow(
            android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            reactApplicationContext.packageName
        )
        val granted = mode == android.app.AppOpsManager.MODE_ALLOWED
        promise.resolve(granted)
    } catch (e: Exception) {
        promise.reject("Error", e.message)
    }
}



    // Firebase Related..................................................................................

@ReactMethod
fun initializeRestrictedApps(promise: Promise) {
    try {
        // Fetch the auth ID using getCurrentAuthID
        getCurrentAuthID { authID ->
            if (!authID.isNullOrEmpty()) {
                Log.d("AppBlockerModule", "Retrieved auth ID: $authID")

                // Use the auth ID to fetch schedules
                fetchSchedules(authID) { schedules ->
                    if (schedules.isNotEmpty()) {
                        Log.d("AppBlockerModule", "Schedules initialized with ${schedules.size} schedules.")
                        initializedSchedules = schedules // Store schedules for later use
                        
                        // Display details of the fetched schedules
                        val scheduleDetails = StringBuilder()
                        schedules.forEach { schedule ->
                            scheduleDetails.append("Schedule Name: ${schedule.scheduleName}\n")
                            scheduleDetails.append("Start Date: ${schedule.startDate ?: "N/A"}\n")
                            scheduleDetails.append("End Date: ${schedule.endDate ?: "N/A"}\n")
                            scheduleDetails.append("Apps:\n")
                            scheduleDetails.append(
                                "  App Name: ${schedule.appName ?: "N/A"}, " +
                                "Package: ${schedule.packageName ?: "N/A"}, " +
                                "Block Start: ${schedule.blockStart ?: "N/A"}, " +
                                "Block End: ${schedule.blockEnd ?: "N/A"}, " +
                                "Category: ${schedule.category ?: "N/A"}, " +
                                "Icon: ${schedule.icon ?: "N/A"}\n"
                            )
                        }
                        Log.d("AppBlockerModule", "Fetched Schedule Details:\n$scheduleDetails")
                        promise.resolve("Schedules initialized with ${schedules.size} schedules:\n$scheduleDetails")
                    } else {
                        Log.w("AppBlockerModule", "No schedules found for the auth ID: $authID")
                        promise.resolve("No schedules found for auth ID: $authID.")
                    }
                }
            } else {
                Log.e("AppBlockerModule", "Auth ID is null or empty. Cannot initialize schedules.")
                promise.reject("Error", "Auth ID is null or empty. Please ensure the ID is correctly set.")
            }
        }
    } catch (e: Exception) {
        Log.e("AppBlockerModule", "Exception in initializeRestrictedApps: ${e.message}")
        promise.reject("Error", "An error occurred while initializing schedules: ${e.message}")
    }
}


fun fetchSchedules(authID: String, callback: (List<ScheduledAppDetails>) -> Unit) {
    // Use the auth ID instead of childUID
    val scheduleRef = database.child("schedules").child(authID)
    Log.d("AppBlockerModule", "Fetching schedules from path: schedules/$authID")

    scheduleRef.addListenerForSingleValueEvent(object : ValueEventListener {
        override fun onDataChange(snapshot: DataSnapshot) {
            val schedules = mutableListOf<ScheduledAppDetails>()
            Log.d("AppBlockerModule", "Snapshot children count: ${snapshot.childrenCount}")

            for (scheduleSnapshot in snapshot.children) {
                val scheduleName = scheduleSnapshot.key?.replace("_", ".") ?: continue
                val startDate = scheduleSnapshot.child("startDate").value?.toString()
                val endDate = scheduleSnapshot.child("endDate").value?.toString()
                val appsSnapshot = scheduleSnapshot.child("apps")

                if (appsSnapshot.exists()) {
                    for (appSnapshot in appsSnapshot.children) {
                        val appPackageName = appSnapshot.child("packageName").value?.toString()?.replace("_", ".")
                        val appName = appSnapshot.child("appName").value?.toString()
                        val blockStart = appSnapshot.child("blockStart").value?.toString()
                        val blockEnd = appSnapshot.child("blockEnd").value?.toString()
                        val category = appSnapshot.child("category").value?.toString()
                        val icon = appSnapshot.child("icon").value?.toString()

                        if (!appPackageName.isNullOrEmpty()) {
                            schedules.add(
                                ScheduledAppDetails(
                                    scheduleName = scheduleName,
                                    startDate = startDate,
                                    endDate = endDate,
                                    appName = appName,
                                    blockStart = blockStart,
                                    blockEnd = blockEnd,
                                    category = category,
                                    icon = icon,
                                    packageName = appPackageName
                                )
                            )
                        }
                    }
                }
            }

            callback(schedules)
        }

        override fun onCancelled(error: DatabaseError) {
            Log.e("AppBlockerModule", "Error fetching schedules: ${error.message}")
            callback(emptyList())
        }
    })
}


@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
fun getForegroundApp(callback: (String) -> Unit) {
    try {
        val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.SECOND, -10) // Check the last 10 seconds

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            calendar.timeInMillis,
            System.currentTimeMillis()
        )

        if (stats != null && stats.isNotEmpty()) {
            var foregroundApp: String? = null
            var lastUsedTime: Long = 0

            for (usageStat in stats) {
                if (usageStat.lastTimeUsed > lastUsedTime) {
                    lastUsedTime = usageStat.lastTimeUsed
                    foregroundApp = usageStat.packageName
                }
            }

            callback(foregroundApp ?: "")
        } else {
            callback("")
        }
    } catch (e: Exception) {
        callback("") // Return empty string on error
    }
}


@ReactMethod
fun redirectToHomeScreen(promise: Promise) {
    try {
        val intent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactApplicationContext.startActivity(intent)
        promise.resolve("Redirected to home screen.")
    } catch (e: Exception) {
        promise.reject("Error", e.message)
    }
}

  // Checks if a schedule is active based on the start and end dates
    private fun isScheduleActive(startDate: String?, endDate: String?): Boolean {
        if (startDate == null || endDate == null) return false
        return try {
            val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
            val start = dateFormat.parse(startDate)
            val end = dateFormat.parse(endDate)
            val today = Calendar.getInstance().time
            start != null && end != null && today in start..end
        } catch (e: Exception) {
            Log.e("AppBlockerModule", "Error parsing dates: ${e.message}")
            false
        }
    }
     // Method to save child UID to SharedPreferences
  // Public method to get the current auth ID (same as child UID)
fun getCurrentAuthID(callback: (String?) -> Unit) {
    // Retrieve authID from SharedPreferences
    val authID = sharedPreferences.getString("current_child_uid", null)
    callback(authID)
}
   // Method to save child UID to SharedPreferences
    @ReactMethod
    fun saveChildUID(childUID: String, promise: Promise) {
        try {
            with(sharedPreferences.edit()) {
                putString("current_child_uid", childUID)
                apply()
            }
            promise.resolve("Child UID saved successfully.")
        } catch (e: Exception) {
            promise.reject("Error", "Failed to save Child UID: ${e.message}")
        }
    }
    
private fun showNotification(context: Context, title: String, message: String) {
    val channelId = "AppBlockerNotificationChannel"
    val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = NotificationChannel(
            channelId,
            "App Blocker Notifications",
            NotificationManager.IMPORTANCE_HIGH
        )
        notificationManager.createNotificationChannel(channel)
    }

    val notification = NotificationCompat.Builder(context, channelId)
        .setContentTitle(title)
        .setContentText(message)
        .setSmallIcon(android.R.drawable.ic_dialog_alert) // Change the icon as needed
        .setPriority(NotificationCompat.PRIORITY_HIGH)
        .setAutoCancel(true)
        .build()

    NotificationManagerCompat.from(context).notify(1, notification)
}

@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
private fun checkScheduleAndAct(
    actionIfBlocked: (ScheduledAppDetails, String) -> Unit,
    actionIfAllowed: (ScheduledAppDetails, String) -> Unit
) {
    getForegroundApp { foregroundApp ->
        if (foregroundApp.isEmpty()) {
            return@getForegroundApp // Skip processing if no foreground app detected
        }

        // Get current time in 12-hour AM/PM format
        val currentTime = Calendar.getInstance()
        val currentHourMinute = String.format(
            "%02d:%02d %s",
            currentTime.get(Calendar.HOUR),
            currentTime.get(Calendar.MINUTE),
            if (currentTime.get(Calendar.AM_PM) == Calendar.AM) "AM" else "PM"
        )

        // Find the schedule matching the foreground app
        val matchingSchedule = initializedSchedules.find { schedule ->
            schedule.packageName == foregroundApp
        }

        if (matchingSchedule != null) {
            val blockStart = matchingSchedule.blockStart
            val blockEnd = matchingSchedule.blockEnd

            if (blockStart != null && blockEnd != null) {
                val isBlocked = if (compareTimeIn12HourFormat(blockStart, blockEnd) <= 0) {
                    compareTimeIn12HourFormat(currentHourMinute, blockStart) >= 0 &&
                            compareTimeIn12HourFormat(currentHourMinute, blockEnd) <= 0
                } else {
                    compareTimeIn12HourFormat(currentHourMinute, blockStart) >= 0 ||
                            compareTimeIn12HourFormat(currentHourMinute, blockEnd) <= 0
                }

                if (isBlocked) {
                    actionIfBlocked(matchingSchedule, foregroundApp)
                } else if (compareTimeIn12HourFormat(currentHourMinute, blockEnd) > 0) {
                    // Trigger actionIfAllowed if current time is past blockEnd
                    actionIfAllowed(matchingSchedule, foregroundApp)
                }
            }
        }
    }
}


@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
@ReactMethod
fun redirectIfScheduledAppIsOpen(promise: Promise) {
    Log.d("AppBlockerModule", "Checking if the scheduled app should be redirected.")
    checkScheduleAndAct(
        actionIfBlocked = { schedule, foregroundApp ->
            Log.d("AppBlockerModule", "App ${schedule.appName ?: foregroundApp} is blocked. Redirecting to home.")
            showNotification(
                reactApplicationContext,
                "App Blocked",
                "The app ${schedule.appName ?: foregroundApp} is blocked and you have been redirected."
            )
            redirectToHomeScreen(promise) // Redirect if the app is blocked
        },
        actionIfAllowed = { schedule, foregroundApp ->
            Log.d("AppBlockerModule", "App ${schedule.appName ?: foregroundApp} is allowed. Showing notification.")
            showNotification(
                reactApplicationContext,
                "App Allowed",
                "The app ${schedule.appName ?: foregroundApp} is no longer blocked and can now be opened."
            )
        }
    )
}

@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
@ReactMethod
fun notifyIfAppIsAllowed(promise: Promise) {
    Log.d("AppBlockerModule", "Checking if the app is allowed for notification purposes.")
    checkScheduleAndAct(
        actionIfBlocked = { _, _ ->
            Log.d("AppBlockerModule", "No action needed for blocked apps in notifyIfAppIsAllowed.")
            // No action needed for blocked in this function
        },
        actionIfAllowed = { schedule, foregroundApp ->
            Log.d("AppBlockerModule", "App ${schedule.appName ?: foregroundApp} is allowed. Resolving promise.")
            promise.resolve("The app ${schedule.appName ?: foregroundApp} is now allowed.")
        }
    )
}


fun compareTimeIn12HourFormat(time1: String, time2: String): Int {
    val sdf = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
    val date1 = sdf.parse(time1)
    val date2 = sdf.parse(time2)

    // Safely handle nullable Date objects
    return when {
        date1 == null && date2 == null -> 0 // Both are null, considered equal
        date1 == null -> -1 // If date1 is null, consider it smaller
        date2 == null -> 1 // If date2 is null, consider it greater
        else -> date1.compareTo(date2) // Normal comparison when both are non-null
    }
}


}
