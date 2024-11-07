import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth'; // Updated import
import AsyncStorage from '@react-native-async-storage/async-storage'; // For React Native
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database'; // Import for Realtime Database
import { Platform } from 'react-native'; // Platform detection

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsRhe0WhThEOtsqxID92f1eKD4qf8ztQ8",
  authDomain: "screenguard-d01d9.firebaseapp.com",
  projectId: "screenguard-d01d9",
  storageBucket: "screenguard-d01d9.appspot.com",
  messagingSenderId: "59383951828",
  appId: "1:59383951828:web:01903cee337a7973eee641",
  measurementId: "G-TYG0558HJ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
let auth;

if (Platform.OS === 'web') {
  // For Web: Use browserLocalPersistence
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence); // Or use indexedDBLocalPersistence
} else {
  // For React Native: Use AsyncStorage (check Firebase SDK version)
  try {
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    console.warn("getReactNativePersistence is not available in this Firebase version.");
    auth = initializeAuth(app); // Fallback to default persistence
  }
}

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Realtime Database
const database = getDatabase(app); // Add Realtime Database initialization

export { auth, firestore, database }; // Export database to use it in your app
