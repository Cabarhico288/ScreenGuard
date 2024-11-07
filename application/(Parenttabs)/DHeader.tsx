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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserData } from '../services/userDataService'; 

const { height } = Dimensions.get('window');

const Header: React.FC = () => {
  const [parentName, setParentName] = useState({ firstName: '', lastName: '' });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedImage, setSelectedImage] = useState(
    require('../../assets/images/child/profile1.png') // Default profile image
  );
  const [imagePaths, setImagePaths] = useState<any[]>([]);

  const bubbleAnimation1 = useRef(new Animated.Value(0)).current;
  const bubbleAnimation2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async (userId: string) => {
      try {
        const userData = await fetchUserData(userId);
        setParentName(userData);

        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) setSelectedImage(JSON.parse(savedImage));
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchData(user.uid);
      else setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load images from the child folder
  useEffect(() => {
    const loadImages = () => {
      const images = [
        require('../../assets/images/parent/profileparent1.png'),
        require('../../assets/images/parent/profileparent2.png'),
        require('../../assets/images/parent/profileparent3.png'),
        require('../../assets/images/parent/profileparent4.png'),
      ];
      setImagePaths(images);
    };
    loadImages();
  }, []);

  const handleImageSelect = async (image: any) => {
    setSelectedImage(image);
    await AsyncStorage.setItem('profileImage', JSON.stringify(image));
    setModalVisible(false);
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnimation1, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnimation1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnimation2, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnimation2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY1 = bubbleAnimation1.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -100],
  });

  const translateY2 = bubbleAnimation2.interpolate({
    inputRange: [0, 1],
    outputRange: [height, -150],
  });

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.headerContainer}>
      <Animated.View
        style={[
          styles.bubble,
          { width: 100, height: 100, bottom: 0, left: -50, transform: [{ translateY: translateY1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.bubble,
          { width: 80, height: 80, bottom: -30, right: -40, transform: [{ translateY: translateY2 }] },
        ]}
      />

      <View style={styles.textContainer}>
        <Text style={styles.greetingText}>
          Hi {parentName.firstName} {parentName.lastName}
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
            <Image source={item} style={styles.imageThumbnail} />
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
    position: 'relative',
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
  textContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(135, 206, 250, 0.5)',
    borderRadius: 50,
  },
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

export default Header;
