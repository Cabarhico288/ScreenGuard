import { NativeModules } from 'react-native';

const { AppUsageModule } = NativeModules;

// Function to fetch all installed apps
export const fetchInstalledApps = async () => {
  try {
    const apps = await AppUsageModule.getAllInstalledApps();
    return apps;
  } catch (error) {
    console.error('Error fetching installed apps:', error);
    throw error;
  }
};

// Function to fetch app usage stats for a given interval (daily, weekly, etc.)
export const fetchAppUsageData = async (interval) => {
  try {
    const usageData = await AppUsageModule.getAppUsageStats(interval);
    return usageData;
  } catch (error) {
    console.error('Error fetching app usage data:', error);
    throw error;
  }
};

// Function to merge installed apps and their corresponding usage data
export const mergeInstalledAndUsageData = (installedApps, usageData) => {
  return installedApps.map((app) => {
    const usageInfo = usageData.find((usageApp) => usageApp.packageName === app.packageName);
    return {
      ...app,
      timeInForeground: usageInfo ? usageInfo.timeInForeground : 'No usage data',
    };
  });
};

// Utility function to check if usage access permission is granted
export const checkUsageAccessPermission = async () => {
  try {
    const hasPermission = await AppUsageModule.checkUsageAccessPermission();
    return hasPermission;
  } catch (error) {
    console.error('Error checking usage access permission:', error);
    throw error;
  }
};
