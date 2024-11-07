import { doc, updateDoc, getDocs, collection, query, where, getDoc } from "firebase/firestore";
import { firestore } from '../firebase'; // adjust import path
import { showMessage } from 'react-native-flash-message';
// Function to handle parent connecting to a child via UUID
// Function to handle parent connecting to a child via UUID
export const connectToChild = async (childUUID: string, parentId: string) => {
  try {
    // Fetch the parent document to get the linkedChildUUID if already exists
    const parentDocRef = doc(firestore, 'users', parentId);
    const parentDoc = await getDoc(parentDocRef);

    if (!parentDoc.exists()) {
      console.warn('Parent user data not found.');
      showMessage({
        message: 'Error',
        description: 'Parent user data not found.',
        type: 'danger',
        icon: 'danger',
      });
      return { success: false, message: 'Parent user data not found.' };
    }

    // Fetch the child's document to verify the child's UUID and fetch the AuthID
    const childDocRef = doc(firestore, 'users', childUUID);
    const childDoc = await getDoc(childDocRef);
    if (!childDoc.exists() || !childDoc.data().authUID) {
      console.warn('Child Auth UID not found or invalid.');
      showMessage({
        message: 'Error',
        description: 'Child Auth UID not found or invalid.',
        type: 'danger',
        icon: 'danger',
      });
      return { success: false, message: 'Child Auth UID not found or invalid.' };
    }

    const childAuthUID = childDoc.data().authUID;

    // Update the parent document to link the child UUID along with AuthID for consistency
    await updateDoc(parentDocRef, {
      linkedChildUUID: childUUID,
      linkedChildAuthUID: childAuthUID // Storing AuthID as a part of the connection information
    });

    showMessage({
      message: 'Success',
      description: `Parent is now linked to child with UUID: ${childUUID} and AuthID: ${childAuthUID}`,
      type: 'success',
      icon: 'success',
    });
    return { success: true, message: `Parent is now linked to child with UUID: ${childUUID} and AuthID: ${childAuthUID}` };

  } catch (error) {
    console.error('Error connecting to child:', error);
    showMessage({
      message: 'Error',
      description: 'Failed to connect to the child. Please try again.',
      type: 'danger',
      icon: 'danger',
    });
    return { success: false, message: error.message || 'Failed to connect to child. Please try again.' };
  }
};

export const fetchLinkedChild = async (parentId: string) => {
  try {
    // Fetch the parent document
    const parentDocRef = doc(firestore, 'users', parentId);
    const parentDocSnap = await getDoc(parentDocRef);

    if (parentDocSnap.exists()) {
      const parentData = parentDocSnap.data();
      const childUUID = parentData?.linkedChildUUID;

      if (childUUID) {
        // Query Firestore to find the child document with the matching UUID field
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("uuid", "==", childUUID));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one document matching the UUID
          const childDocSnap = querySnapshot.docs[0];
          return childDocSnap.data(); // Return linked child data
        } else {
          console.log("No child document found with the specified UUID.");
          return null;
        }
      }
    }

    return null; // No child linked
  } catch (error) {
    console.error('Error fetching linked child:', error);
    return null;
  }
};
