import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Adjust path if needed

// Function to upload app data to Firestore
export const uploadAppData = async (childId, appData) => {
  try {
    const appRef = doc(firestore, `users/${childId}/applications/${appData.packageName}`);
    await setDoc(appRef, appData); 
    console.log('App data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading app data:', error);
  }
};