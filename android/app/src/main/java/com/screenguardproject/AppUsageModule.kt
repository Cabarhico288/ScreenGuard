package com.screenguardproject

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.os.SystemClock
import android.provider.Settings
import android.util.Base64
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import java.io.ByteArrayOutputStream
import java.text.SimpleDateFormat
import java.util.*
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.ReadableArray
import android.app.Activity
private lateinit var screenReceiver: BroadcastReceiver

class AppUsageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val channelId = "AppBlockerChannel"
    private val TAG = "AppUsageModule"
   

    init {
        // Initialize the screenReceiver and register it for screen on/off events
        screenReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                when (intent?.action) {
                    Intent.ACTION_SCREEN_ON -> {
                        // Handle screen ON event (device unlocked)
                        Log.d("AppUsageModule", "Screen turned on")
                        incrementScreenCount("screenOnCount")
                    }
                    Intent.ACTION_SCREEN_OFF -> {
                        // Handle screen OFF event (device locked)
                        Log.d("AppUsageModule", "Screen turned off")
                        incrementScreenCount("screenOffCount")
                    }
                }
            }
        }

        val intentFilter = IntentFilter()
        intentFilter.addAction(Intent.ACTION_SCREEN_ON)
        intentFilter.addAction(Intent.ACTION_SCREEN_OFF)
        reactApplicationContext.registerReceiver(screenReceiver, intentFilter)
    }

    override fun getName(): String {
        return "AppUsageModule"
    }

    // React Method to get and track the device boot time and count of device reboots
    @ReactMethod
    fun getDeviceBootInfo(promise: Promise) {
        try {
            val sharedPreferences = reactApplicationContext.getSharedPreferences("boot_info", Context.MODE_PRIVATE)
            val bootTime = System.currentTimeMillis() - SystemClock.elapsedRealtime()
            val previousBootTime = sharedPreferences.getLong("lastBootTime", 0L)

            // Format the current boot time
       val formatter = SimpleDateFormat("dd-MM-yyyy HH:mm a", Locale.getDefault())
            val bootTimeFormatted = formatter.format(Date(bootTime))

            // Save the current boot time for the next app launch
            val editor = sharedPreferences.edit()
            editor.putLong("lastBootTime", bootTime)
            editor.apply()

            var bootCount = sharedPreferences.getInt("bootCount", 0)

            // Check if boot time has changed (device restarted)
            if (previousBootTime != 0L && bootTime != previousBootTime) {
                bootCount += 1 // Increment the boot count if the device has restarted
                editor.putInt("bootCount", bootCount)
                editor.apply()
            }

            // Return both the boot time and the count of device reboots
            val bootInfo = Arguments.createMap()
            bootInfo.putString("bootTime", bootTimeFormatted)
            bootInfo.putInt("bootCount", bootCount)

            promise.resolve(bootInfo)

        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }

    // Increment screen on/off counts
    private fun incrementScreenCount(key: String) {
        val sharedPreferences = reactApplicationContext.getSharedPreferences("screen_info", Context.MODE_PRIVATE)
        val currentCount = sharedPreferences.getInt(key, 0)
        val editor = sharedPreferences.edit()
        editor.putInt(key, currentCount + 1)
        editor.apply()
    }

    @ReactMethod
    fun getScreenEventCounts(promise: Promise) {
        val sharedPreferences = reactApplicationContext.getSharedPreferences("screen_info", Context.MODE_PRIVATE)
        val screenOnCount = sharedPreferences.getInt("screenOnCount", 0)
        val screenOffCount = sharedPreferences.getInt("screenOffCount", 0)

        val screenEventInfo = Arguments.createMap()
        screenEventInfo.putInt("screenOnCount", screenOnCount)
        screenEventInfo.putInt("screenOffCount", screenOffCount)

        promise.resolve(screenEventInfo)
    }

    // React Method to check if usage access permission is granted
    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
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
    
@ReactMethod
fun getAllInstalledApps(promise: Promise) {
    try {
        val packageManager: PackageManager = reactApplicationContext.packageManager
        val installedApps: List<ApplicationInfo> = packageManager.getInstalledApplications(0)
        val appsArray: WritableArray = Arguments.createArray()

        for (appInfo in installedApps) {
            val isSystemApp = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0 ||
                              (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0

            if (!isRelevantApp(appInfo.packageName, isSystemApp)) continue  // Updated condition

            val appDetails: WritableMap = Arguments.createMap()
            val appName = packageManager.getApplicationLabel(appInfo).toString()
            appDetails.putString("appName", appName)
            val appIcon: Drawable = packageManager.getApplicationIcon(appInfo)
            val iconBase64 = drawableToBase64(appIcon)

            val installDate = packageManager.getPackageInfo(appInfo.packageName, 0).firstInstallTime
            val formatter = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
            val installDateFormatted = formatter.format(Date(installDate))

            var appCategory: String? = null
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                appCategory = when (appInfo.category) {
                    ApplicationInfo.CATEGORY_GAME -> "Game"
                    ApplicationInfo.CATEGORY_SOCIAL -> "Social"
                    ApplicationInfo.CATEGORY_PRODUCTIVITY -> "Productivity"
                    ApplicationInfo.CATEGORY_AUDIO -> "Audio"
                    ApplicationInfo.CATEGORY_VIDEO -> "Video"
                    ApplicationInfo.CATEGORY_NEWS -> "News"
                    else -> "Other"
                }
            }

            appDetails.putString("appName", appName)
            appDetails.putString("appIcon", iconBase64)
            appDetails.putString("installedDate", installDateFormatted)
            appDetails.putString("appCategory", appCategory ?: "Unknown")
            appDetails.putString("packageName", appInfo.packageName)
            appDetails.putBoolean("isSystemApp", isSystemApp)  // Mark if it's a system app

            appsArray.pushMap(appDetails)
        }

        promise.resolve(appsArray)

    } catch (e: Exception) {
        promise.reject("Error", e.message)
    }
}

private fun isRelevantApp(packageName: String, isSystemApp: Boolean): Boolean {
    val excludedPrefixes = listOf(
        "com.android", "android", "com.google.android", "com.sec.android", "com.samsung", "com.qualcomm"
    )

    val allowedApps = listOf(
        "com.google.android.youtube",
        "com.google.android.apps.maps",
        "com.google.android.gm",  // Gmail
        "com.facebook.katana",    // Facebook
        "com.whatsapp"
    )

    return allowedApps.contains(packageName) || (!isSystemApp && !excludedPrefixes.any { packageName.startsWith(it) })
}

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    fun getAppUsageStats(interval: String, promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val packageManager: PackageManager = reactApplicationContext.packageManager
            val calendar = Calendar.getInstance()

            // Adjust the calendar based on the interval
            when (interval) {
                "daily" -> calendar.add(Calendar.DAY_OF_YEAR, -1)
                "weekly" -> calendar.add(Calendar.WEEK_OF_YEAR, -1)
                "monthly" -> calendar.add(Calendar.MONTH, -1)
                "yearly" -> calendar.add(Calendar.YEAR, -1)
                else -> calendar.add(Calendar.DAY_OF_YEAR, -1) // Default to daily if no valid interval
            }

            // Use the interval to fetch appropriate data
            val intervalType = when (interval) {
                "daily" -> UsageStatsManager.INTERVAL_DAILY
                "weekly" -> UsageStatsManager.INTERVAL_WEEKLY
                "monthly" -> UsageStatsManager.INTERVAL_MONTHLY
                "yearly" -> UsageStatsManager.INTERVAL_YEARLY
                else -> UsageStatsManager.INTERVAL_DAILY
            }

            val stats: List<UsageStats> = usageStatsManager.queryUsageStats(
                intervalType,
                calendar.timeInMillis,
                System.currentTimeMillis()
            )

            if (stats.isEmpty()) {
                promise.reject("No Usage Data", "No usage data available")
                return
            }

            val appUsageArray: WritableArray = Arguments.createArray()
            val uniqueAppsSet = mutableSetOf<String>() // Track unique package names to prevent duplicates

            for (usageStat in stats) {
                val packageName = usageStat.packageName ?: continue

                // Avoid adding duplicate apps by using a set
                if (uniqueAppsSet.contains(packageName)) continue
                uniqueAppsSet.add(packageName)

                val timeInForegroundInSeconds = usageStat.totalTimeInForeground / 1000 // Convert milliseconds to seconds

                try {
                    // Fetch app info like name, icon, category, and installation date
                    val appInfo = packageManager.getApplicationInfo(packageName, 0)

                    // **Filter out system apps**
                    if ((appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0 || (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0) {
                    }

                    val appName = packageManager.getApplicationLabel(appInfo).toString()
                    val appIcon = packageManager.getApplicationIcon(appInfo)
                    val installedDate = packageManager.getPackageInfo(packageName, 0).firstInstallTime

                    // Format install date
                    val formatter = SimpleDateFormat("dd-MM-yyyy", Locale.getDefault())
                    val installDateFormatted = formatter.format(Date(installedDate))

                    // Fetch app category (only available on API level 26 or higher)
                    var appCategory: String? = null
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        appCategory = when (appInfo.category) {
                            ApplicationInfo.CATEGORY_GAME -> "Game"
                            ApplicationInfo.CATEGORY_SOCIAL -> "Social"
                            ApplicationInfo.CATEGORY_PRODUCTIVITY -> "Productivity"
                            ApplicationInfo.CATEGORY_AUDIO -> "Audio"
                            ApplicationInfo.CATEGORY_VIDEO -> "Video"
                            ApplicationInfo.CATEGORY_NEWS -> "News"
                            else -> "Other"
                        }
                    }

                    // Convert the app icon to Base64
                    val iconBase64 = drawableToBase64(appIcon)

                    // Add the app information to the WritableMap
                    val appUsage = Arguments.createMap()
                    appUsage.putString("appName", appName)
                    appUsage.putString("appIcon", iconBase64)
                    appUsage.putString("timeInForeground", String.format("%d seconds", timeInForegroundInSeconds))
                    appUsage.putString("installedDate", installDateFormatted)
                    appUsage.putString("appCategory", appCategory ?: "Unknown")

                    appUsageArray.pushMap(appUsage)

                } catch (e: PackageManager.NameNotFoundException) {
                    continue // Skip apps that are not found
                }
            }

            promise.resolve(appUsageArray)

        } catch (e: Exception) {
            promise.reject("Error", e.message)
        }
    }

    // Helper method to convert Drawable to Base64 String
    private fun drawableToBase64(drawable: Drawable): String? {
        val bitmap: Bitmap = if (drawable is BitmapDrawable) {
            drawable.bitmap
        } else {
            val bitmap = Bitmap.createBitmap(
                drawable.intrinsicWidth,
                drawable.intrinsicHeight,
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            bitmap
        }
        return bitmapToBase64(bitmap)
    }

    private fun bitmapToBase64(bitmap: Bitmap): String? {
        val byteArrayOutputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream)
        val byteArray = byteArrayOutputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.DEFAULT)
    }

}