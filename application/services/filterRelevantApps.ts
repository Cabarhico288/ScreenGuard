// Assuming this is in appFilter.js
export const filterRelevantApps = (packageName) => {
    const excludedPrefixes = [
      "com.android", "android", "com.google.android", "com.sec.android", "com.samsung", 
      "com.qualcomm", "com.example.test" // Add more as needed
    ];
  
    const allowedApps = [
      "com.google.android.youtube",
      "com.google.android.apps.maps",
      "com.google.android.gm", // Gmail
      "com.facebook.katana", // Facebook
      "com.whatsapp"
    ];
  
    // Only allow non-excluded apps or explicitly allowed apps
    return allowedApps.includes(packageName) || !excludedPrefixes.some(prefix => packageName.startsWith(prefix));
  };
  