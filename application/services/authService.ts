  import { auth } from '../firebase'; // Import your initialized auth from firebase.ts
  import { 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    signInWithCredential, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    UserCredential 
  } from 'firebase/auth';

  /**
   * Sign in using Google credentials.
   * @param accessToken - Google access token.
   * @returns UserCredential
   */
  export const signInWithGoogle = async (accessToken: string): Promise<UserCredential> => {
    const credential = GoogleAuthProvider.credential(null, accessToken);
    return await signInWithCredential(auth, credential);
  };

  /**
   * Sign in using Facebook credentials.
   * @param accessToken - Facebook access token.
   * @returns UserCredential
   */
  export const signInWithFacebook = async (accessToken: string): Promise<UserCredential> => {
    const credential = FacebookAuthProvider.credential(accessToken);
    return await signInWithCredential(auth, credential);
  };

  /**
   * Sign in using email and password.
   * @param email - User's email.
   * @param password - User's password.
   * @returns UserCredential
   */
  export const signInWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Sign up using email and password.
   * @param email - User's email.
   * @param password - User's password.
   * @returns UserCredential
   */
  export const signUpWithEmailPassword = async (email: string, password: string): Promise<UserCredential> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user); // Send email verification
    return userCredential;
  };
