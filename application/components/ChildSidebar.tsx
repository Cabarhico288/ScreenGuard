import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
  Image,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { RootStackParamList } from '../types/navigation';

interface ChildSidebarProps {
  sidebarPosition: Animated.Value;
  toggleSidebar: () => void;
  deviceId: string;
}

const ChildSidebar: React.FC<ChildSidebarProps> = ({
  sidebarPosition,
  toggleSidebar,
  deviceId,
}) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [childAuthUID, setChildAuthUID] = useState('');
  const [showAuthUIDModal, setShowAuthUIDModal] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCloseModal = () => {
    setShowAuthUIDModal(false);
  };

  const handleFetchChildAuthUID = async () => {
    const childId = auth.currentUser?.uid;
    if (!childId) {
      showMessage({
        message: 'Error',
        description: 'Child not logged in.',
        type: 'danger',
      });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', childId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().authUID) {
        setChildAuthUID(userDoc.data().authUID);
        setShowAuthUIDModal(true);
      } else {
        showMessage({
          message: 'AuthUID not found',
          description: 'Unable to find the AuthUID for this user.',
          type: 'danger',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Error fetching AuthUID',
        description: error.message || 'An error occurred.',
        type: 'danger',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      navigation.replace('RoleSelection');

      showMessage({
        message: 'Logged Out',
        description: 'You have been logged out successfully.',
        type: 'success',
        icon: 'success',
        duration: 4000,
      });
    } catch (error) {
      showMessage({
        message: 'Logout Failed',
        description: error.message || 'An error occurred.',
        type: 'danger',
        icon: 'danger',
        duration: 8000,
      });
    }
  };

  return (
    <Animated.View
      style={[
        styles.sidebarContainer,
        { left: sidebarPosition, width: Platform.OS === 'web' ? '30%' : '75%' },
      ]}
    >
      <View style={styles.sidebar}>
        <View style={styles.header}>
          <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
          <Text style={styles.profileName}>Child</Text>
        </View>

        <TouchableOpacity style={styles.sidebarItem} onPress={toggleSidebar}>
          <Ionicons name="person-outline" size={24} color="#333" style={styles.sidebarIcon} />
          <Text style={styles.sidebarItemText}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={handleFetchChildAuthUID}>
          <Ionicons name="link-outline" size={24} color="#007AFF" style={styles.sidebarIcon} />
          <Text style={styles.sidebarItemText}>Connect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={toggleSidebar}>
          <Ionicons name="settings-outline" size={24} color="#333" style={styles.sidebarIcon} />
          <Text style={styles.sidebarItemText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={toggleSidebar}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#333"
            style={styles.sidebarIcon}
          />
          <Text style={styles.sidebarItemText}>About</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF4C4C" style={styles.sidebarIcon} />
          <Text style={[styles.sidebarItemText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showAuthUIDModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Child AuthUID</Text>
            <Text style={styles.uuidText}>{childAuthUID}</Text>

            {childAuthUID && (
              <View style={styles.qrCodeContainer}>
                <QRCode value={childAuthUID} size={200} backgroundColor="#fff" />
              </View>
            )}

            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 10,
    padding: 20,
  },
  sidebar: {
   
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#7F3DFF',
  },
  profileName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sidebarIcon: {
    marginRight: 10,
  },
  sidebarItemText: {
    fontSize: 18,
    color: '#333',
  },
  logoutText: {
    color: '#FF4C4C',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  qrCodeContainer: {
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uuidText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ChildSidebar;
