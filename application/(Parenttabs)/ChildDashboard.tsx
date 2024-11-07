import React, { useState, useEffect, useRef,  } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, Alert, RefreshControl, Image } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // Use Expo icons
import { connectToChild, fetchLinkedChild } from '../services/childHandlers'; // Import the connection handler
import { auth, firestore } from '../firebase'; // Firebase auth to get parent ID
import { showMessage } from 'react-native-flash-message'; // For showing flash messages
import QRCodeScanner from 'react-native-qrcode-scanner'; // QR code scanner
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import navigation hook
import { RootStackParamList } from '../types/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions

const screenWidth = Dimensions.get('window').width;

interface ChildDashboardProps {
  ParentName: string;
  profileImages: string[];
  fontsLoaded: boolean;
  locations: string[];
  notifications: string[];
  schedules: string[];
}
const ChildDashboard: React.FC<ChildDashboardProps> = ({ profileImages, locations }) => {
  const [selectedChild, setSelectedChild] = useState<number | null>(null); // State to track selected child
  const scrollViewRef = useRef<ScrollView>(null);
  const [showModal, setShowModal] = useState(false); 
  const [showScanner, setShowScanner] = useState(false);// Controls modal visibility
  const [activeIndex, setActiveIndex] = useState(0);
  const [childUUIDInput, setChildUUIDInput] = useState(''); // Holds the input UUID
  const [addedChildUUID, setAddedChildUUID] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false); // Toggle for scanning
  const [children, setChildren] = useState([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false); 
  const [refresh, setRefresh] = useState(false); // Track refresh state
  const functionalities = [
    { name: 'Web Filtering', icon: 'globe', backgroundColor: '#f8b400', textColor: '#fff' },
    { name: 'Location of Child', icon: 'map-marker-alt', backgroundColor: '#007bff', textColor: '#fff' },
    { name: 'App Scheduling', icon: 'calendar-alt', backgroundColor: '#28a745', textColor: '#fff' },
    { name: 'Download Approval', icon: 'download', backgroundColor: '#dc3545', textColor: '#fff' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % functionalities.length;
      scrollViewRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
      setActiveIndex(nextIndex);
    }, 2000);
    return () => clearInterval(interval);
  }, [activeIndex]);
 
  
  useEffect(() => {
    fetchChildren(); // Fetch children on component mount and after adding a new child
  }, [refresh]);

  // Function to handle child item press.............................................................................................
  const handleChildOptions = async (child) => {
    try {
      const parentId = auth.currentUser?.uid;
      if (!parentId) {
        showMessage({
          message: 'Error',
          description: 'Parent not logged in.',
          type: 'danger',
          icon: 'danger',
        });
        return;
      }
  
      const childAuthUID = await fetchLinkedChildAuthUID(parentId);
      if (childAuthUID) {
        Alert.alert(
          'Select Action',
          `What do you want to do with ${child.firstName}?`,
          [
            { text: 'Manage', onPress: () => manageChild(child) },
            { text: 'Delete', onPress: () => deleteChild(child) },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        showMessage({
          message: 'Error',
          description: 'No linked child found for this account.',
          type: 'danger',
          icon: 'danger',
        });
      }
    } catch (error) {
      console.error('Error handling child options:', error);
    }
  };
  
  
  
  // Handle pull-to-refresh action
  const onRefresh = async () => {
    setRefreshing(true); // Start refreshing
    await fetchChildren(); // Fetch child data again
    setRefreshing(false); // Stop refreshing
  };

  
    // Placeholder function for managing child (modify as needed)...................................................................
  // Updated manageChild function
const manageChild = (child) => {
  navigation.navigate('ManageChild', {
    childUUID: child.uuid,
    childDetails: {
      firstName: child.firstName,
      lastName: child.lastName,
      profileIcon: child.profileIcon, // Include the profile icon
    },
  });
};


    // Placeholder function to delete child
    const deleteChild = (child) => {
      setChildren(children.filter(c => c !== child)); // Remove child from state
      showMessage({
        message: 'Child Deleted',
        description: `${child.firstName} has been removed.`,
        type: 'danger',
        icon: 'danger',
      });
    };
  
  // Function to handle opening the modal
  const openModal = () => {
    setShowModal(true); // Show the modal when "Add Child" is pressed
  };

//..........................................................................................................................
const fetchChildren = async () => {
  const parentId = auth.currentUser?.uid;
  if (parentId) {
    const childAuthUID = await fetchLinkedChildAuthUID(parentId);
    if (childAuthUID) {
      const childData = await fetchChildDataUsingAuthUID(childAuthUID);
      if (childData) {
        setChildren([childData]);  // Store fetched data in state
      } else {
        console.warn("No data found for child with authUID:", childAuthUID);
      }
    }
  }
};
// Helper function to get the correct image source based on profileIcon ID
const getProfileImageSource = (iconId) => {
  switch (iconId) {
    case 'profile1':
      return require('../../assets/images/child/profile1.png');
    case 'profile2':
      return require('../../assets/images/child/profile2.png');
    case 'profile3':
      return require('../../assets/images/child/profile3.png');
    case 'profile4':
      return require('../../assets/images/child/profile4.png');
  }
};

// Function to fetch child's complete data using authUID
const fetchChildDataUsingAuthUID = async (authUID) => {
  try {
    // Query Firestore for a user document where the authUID field matches the provided authUID
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("authUID", "==", authUID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming there's only one document matching the authUID
      return querySnapshot.docs[0].data();  // Return the child's complete data
    } else {
      console.warn("No user found with the provided authUID.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching child data using authUID:", error);
    return null;
  }
};

const fetchLinkedChildAuthUID = async (parentId) => {
  try {
    const userDocRef = doc(firestore, 'users', parentId);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.linkedChildAuthUID;  // Use linkedChildAuthUID which stores authUID of child
    } else {
      console.warn('Parent user data not found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching linked child Auth UID:', error);
    return null;
  }
};
// Function to handle QR Code Scan
const handleQRCodeScan = async (e) => {
  const scannedCode = e.data;
  setScanning(false); // Reset scanning state after scan is complete
  setShowScanner(false); // Close the scanner modal

  if (scannedCode) {
    setChildUUIDInput(''); // Clear any previously entered child UUID

    try {
      const parentId = auth.currentUser?.uid;
      if (!parentId) {
        showMessage({
          message: 'Error',
          description: 'Parent not logged in.',
          type: 'danger',
          icon: 'danger',
        });
        return;
      }

      // Fetch the child AuthUID based on the scanned QR code
      const childAuthUID = await fetchChildAuthUID(scannedCode);
      if (!childAuthUID) {
        showMessage({
          message: 'Error',
          description: 'Child Auth UID not found or invalid.',
          type: 'danger',
          icon: 'danger',
        });
        setShowModal(true); // Show modal again for retry
        return;
      }

      // Check if the child is already connected to the parent
      const linkedChildAuthUID = await fetchLinkedChildAuthUID(parentId);
      if (linkedChildAuthUID === childAuthUID) {
        showMessage({
          message: 'Already Connected',
          description: 'This child is already linked to your account.',
          type: 'warning',
          icon: 'warning',
        });
        return;
      }

      // Automatically attempt to connect to the child using the scanned AuthUID
      const result = await connectToChild(childAuthUID, parentId);
      if (result.success) {
        showMessage({
          message: 'Child Added',
          description: `Child with Auth UID: ${childAuthUID} has been added successfully.`,
          type: 'success',
          icon: 'success',
        });
        setAddedChildUUID(scannedCode);
        setShowModal(false); // Close modal after successful connection
      } else {
        // Handle error if the connection failed
        showMessage({
          message: 'Error',
          description: result.message,
          type: 'danger',
          icon: 'danger',
        });
        setShowModal(true); // Show modal again for retry
      }
    } catch (error) {
      // Handle unexpected errors
      showMessage({
        message: 'Error',
        description: 'Failed to connect to the child. Please try again.',
        type: 'danger',
        icon: 'danger',
      });
      setShowModal(true); // Show modal again for retry
    }
  } else {
    // Handle invalid QR Code scenario
    showMessage({
      message: 'Error',
      description: 'Invalid QR Code. Please scan again.',
      type: 'danger',
      icon: 'danger',
    });
    setShowModal(true); // Show modal again for retry
  }
};



const fetchChildAuthUID = async (childUID) => {
  const childDocRef = doc(firestore, 'users', childUID);
  const docSnap = await getDoc(childDocRef);

  if (!docSnap.exists()) {
    console.log("No such document!");
    return null;
  } else {
    const childData = docSnap.data();
    return childData.authUID || null;
  }
};


  // Function to handle adding a new child and connecting to the child via UUID
 const handleAddChild = async () => {
  if (childUUIDInput.trim() === '') {
    showMessage({
      message: 'Error',
      description: 'Please enter or scan a valid child UUID.',
      type: 'danger',
      icon: 'danger',
    });
    return;
  }

  try {
    const parentId = auth.currentUser?.uid;
    if (!parentId) {
      showMessage({
        message: 'Error',
        description: 'Parent not logged in.',
        type: 'danger',
        icon: 'danger',
      });
      return;
    }

      // Call the business logic function to connect to the child
      const result = await connectToChild(childUUIDInput, parentId);
      if (result.success) {
        setRefresh(!refresh);
        setAddedChildUUID(childUUIDInput);
        setShowModal(false);
        setChildUUIDInput('');

        // Show success message after successful connection
        showMessage({
          message: 'Child Added',
          description: `Child with UUID: ${childUUIDInput} has been added successfully.`,
          type: 'success',
          icon: 'success',
        });
      } else {
        // Handle the case where the UUID is already linked
        showMessage({
          message: 'Error',
          description: result.message,
          type: 'danger',
          icon: 'danger',
        });
      }

    } catch (error) {
      // Show error message in case of failure
      showMessage({
        message: 'Error',
        description: 'Failed to connect to the child. Please try again.',
        type: 'danger',
        icon: 'danger',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
    {/* Child Container with Add Child Button */}
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    <View style={styles.childContainer}>
    {children.length === 0 ? (
  <Text>No children linked yet</Text>
) : (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {children.map((child, index) => (
    <TouchableOpacity
      key={index}
      style={styles.profileImageWrapper}
      onPress={() => handleChildOptions(child)} // Handle press for options
    >
      {child.profileIcon ? (
        <Image source={getProfileImageSource(child.profileIcon)} style={styles.profileImageIcon} />
      ) : (
        <Ionicons name="person-circle" size={60} color="black" style={styles.profileImage} />
      )}
      <Text style={styles.profileName}>{child.firstName || `Child ${index + 1}`}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>

)}


    {/* Add Child Button */}
    <TouchableOpacity style={styles.addChildButton} onPress={openModal}>
      <Ionicons name="add-circle" size={60} color="#4CAF50" />
      <Text style={styles.addChildText}>Add Child</Text>
    </TouchableOpacity>
  </View>
  
    {/* Swipeable Containers for Functionalities */}
    <View style={styles.swipeContainer}>
      <Text style={styles.greetingText}>Application Functionalities</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {functionalities.map((func, index) => (
          <View
            key={index}
            style={[styles.functionContainer, { backgroundColor: func.backgroundColor }]}
          >
            <FontAwesome5 name={func.icon} size={50} color={func.textColor} />
            <Text style={[styles.functionText, { color: func.textColor }]}>{func.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  
    {/* Modal for entering child UUID */}
  {/* Modal for entering child UUID */}
{showModal && (
  <Modal visible={showModal} animationType="slide" transparent={true}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {/* Modal Title with Icon */}
        <View style={styles.modalTitleContainer}>
          <Ionicons name="person-add" size={24} color="#4CAF50" style={styles.modalIcon} />
          <Text style={styles.modalTitle}>Enter or Scan Child UUID</Text>
        </View>

        {/* Input Field with Icon */}
        <View style={styles.inputContainer}>
          <FontAwesome5 name="id-card" size={20} color="#333" style={styles.inputIcon} />
          <TextInput
            value={childUUIDInput}
            onChangeText={setChildUUIDInput}
            style={styles.input}
            placeholder="Enter Child UUID"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          onPress={() => {
            setScanning(true);
            setShowScanner(true); // Open the scanner modal
          }}
          style={styles.confirmButton}
        >
          <Ionicons name="camera" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.confirmButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        {/* Add Child Button */}
        <TouchableOpacity onPress={handleAddChild} style={styles.confirmButton}>
          <Ionicons name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.confirmButtonText}>Add Child</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => {
            setShowModal(false);
            setChildUUIDInput('');
            setScanning(false); // Reset scanning state when closing the modal
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}

  
    {/* QR Code Scanner Modal */}
    {showScanner && (
      <Modal visible={showScanner} animationType="slide" transparent={true}>
        <View style={styles.qrScannerContainer}>
          <QRCodeScanner
            onRead={handleQRCodeScan}
            showMarker={true}
            cameraStyle={styles.fullScreenCamera} // Full-screen camera style
            topContent={<Text style={styles.scanText}>Scan the QR code</Text>}
            bottomContent={
              <View style={styles.bottomContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setScanning(false);   // Hide the camera
                    setShowScanner(false);  // Close the scanner modal
                    setShowModal(true);    // Show the UUID modal again
                  }}
                >
                  <Text style={styles.cancelButtonscanText}>Cancel Scan</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </Modal>
    )}
  </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  //....................Scanner...................................................................
  qrScannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Full screen black background for QR scanner
  },
  fullScreenCamera: {
    flex: 1, // Takes up available screen space
    justifyContent: 'center', // Centers camera vertically
    alignItems: 'center', // Centers camera horizontally
    width: '100%',
    height: '100%',  // Full-screen height
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute', 
    bottom: 40,  // This places the button near the bottom
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    width: '80%',  // Adjust width
    alignItems: 'center',
    marginBottom: 20,  // Adds space between button and the bottom
  },
  
  cancelButtonscanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  //.............................................................................................

//..............Modal Buttons..................................................................................
 modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
 
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    marginRight: 10, // Space between the icon and title
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  inputIcon: {
    marginRight: 10, // Space between the icon and the text input
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 15,
  },
  buttonIcon: {
    marginRight: 10, // Space between the icon and button text
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
 
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
//................................................................................................


  contentContainer: {
    padding: 10,
  },
  childContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainerContent: {
    flexDirection: 'row',
  },
  profileImageWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  profileImage: {
    marginBottom: 5,
  },
  profileImageIcon: {
    width: 70,
    height: 70,
    borderRadius: 30, // To keep the image circular
  },
  profileName: {
    fontSize: 14,
    color: '#333',
  },
  addChildButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#E0F7E4', // Light green background for a subtle look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
    marginVertical: 10,
    marginHorizontal: 15,
  },
  addChildText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  uuidContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
 
  swipeContainer: {
    marginTop: 20,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  functionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth,
    paddingVertical: 30,
  },
  functionText: {
    fontSize: 16,
    marginTop: 10,
  },
  
});

export default ChildDashboard;
