import { firestore } from '../firebase'; // Firestore instance from firebase.ts
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Correct Firestore imports

/**
 * Save user role to Firestore.
 * @param uid - User ID
 * @param role - User role (e.g., 'parent', 'child')
 */
export const saveUserRole = async (uid: string, role: string) => {
  try {
    await setDoc(doc(firestore, 'users', uid), { role });
    console.log('User role saved successfully');
  } catch (error) {
    console.error('Error saving role to Firestore:', error);
    throw error; // Re-throw the error to handle it outside
  }
};

/**
 * Get user role from Firestore.
 * @param uid - User ID
 * @returns User role if exists, otherwise `null`
 */
export const getUserRole = async (uid: string): Promise<string | null> => {
  try {
    const userDocRef = doc(firestore, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const role = userDoc.data()?.role;
      console.log(`Fetched user role: ${role}`);
      return role || null;
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user role from Firestore:', error);
    return null; // Return `null` if an error occurs
  }
};
