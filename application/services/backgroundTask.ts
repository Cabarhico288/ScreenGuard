// backgroundTask.ts

import BackgroundService from 'react-native-background-actions';
import NetInfo from '@react-native-community/netinfo';
import { uploadInstalledApps } from '../services/authHandlers'; // Adjust the path to your upload function
import { getAuth } from 'firebase/auth';

// Define the background task
const veryIntensiveTask = async (taskDataArguments) => {
  const { delay } = taskDataArguments;

  // Run indefinitely
  while (true) {
    // Check for internet connection
    const state = await NetInfo.fetch();
    if (state.isConnected && state.isInternetReachable) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // Upload installed apps data
        await uploadInstalledApps(user.uid);
      }
    }

    // Delay the loop for the specified time
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

const options = {
    taskName: 'App Usage Upload',
    taskTitle: 'Uploading App Usage Data',
    taskDesc: 'Your app is uploading usage data in the background.',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'com.screenguardproject://_childLayout', // Use your app's scheme
    parameters: {
      delay: 3600000, // 1-hour delay
    },
  };
  

// Function to start the background task
export const startBackgroundUpload = async () => {
  try {
    await BackgroundService.start(veryIntensiveTask, options);
    console.log('Background task started');
  } catch (error) {
    console.error('Error starting background task:', error);
  }
};

// Function to stop the background task
export const stopBackgroundUpload = async () => {
  try {
    await BackgroundService.stop();
    console.log('Background task stopped');
  } catch (error) {
    console.error('Error stopping background task:', error);
  }
};
