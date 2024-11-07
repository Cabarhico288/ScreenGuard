import { StyleSheet, Platform } from 'react-native';
export const styles = StyleSheet.create({
    contentContainer: {
      flexGrow: 1,
      padding: 5,
    },
    dashboardContainer: {
      flex: 1,
    },
  
    /* Device Usage Section */
    usageContainer: {
      marginBottom: 20,
      padding: 15,
      borderRadius: 20,
      backgroundColor: '#fff',
    },
    usageDetails: {
      paddingTop: 10,
    },
    Applications: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    usageItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    usageLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    usageValue: {
      fontSize: 16,
      color: '#666',
    },
  
    /* App Schedules Section */
    applicationsContainer: {
      marginBottom: 20,
    },
    scheduleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 15,
      backgroundColor: '#f7f7f7',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    scheduleTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginLeft: 10,
      marginBottom: 5,
    },
    scheduleTime: {
      fontSize: 14,
      color: '#888',
      marginLeft: 10,
    },
  
    /* Tasks Section */
    tasksContainer: {
      paddingVertical: 20,
      paddingHorizontal: 15,
      borderRadius: 20,
      backgroundColor: '#fff',
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    taskCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 15,
      backgroundColor: '#f7f7f7',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    taskTitle: {
      fontSize: 16,
      color: '#333',
      marginLeft: 10,
      marginBottom: 5,
    },
    taskTime: {
      fontSize: 14,
      color: '#888',
      marginLeft: 10,
    },
  });