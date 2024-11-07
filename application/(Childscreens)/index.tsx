import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import HomeHeader from '../(ChildTabs)/homeheader'; // Adjust the import path
import HomeDashboard from '../(ChildTabs)/homedashboard'; // Adjust the import path
import { getAuth } from 'firebase/auth'; // Firebase auth
import { fetchUserData } from '../services/userDataService';// Adjust the import path for fetching user data

const { width } = Dimensions.get('window');
const sidebarPosition = new Animated.Value(-width);

const Home: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userData, setUserData] = useState<{ firstName: string; lastName: string } | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const user = await fetchUserData(currentUser.uid); // Fetch first and last name from Firestore
          setUserData(user);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    Animated.timing(sidebarPosition, {
      toValue: sidebarVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [sidebarVisible]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={styles.container}>
      {/* Header Container */}
      <View style={styles.headerContainer}>
        {/* Pass userData to HomeHeader */}
        <HomeHeader/>
      </View>

      {/* Dashboard Container */}
      <View style={styles.dashboardContainer}>
        <HomeDashboard />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    borderBottomLeftRadius: 20,  
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, 
    flex: 0.5, 
  },
  dashboardContainer: {
    flex: 2,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
});

export default Home;
