import { NativeModules, Alert } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use AppBlockerModule instead of AppUsageModule
const { AppBlockerModule } = NativeModules;

// Interface definitions
interface App {
  blockStart: string;
  blockEnd: string;
}

interface Schedule {
  startDate: string;
  endDate: string;
  apps?: Record<string, App>;
}

// Constants
const ALERT_COOLDOWN = 10000; // 10 seconds cooldown
let lastAlertTime = 0;
let appMonitoringInterval: NodeJS.Timeout | null = null;

// Request usage access permission
export const requestUsagePermission = async () => {
  try {
    const isGranted = await AppBlockerModule.checkUsageAccessPermission();
    if (!isGranted) {
      // Prompt the user to grant usage access permission
      Alert.alert(
        'Permission Required',
        'Please enable usage access permission for this app in your phone settings.'
      );
    }
  } catch (error) {
    console.error('Error requesting usage permission:', error);
  }
};


// Initialize restricted apps using the native module
export const initializeRestrictedApps = async () => {
  try {
    await AppBlockerModule.initializeRestrictedApps(); // Call the native function to initialize apps
    console.log('Restricted apps initialized successfully.');
  } catch (error) {
    console.error('Error initializing restricted apps:', error);
  }
};



// Stop monitoring
export const stopMonitoringApps = () => {
  if (appMonitoringInterval) {
    clearInterval(appMonitoringInterval);
    appMonitoringInterval = null;
  }
};

// Fetch schedules from Firebase and enforce
const fetchSchedulesOnChildDevice = (childUID: string, setIsAppBlocked: (isBlocked: boolean) => void) => {
  const database = getDatabase();
  const scheduleRef = ref(database, `schedules/${childUID}`);
  onValue(scheduleRef, (snapshot) => {
    if (snapshot.exists()) {
      const schedules = snapshot.val() as Record<string, Schedule>;
      handleScheduleEnforcement(schedules, setIsAppBlocked);
    } else {
      console.log('No schedule data available');
    }
  }, error => console.error('Error fetching schedules from database:', error));
};

// Enforce schedules
const handleScheduleEnforcement = (schedules: Record<string, Schedule>, setIsAppBlocked: (isBlocked: boolean) => void) => {
  let appShouldBeBlocked = false;
  for (const schedule of Object.values(schedules)) {
    if (isDateWithinRange(schedule.startDate, schedule.endDate) && schedule.apps) {
      for (const app of Object.values(schedule.apps)) {
        if (isAppWithinBlockedTime(app.blockStart, app.blockEnd)) {
          appShouldBeBlocked = true;
          break;
        }
      }
    }
  }
  setIsAppBlocked(appShouldBeBlocked);
};

// Check if an app is scheduled to be blocked
const isAppScheduledToBeBlocked = async (packageName: string): Promise<boolean> => {
  try {
    const schedules: Record<string, Schedule> = global.currentSchedules || {};
    for (const schedule of Object.values(schedules)) {
      if (isDateWithinRange(schedule.startDate, schedule.endDate) && schedule.apps) {
        const appSchedule = schedule.apps[packageName];
        if (appSchedule && isAppWithinBlockedTime(appSchedule.blockStart, appSchedule.blockEnd)) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error in isAppScheduledToBeBlocked:', error);
    return false;
  }
};

// Utility functions
const isDateWithinRange = (startDate: string, endDate: string): boolean => {
  const currentDate = new Date();
  const [startMonth, startDay, startYear] = startDate.split('/').map(Number);
  const [endMonth, endDay, endYear] = endDate.split('/').map(Number);

  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return currentDate >= start && currentDate <= end;
};

const isAppWithinBlockedTime = (blockStart: string, blockEnd: string): boolean => {
  const [startHours, startMinutes] = blockStart.split(':').map(Number);
  const [endHours, endMinutes] = blockEnd.split(':').map(Number);
  const currentDate = new Date();
  const start = new Date(currentDate.setHours(startHours, startMinutes, 0, 0));
  const end = new Date(currentDate.setHours(endHours, endMinutes, 0, 0));
  return currentDate >= start && currentDate <= end;
};

// Handle blocking a restricted app
const handleBlockedApp = (packageName: string) => {
  console.log(`Blocking app: ${packageName}`);
  AppBlockerModule.redirectToHomeScreen(); // Use the native function to redirect
  Alert.alert('App Blocked', `${packageName} is currently restricted.`);
};
