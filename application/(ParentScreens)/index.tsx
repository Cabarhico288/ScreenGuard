import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ChildDashboard from '../(Parenttabs)/ChildDashboard';
import Header from '../(Parenttabs)/DHeader'; // Adjust path to match your structure

interface PHomeProps {
  fontsLoaded?: boolean; // Make fontsLoaded optional
}

const PHome: React.FC<PHomeProps> = ({ fontsLoaded = false }) => {
  const profileImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
    'https://example.com/image4.jpg',
  ];

  const locations = ['Park', 'School', 'Home', 'Mall'];
  const notifications = ['New message from school', 'App update available', 'Battery low'];
  const schedules = ['Math class', 'Soccer practice', 'Dentist appointment', 'Piano lessons'];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <View style={styles.dashboardContainer}>
        <ChildDashboard 
          ParentName="Parent" 
          profileImages={profileImages} 
          fontsLoaded={fontsLoaded} 
          locations={locations} 
          notifications={notifications} 
          schedules={schedules} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: Platform.OS === 'web' ? 2 : 2, 
    backgroundColor: 'white',
    marginTop: 0,  
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
});

export default PHome;
