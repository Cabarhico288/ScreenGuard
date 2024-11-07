import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';
import { showMessage } from 'react-native-flash-message';
import { saveUserRole, getUserRole } from './firestoreService'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const _signInWithGoogle = async (navigation, selectedRole, setLoading) => {
  setLoading(true); // Start loading
  try {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '59383951828-qb332incpf3oseq6c6b8fpi1vcdgtgqs.apps.googleusercontent.com', // Your web client ID from Firebase
      offlineAccess: true, // Request offline access for a refresh token
      scopes: ['profile', 'email'],
    });

    await GoogleSignin.hasPlayServices(); // Ensure Google Play services are available

    // Perform the Google Sign-In and retrieve user info
    const userInfo = await GoogleSignin.signIn(); // Get the signed-in user info

    // Correct way to retrieve tokens
    const tokens = await GoogleSignin.getTokens(); // Get tokens including idToken and accessToken

    const idToken = tokens.idToken; // Extract idToken

    if (idToken) {
      // Create a Google credential with the idToken
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const userId = userCredential.user.uid;

      // Fetch the user's role from Firestore or handle first-time sign-in
      let userRole = await getUserRole(userId);

      if (!userRole) {
        userRole = selectedRole; // Assign selected role if none found
        await saveUserRole(userId, userRole); // Save role in Firestore or your DB
      }

      if (userRole !== selectedRole) {
        showMessage({
          message: 'Role Mismatch',
          description: `You selected ${selectedRole}, but your account role is ${userRole}.`,
          type: 'danger',
          icon: 'danger',
          duration: 8000,
        });
        return;
      }

      // Success message
      showMessage({
        message: 'Google Login Successful',
        description: `Welcome ${userCredential.user.email}`,
        type: 'success',
      });

      // Navigate to the correct layout based on role
      navigation.replace(userRole === 'parent' ? '_parentLayout' : '_childLayout');
    } else {
      throw new Error('Google sign-in failed. No ID token received.');
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    showMessage({
      message: 'Google Sign-In Error',
      description: error.message || 'An error occurred during Google sign-in.',
      type: 'danger',
    });
  } finally {
    setLoading(false); // Stop loading
  }
};

// Handle Facebook Sign-In using react-native-fbsdk-next
export const _signInWithFacebook = async (navigation, selectedRole, setLoading) => {
  setLoading(true); // Start loading
  try {
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
    const userCredential = await auth().signInWithCredential(facebookCredential);
    const userId = userCredential.user.uid;

    // Fetch the user's role from Firestore
    let userRole = await getUserRole(userId);

    if (!userRole) {
      userRole = selectedRole;
      await saveUserRole(userId, userRole);
    }

    if (userRole !== selectedRole) {
      showMessage({
        message: 'Role Mismatch',
        description: `You selected ${selectedRole}, but your account role is ${userRole}.`,
        type: 'danger',
        icon: 'danger',
        duration: 8000,
      });
      return;
    }

    // Store userToken and userRole in AsyncStorage
    await AsyncStorage.setItem('userToken', userId);
    await AsyncStorage.setItem('userRole', userRole);

    showMessage({
      message: 'Facebook Login Successful',
      description: `Welcome ${userCredential.user.email}`,
      type: 'success',
    });

    navigation.replace(userRole === 'parent' ? '_parentLayout' : '_childLayout');
  } catch (error) {
    console.error('Facebook Sign-In Error:', error);
    showMessage({
      message: 'Facebook Sign-In Error',
      description: error.message || 'An error occurred during Facebook sign-in.',
      type: 'danger',
    });
  } finally {
    setLoading(false); // Stop loading
  }
};
