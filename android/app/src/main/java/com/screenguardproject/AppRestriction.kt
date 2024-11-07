package com.screenguardproject.blocker

data class AppRestriction(
    val packageName: String,
    val blockStart: String?,
    val blockEnd: String?,
    val appName: String? = null,
    val category: String? = null,
    val icon: String? = null
)
