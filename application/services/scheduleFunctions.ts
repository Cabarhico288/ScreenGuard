// scheduleFunctions.ts
import { getDatabase, ref, set } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { showMessage } from 'react-native-flash-message';

interface AppSchedule {
  packageName: string;
  blockStart: string;
  blockEnd: string;
}

interface Schedule {
  scheduleName: string;
  startTime: string;
  endTime: string;
  apps: AppSchedule[];
}

/**
 * Function to convert UI time to a proper format if necessary.
 */
export const formatTimeForSchedule = (time: string): string => {
  // Implement time formatting here if necessary
  return time;
};

/**
 * Fetches the Auth UID for schedules linked to the parent UID.
 */
export const fetchChildUIDForSchedules = async (parentUID) => {
  const userDocRef = doc(firestore, 'users', parentUID);
  const snapshot = await getDoc(userDocRef);
  if (snapshot.exists()) {
    const userData = snapshot.data();
    if (userData && userData.linkedChildAuthUID) {
      return userData.linkedChildAuthUID;
    } else {
      console.warn('Linked child UID field is missing or empty.', userData);
      showMessage({
        message: 'Error',
        description: 'Linked child UID field is missing or empty.',
        type: 'warning',
      });
      return null;
    }
  } else {
    console.warn('No document found with the provided parent UID:', parentUID);
    return null;
  }
};

/**
 * Save the schedule to Firebase.
 */
export const saveSchedule = async (childUID, scheduleName, schedule) => {
  const db = getDatabase();
  const scheduleRef = ref(db, `schedules/${childUID}/${scheduleName}`);
  try {
    await set(scheduleRef, schedule);
    console.log('Schedule saved successfully');
    showMessage({
      message: 'Success',
      description: 'Schedule saved successfully',
      type: 'success',
    });
  } catch (error) {
    console.error('Failed to save schedule', error);
    showMessage({
      message: 'Error',
      description: 'Failed to save schedule',
      type: 'danger',
    });
  }
};