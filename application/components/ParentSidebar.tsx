  import React, { useState } from 'react';
  import { View, TouchableOpacity, StyleSheet, Text, Animated, Image, Switch, Platform } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { useNavigation } from '@react-navigation/native';
  import { StackNavigationProp } from '@react-navigation/stack';
  import { RootStackParamList } from '../types/navigation';
  import  { showMessage } from 'react-native-flash-message';
  import { auth } from '../firebase'; // Import Firebase auth
  import AsyncStorage from '@react-native-async-storage/async-storage'; 
  import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
  interface ParentSidebarProps {
    sidebarPosition: Animated.Value;
    toggleSidebar: () => void;
  }
  const Stack = createNativeStackNavigator();
  const ParentSidebar: React.FC<ParentSidebarProps> = ({ sidebarPosition, toggleSidebar }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    // Toggle Dark Mode
    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
    };


//...............................................................................................................................
    const handleLogout = async () => {
      try {
        await auth.signOut(); // Sign out from Firebase
    
        // Clear session data from AsyncStorage
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');
    
        // Navigate to the login screen
        navigation.replace('RoleSelection'); // Use replace to avoid going back to the previous screen
    
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
          description: error.message || 'An error occurred while logging out.',
          type: 'danger',
          icon: 'danger',
          duration: 8000,
        });
      }
    };

  //.........................................................................................................................
    return (
      <Animated.View
        style={[
          styles.sidebarContainer,
          { left: sidebarPosition, width: Platform.OS === 'web' ? '30%' : '75%' } // Adjust width for web
        ]}
      >
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
            <Text style={styles.profileName}>Parent</Text>
          </View>
          <TouchableOpacity style={styles.sidebarItem} onPress={() => navigation.navigate('AccountSetting')}>
            <Ionicons name="person-outline" size={24} color="#333" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItemText}>Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} onPress={() => navigation.navigate('Setting')}>
            <Ionicons name="settings-outline" size={24} color="#333" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} onPress={() => navigation.navigate('About')}>
            <Ionicons name="information-circle-outline" size={24} color="#333" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItemText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF4C4C" style={styles.sidebarIcon} />
            <Text style={[styles.sidebarItemText, styles.logoutText]}>Log Out</Text>
          </TouchableOpacity>
          
        </View>
      </Animated.View>
    );
  };

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  sidebar: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 25,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
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
    marginRight: 15,
  },
  sidebarItemText: {
    fontSize: 18,
    color: '#333',
  },
  logoutText: {
    color: '#FF4C4C',
    fontWeight: 'bold',
  },
  darkModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkModeText: {
    fontSize: 18,
    color: '#333',
  },
});

export default ParentSidebar;
