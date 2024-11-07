// UsageStatsModule.java
package com.yourapp;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.Calendar;
import java.util.List;

public class UsageStatsModule extends ReactContextBaseJavaModule {

    UsageStatsManager usageStatsManager;

    public UsageStatsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        usageStatsManager = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
    }

    @Override
    public String getName() {
        return "UsageStatsModule";
    }

    @ReactMethod
    public void getAppUsage(Promise promise) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, -1); // Fetch for the last 24 hours

        List<UsageStats> stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            calendar.getTimeInMillis(),
            System.currentTimeMillis()
        );

        if (stats != null) {
            // Here you would parse the stats and return the data
            // You can return the screen time, most used app, etc.
            promise.resolve("Success");
        } else {
            promise.reject("Error", "Usage Stats not available");
        }
    }
}
