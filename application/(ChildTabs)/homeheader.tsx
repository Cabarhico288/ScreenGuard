import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserData } from '../services/userDataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const HomeHeader: React.FC = () => {
  
  const [parentName, setParentName] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Set profile1.png as the default selected image
  const [selectedImage, setSelectedImage] = useState<number>(require('../../assets/images/child/profile1.png'));
  const [imagePaths, setImagePaths] = useState<{ id: string; source: number }[]>([]);

  useEffect(() => {
    const fetchData = async (userId: string) => {
      try {
        const userData = await fetchUserData(userId);
        setParentName(userData);
  
        // Retrieve the saved image from AsyncStorage
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) {
          // Find the matching image source from imagePaths
          const matchingImage = imagePaths.find((image) => image.id === savedImage);
          if (matchingImage) {
            setSelectedImage(matchingImage.source);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user.uid);
      } else {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, [imagePaths]);

  // Load images with identifiers
  useEffect(() => {
    const loadImages = () => {
      const images = [
        { id: 'profile1', source: require('../../assets/images/child/profile1.png') },
        { id: 'profile2', source: require('../../assets/images/child/profile2.png') },
        { id: 'profile3', source: require('../../assets/images/child/profile3.png') },
        { id: 'profile4', source: require('../../assets/images/child/profile4.png') },
      ];
      setImagePaths(images);
    };
    loadImages();
    setLoading(false); // Set loading to false after loading images
  }, []);

  const handleImageSelect = async (image: { id: string; source: number }) => {
    setSelectedImage(image.source); // Set selected image for rendering
    await AsyncStorage.setItem('profileImage', image.id); // Store the image identifier
    setModalVisible(false); // Close the modal

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, { profileIcon: image.id }); // Save only the identifier to Firestore
      }
    } catch (error) {
      console.error("Error saving profile icon to Firestore:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.headerContainer}>
 

      <View style={styles.textContainer}>
        <Text style={styles.greetingText}>
          Hi {parentName.firstName}, {parentName.lastName}
        </Text>
        <Text style={styles.subText}>Welcome</Text>
      </View>

      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={selectedImage} style={styles.profileImage} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select a Profile Image</Text>
      
      <FlatList
        data={imagePaths}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.imageGrid}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleImageSelect(item)} style={styles.imageItem}>
          <Image source={item.source} style={styles.imageThumbnail} />
        </TouchableOpacity>
        )}
      />
      
      <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: 190,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: '#fffecb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: { flex: 1 },
  greetingText: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subText: { fontSize: 16, color: '#666', marginTop: 5 },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderColor: '#fff',
    borderWidth: 4,
  },
  bubble: { position: 'absolute', backgroundColor: 'rgba(135, 206, 250, 0.5)', borderRadius: 50 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay for better focus
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10, // For Android shadow
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  imageGrid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  imageItem: {
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden', // Ensure images stay within rounded corners
  },
  imageThumbnail: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
    borderRadius: 15,
  },
  closeButton: {
    marginTop: 15,
    width: '60%',
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Shadow for Android
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeHeader;
