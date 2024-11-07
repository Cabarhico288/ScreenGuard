// services/authHandlers.ts
import { filterRelevantApps } from '../services/filterRelevantApps';
import { showMessage } from 'react-native-flash-message';
import { signInWithEmailPassword, signUpWithEmailPassword } from './authService';
import { saveUserRole, getUserRole } from './firestoreService';
import { validatePassword } from './validationUtils';
import { NativeModules} from 'react-native';
import { getAuth, sendEmailVerification, reload, sendPasswordResetEmail, signInWithCredential} from "firebase/auth";
import { doc, setDoc,getDoc  } from 'firebase/firestore';
import { getDatabase, ref, set, onValue } from 'firebase/database'; 
import { firestore, database } from '../firebase'; 
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import AsyncStorage from '@react-native-async-storage/async-storage';
//...................................................................................................................
// Access the AppBlockerModule from NativeModules
const { AppBlockerModule } = NativeModules;
const { AppUsageModule } = NativeModules;
// Function to upload installed apps to Realtime Database
export const uploadInstalledApps = async (childUID) => {
  try {
    const userDocRef = doc(firestore, 'users', childUID);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      console.warn('Child data not found in Firestore.');
      return;
    }

    const childData = userSnapshot.data();
    const childUUID = childData.uuid;

    const allApps = await AppUsageModule.getAllInstalledApps();
    const usageData = await AppUsageModule.getAppUsageStats('daily');

    const appsRef = ref(database, `applications/${childUID}`);

    const currentData = await new Promise((resolve) => {
      onValue(appsRef, (snapshot) => {
        resolve(snapshot.exists() ? snapshot.val() : null);
      }, { onlyOnce: true });
    });

    // Ensure the 'name' field is properly fetched as 'appName' from the Kotlin code
    const allAppsData = allApps.map((app) => ({
      packageName: app.packageName || 'unknown_package',
      name: app.appName && app.appName.trim() !== '' ? app.appName : 'Unnamed App',  // Updated to use 'appName'
      installedDate: app.installedDate || 'Unknown',
      category: app.appCategory || 'Unknown',
      icon: app.appIcon || '',
    }));

    const usageAppsData = usageData
      .filter((app) => parseFloat(app.timeInForeground.split(' ')[0]) > 0)
      .map((app) => ({
        packageName: app.packageName || 'unknown_package',
        name: app.appName && app.appName.trim() !== '' ? app.appName : 'Unnamed App',  // Ensure 'appName' is used
        usage: app.timeInForeground || '0 minutes',
        installedDate: app.installedDate || 'Unknown',
        category: app.appCategory || 'Unknown',
        icon: app.appIcon || '',
      }));

    const newData = {
      childUUID,
      allApps: allAppsData,
      usageApps: usageAppsData,
    };

    if (JSON.stringify(currentData) === JSON.stringify(newData)) {
      console.log('No changes detected, skipping upload.');
      return;
    }

    await set(appsRef, newData);
    console.log('Applications uploaded successfully!');
  } catch (error) {
    console.error('Error uploading apps:', error);
  }
};
//......................................................................................................................................

// Handle ResendVerification
export const resendVerificationLink = async (email: string) => {
  try {
    const auth = getAuth();
    const user = await auth.currentUser;

    if (user && user.email === email) {
      // Refresh user data
      await user.reload();

      // Check if the email is already verified
      if (user.emailVerified) {
        return { success: false, message: "Your email is already verified." };
      } else {
        // Send verification email if not verified
        await sendEmailVerification(user);
        return { success: true };
      }
    } else {
      throw new Error("User not found or email mismatch.");
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
//......................................................................................................................................


export const handleForgotPassword = async (email: string) => {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    showMessage({
      message: 'Success',
      description: 'Password reset email sent! Check your inbox.',
      type: 'success',
    });
  } catch (error) {
    showMessage({
      message: 'Error',
      description: error.message || 'Failed to send password reset email.',
      type: 'danger',
    });
  }
};


//......................................................................................................................................
// Handle Login (Parent & Child)
export const handleLogin = async (
  email: string, 
  password: string, 
  selectedRole: string, 
  navigation: any, 
  setLoading: (loading: boolean) => void
) => {
  setLoading(true); // Start loading

  try {
    // Attempt to log in with email and password
    const userCredential = await signInWithEmailPassword(email, password);
    const user = userCredential.user;

    // Check if the user's email is verified
    if (!user.emailVerified) {
      showMessage({
        message: 'Email Not Verified',
        description: 'Please verify your email before logging in.',
        type: 'danger',
        icon: 'danger',
        duration: 8000,
      });
      return;
    }

    // Fetch the user's role from Firestore
    const userRole = await getUserRole(user.uid);

    // Handle if role fetching fails
    if (!userRole) {
      showMessage({
        message: 'Login Error',
        description: 'Failed to fetch your account role. Please try again.',
        type: 'danger',
        icon: 'danger',
        duration: 8000,
      });
      return;
    }

    // Check if the user's role matches the selected role
    if (userRole !== selectedRole) {
      showMessage({
        message: 'Login Error',
        description: `You are trying to log in as a ${selectedRole}, but your account role is ${userRole}.`,
        type: 'danger',
        icon: 'danger',
        duration: 8000,
      });
      return;
    }

    // Save user token and role to AsyncStorage
    await AsyncStorage.setItem('userToken', user.uid);
    await AsyncStorage.setItem('userRole', userRole);

   // JavaScript: In your handleLogin function
if (userRole === 'child') {
  // Save the child UID using the native method
  AppBlockerModule.saveChildUID(user.uid)
    .then(() => {
      console.log('Child UID saved successfully.');
    })
    .catch((error: any) => {
      console.error('Error saving Child UID:', error);
    });

  // Initialize restricted apps for the child
  AppBlockerModule.initializeRestrictedApps()
    .then((result: string) => {
      console.log(result); // Output: "Restricted apps initialized"
    })
    .catch((error: any) => {
      console.error('Error initializing restricted apps:', error);
    });

  // Upload installed apps and navigate
  await uploadInstalledApps(user.uid);
  navigation.navigate('_childLayout', { childUUID: user.uid });
} else {
      // Navigate to the parent's layout
      navigation.navigate('_parentLayout');
    }

    // Show success message
    showMessage({
      message: 'Login Successful',
      description: `Welcome ${user.email}`,
      type: 'success',
      icon: 'success',
      duration: 8000,
    });
  } catch (error: any) {
    // Handle login errors
    showMessage({
      message: 'Login Error',
      description: error.message || 'An unexpected error occurred.',
      type: 'danger',
      icon: 'danger',
      duration: 8000,
    });
  } finally {
    setLoading(false); // Stop loading after completion
  }
};
//......................................................................................................................................
// Handle Signup
export const handleSignup = async (
  email: string,
  password: string,
  confirmPassword: string,
  selectedRole: string,
  otherData: any,
  navigation: any,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true); // Start loading
  const { isValid } = validatePassword(password);

  if (!isValid || password !== confirmPassword) {
    showMessage({
      message: 'Password Error',
      description: 'Passwords do not match or are invalid.',
      type: 'danger',
      icon: 'danger',
      duration: 8000,
    });
    setLoading(false); // Stop loading
    return;
  }

  try {
    // Sign up the user with email and password
    const userCredential = await signUpWithEmailPassword(email, password);
    const user = userCredential.user;

    // Generate UUID for child role
    const childUUID = selectedRole === 'child' ? uuidv4() : null;

    // Store user data in Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      role: selectedRole,
      email,
      age: otherData.age,
      firstName: otherData.firstName,
      lastName: otherData.lastName,
      uuid: childUUID, // Store UUID if the user is a child
    });

    // Show success message and prompt email verification
    showMessage({
      message: 'Signup Successful',
      description: `Verification email sent to ${email}. Please verify your email before logging in.`,
      type: 'success',
      icon: 'success',
      duration: 3000,
    });

    // Navigate back after a delay
    setTimeout(() => {
      navigation.goBack();
    }, 5000);
  } catch (error) {
    // Show error message if signup fails
    showMessage({
      message: 'Signup Error',
      description: error.message,
      type: 'danger',
      icon: 'danger',
      duration: 8000,
    });
  } finally {
    setLoading(false); // Stop loading
  }
};


//......................................................................................................................................


// Send email verification link
export const sendVerificationEmail = async (email: string) => {
  const auth = getAuth();
  try {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      showMessage({
        message: 'Verification Email Sent',
        description: `A verification link has been sent to ${email}. Please check your inbox.`,
        type: 'success',
        icon: 'success',
      });
    }
  } catch (error) {
    showMessage({
      message: 'Error',
      description: 'Failed to send verification email.',
      type: 'danger',
      icon: 'danger',
    });
  }
};

// Check if the user's email is verified
export const checkEmailVerified = async () => {
  const auth = getAuth();
  try {
    const user = auth.currentUser;
    if (user) {
      await reload(user); // Reload user to get the latest email verification status
      return user.emailVerified;
    }
    return false;
  } catch (error) {
    showMessage({
      message: 'Error',
      description: 'Unable to verify email status.',
      type: 'danger',
      icon: 'danger',
    });
    return false;
  }
};


//......................................................................................................................................


// Handle Next Step
export const handleNextStep = (step: number, age: string, firstName: string, lastName: string, address: string,  password: string, confirmPassword: string, setStep: (step: number) => void) => {
  if (step === 1 && age && firstName && lastName && address) {
    setStep(2);
  } else if (step === 2  && password && confirmPassword) {
    const { isValid, errorMessage } = validatePassword(password);
    if (!isValid) {
      showMessage({ message: 'Password Error', description: errorMessage, type: 'danger', icon: 'danger', duration: 8000 });
    } else {
      setStep(3);
    }
  } else {
    showMessage({ message: 'Error', description: 'Please fill in all required fields.', type: 'danger', icon: 'danger', duration: 8000 });
  }
};
// HandleBack
export const handleBack = (step: number, setStep: (step: number) => void, setSelectedForm: (form: 'login' | 'signup') => void) => {
  if (step > 1) {
    setStep(step - 1);
  } else {
    setSelectedForm('login');
  }
};
//......................................................................................................................................
 