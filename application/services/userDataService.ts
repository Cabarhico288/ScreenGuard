import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Use the firestore instance, not auth

// Function to fetch user data (first name and last name) from Firestore
export const fetchUserData = async (userId: string) => {
    try {
      const userDocRef = doc(firestore, 'users', userId); // Correct Firestore instance
      const docSnap = await getDoc(userDocRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return {
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
        };
      } else {
        console.log('No such document!');
        return { firstName: '', lastName: '' };
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { firstName: '', lastName: '' };
    }
  };