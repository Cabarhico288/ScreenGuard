import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ChildHeader from '../(Parenttabs)/Managechildheader';
import Dashboard from '../(Parenttabs)/ManagechildDashboard';

const ManageChildScreen = ({ route }) => {
  const { childDetails } = route.params; // Extract childDetails from route params

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Pass childDetails to the ChildHeader */}
        <ChildHeader childDetails={childDetails} />
      </View>
      <View style={styles.dashboardContainer}>
        <Dashboard />
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
    flex: Platform.OS === 'web' ? 2 : 1.8, 
    backgroundColor: 'white',
    marginTop: 0,  
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
});

export default ManageChildScreen;
