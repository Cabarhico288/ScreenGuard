package com.screenguardproject

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.facebook.FacebookSdk
import com.facebook.appevents.AppEventsLogger
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper


import com.screenguardproject.AppUsagePackage
import com.screenguardproject.AppBlockerPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> {
                val packages = PackageList(this).packages.toMutableList()
                
                packages.add(AppUsagePackage())
                packages.add(AppBlockerPackage())

                return packages
            }

            override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }
    )

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        FacebookSdk.sdkInitialize(applicationContext)
        AppEventsLogger.activateApp(this)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load()
        }
        ApplicationLifecycleDispatcher.onApplicationCreate(this)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
    }
}
