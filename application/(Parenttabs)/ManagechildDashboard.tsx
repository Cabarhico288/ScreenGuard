import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Image, TextInput, ActivityIndicator, SectionList, FlatList, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getDatabase, ref, get, set, remove  } from 'firebase/database';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useRoute, RouteProp } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message'; 
import { RootStackParamList } from '../types/navigation'; 
import { doc, getDoc } from 'firebase/firestore';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getAuth } from 'firebase/auth';
const { width } = Dimensions.get('window');

// Correct route prop typing
type DashboardRouteProp = RouteProp<RootStackParamList, 'ManageChild'>;
interface SectionData {
  title: string;
  data: App[];
}interface App {
  name: string;
  packageName: string;
  icon: string;
  category: string;
  blockStart?: string; // Add blockStart as optional
  blockEnd?: string; 
}
const Dashboard: React.FC = () => {
  const firestore = getFirestore(); // Initialize Firestore
  const route = useRoute<DashboardRouteProp>(); 
  const { childUUID } = route.params; 
  const [modalVisible, setModalVisible] = useState(false);
  const [usageApps, setUsageApps] = useState<any[]>([]);
  const [allApps, setAllApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [selectedApps, setSelectedApps] = useState<App[]>([]);
  //.................................................................................................
  const auth = getAuth();
  //.................................................................................................
  const [scheduleName, setScheduleName] = useState('');
  const toggleModal = () => setModalVisible(!modalVisible);
  const toggleModalSet = () => setModalVisible(!modalVisible); // Toggle modal visibility
  const [errorMessage, setErrorMessage] = useState('');
//..........................................SCHEDULES.......................................................
const [selectedApp, setSelectedApp] = useState(null);
  const [loadingSchedules, setLoadingSchedules] = useState(true); 
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async (authUID) => {
    try {
      const db = getDatabase();
      const schedulesRef = ref(db, `schedules/${authUID}`);
      const snapshot = await get(schedulesRef);
  
      if (snapshot.exists()) {
        const fetchedSchedules = snapshot.val();
  
        // Transform fetchedSchedules object into an array with scheduleName included
        const schedulesArray = Object.keys(fetchedSchedules).map((scheduleName) => {
          return {
            scheduleName,
            ...fetchedSchedules[scheduleName]
          };
        });
  
        setSchedules(schedulesArray);  // Update state with the new array structure
        setLoadingSchedules(false);
      } else {
        console.log("No schedules found for this user.");
        setSchedules([]);  // Set an empty array if no schedules exist
        setLoadingSchedules(false);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules([]);
      setLoadingSchedules(false);
    }
  };
  


  //.......................................FOR TIME PICKER..........................................................

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isTimePickerModalVisible, setTimePickerModalVisible] = useState(false);
  const [appStartTime, setAppStartTime] = useState('');
  const [appEndTime, setAppEndTime] = useState('');

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  
  //.................................................................................................
  const [refreshing, setRefreshing] = useState(false); 
  const [refresh, setRefresh] = useState(false); // Track refresh state

  const onRefresh = async () => {
    setRefreshing(true); // Start refreshing
  
    try {
      const userUID = await fetchLinkedChildAuthUID(auth.currentUser?.uid); // Get user UID
      if (userUID) {
        await Promise.all([ fetchSchedules(userUID)]); // Refresh schedules, apps, and usage data in parallel
      } else {
        console.warn('User UID not found. Cannot fetch data.');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  
    setRefreshing(false); // Stop refreshing
  };
  
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  
  const handleConfirmStartTime = (time) => {
    // Formatting time to include AM/PM
    const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setStartTime(formattedTime);
    setStartTimePickerVisibility(false);
  };

  const handleConfirmStartDate = (date) => {
    const formattedDate = date.toLocaleDateString();
    setStartDate(formattedDate);
    setStartDatePickerVisibility(false);
  };

  const handleConfirmEndTime = (time) => {
    // Formatting time to include AM/PM
    const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setEndTime(formattedTime);
    setEndTimePickerVisibility(false);
  };

  const handleConfirmEndDate = (date) => {
    const formattedDate = date.toLocaleDateString();
    setEndDate(formattedDate);
    setEndDatePickerVisibility(false);
  };

  // Trigger pickers
  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const showStartTimePicker = () => setStartTimePickerVisibility(true);
  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const showEndTimePicker = () => setEndTimePickerVisibility(true);

//.................................................................................................

  // Function to fetch application data from Realtime Database
  const fetchAppsData = async (userUID: string) => {
    try {
      const dbRef = ref(getDatabase(), `applications/${userUID}`);
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Fetched data:', data); // Verify the fetched data
        setUsageApps(data.usageApps || []);
        setAllApps(data.allApps || []);
      } else {
        console.log('No data available'); // Handle case when there's no data
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };
  //..................................................................................
  
//....................................................................................
  // useEffect to fetch user UID and then fetch the app data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userUID = await fetchUserUIDByChildUUID(childUUID); // Get user UID
        if (userUID) {
          await fetchAppsData(userUID); // Fetch apps using the UID
          await fetchSchedules(userUID); // Fetch schedules using the UID
        } else {
          console.error('User UID not found. Cannot fetch apps or schedules.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Stop loading if data is fetched
        setLoadingSchedules(false); // Stop loading schedules
      }
    };

    fetchData(); // Call fetch data function inside useEffect
  }, [childUUID]); // Dependency on childUUID
  const formatUsageTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };


  
  const renderAppItem = (app, index, isUsageApp = false) => {
    const handlePressMenu = () => {
      Alert.alert(
        "Actions",
        "Select an action for " + app.name,
        [
          { text: "Details", onPress: () => console.log("Details Pressed for", app.name) },
          { text: "Block", onPress: () => console.log("Block Pressed for", app.name) },
          { text: "Limit", onPress: () => console.log("Limit Pressed for", app.name) },
          { text: "Cancel", style: "cancel" }
        ],
        { cancelable: true }
      );
    };
  
    return (
      <View style={styles.appItem} key={`${app.packageName || 'unknown_package'}-${index}`}>
        <View style={styles.appInfo}>
          <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
          <View>
            <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appCategory}>Category: {app.category}</Text>
            {isUsageApp && (
              <Text style={styles.appUsage}>
                Usage: {formatUsageTime(parseInt(app.usage || '0', 10))}
              </Text>
            )}
            <Text style={styles.installedDate}>Installed: {app.installedDate}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handlePressMenu} style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };
  //.........................................................................................................
  
  // Function to fetch the UID of the user linked to the childUUID
  const fetchUserUIDByChildUUID = async (childUUID: string) => {
    try {
      const q = query(collection(firestore, 'users'), where('uuid', '==', childUUID));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return userDoc.id; // Return the user's UID
      } else {
        console.warn('No user found with the given childUUID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user UID:', error);
      return null;
    }
  };

// Function to handle deleting a schedule using the schedule name
const handleDeleteSchedule = async (scheduleName) => {
  try {
    const authUID = await fetchLinkedChildAuthUID(auth.currentUser?.uid); // Fetch the linked child's UID
    if (!authUID || !scheduleName) {
      console.error('Invalid authUID or scheduleName:', authUID, scheduleName);
      return;
    }

    // Sanitize schedule name to avoid invalid Firebase key characters
    const sanitizedScheduleName = scheduleName.replace(/[.#$[\]]/g, "_");
    const db = getDatabase();
    const scheduleRef = ref(db, `schedules/${authUID}/${sanitizedScheduleName}`);

    // Confirm before deleting
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete the schedule "${scheduleName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await remove(scheduleRef); // Delete the schedule from the database
              showMessage({
                message: 'Deleted',
                description: `Schedule "${scheduleName}" has been deleted successfully.`,
                type: 'success',
              });

              // Refresh the data after deleting
              await onRefresh();
            } catch (error) {
              console.error('Failed to delete schedule:', error);
              showMessage({
                message: 'Error',
                description: 'Failed to delete schedule. Please try again.',
                type: 'danger',
              });
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    showMessage({
      message: 'Error',
      description: 'Failed to delete schedule. Please try again.',
      type: 'danger',
    });
  }
};


const handleSaveSchedule = async () => {
  // Ensure all required fields are filled out
  if (selectedApps.length === 0 || !scheduleName || !startDate || !endDate) {
    setErrorMessage("Please fill out all fields to save the schedule.");
    return;
  }

  // Format the start and end dates
  const formattedStartDate = formatDateForSchedule(startDate);
  const formattedEndDate = formatDateForSchedule(endDate);
  
  // Fetch the linked child's Firebase Auth UID from the user profile
  const linkedChildAuthUID = await fetchLinkedChildAuthUID(auth.currentUser?.uid);
  console.log('Attempting to save schedule for UID:', linkedChildAuthUID);

  if (linkedChildAuthUID) {
    try {
      // Sanitize schedule name to avoid invalid Firebase key characters
      const sanitizedScheduleName = scheduleName.replace(/[.#$[\]]/g, "_");
      const schedulePath = `schedules/${linkedChildAuthUID}/${sanitizedScheduleName}`;
      const scheduleRef = ref(getDatabase(), schedulePath);

      // Prepare data for each selected application
      const appsData = {};
      selectedApps.forEach((app, index) => {
        const appKey = `app_${index}`;
        appsData[appKey] = {
          packageName: app.packageName.replace(/[.#$[\]]/g, "_"), // Sanitize package name
          appName: app.name,
          icon: app.icon,
          category: app.category,
          blockStart: app.blockStart || "Not Set", // Using the updated block start time
          blockEnd: app.blockEnd || "Not Set", // Using the updated block end time
        };
      });

      // Schedule data structure
      const scheduleData = {
        scheduleName,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        apps: appsData,
      };

      // Save schedule data to Firebase Realtime Database
      await set(scheduleRef, scheduleData);
      console.log(`Schedule "${scheduleName}" saved with ${selectedApps.length} apps.`);
      
      // Display success message
      showMessage({
        message: 'Success',
        description: 'Schedule saved successfully',
        type: 'success',
        icon: 'success',
      });

      // Clear input fields and close modal
      setSelectedApps([]);
      setStartDate('');
      setEndDate('');
      setScheduleName('');
      toggleModal();
      
      // Trigger a refresh to update displayed schedules
      await onRefresh();

    } catch (error) {
      console.error("Failed to save schedule:", error);
      setErrorMessage("Failed to save schedule. Please check your connection and try again.");
    }
  } else {
    console.error('Failed to fetch linkedChildAuthUID:', linkedChildAuthUID);
    setErrorMessage("Failed to find linked child's UID. Please verify the child's profile.");
  }
};
const decodePackageName = (encodedName) => {
  return encodedName.replace(/_dot_/g, ".");
};

  // Format date for saving
  const formatDateForSchedule = (date: string): string => {
    // Implement date formatting here if necessary
    return date;
  };

   // Format time for saving
   const formatTimeForSchedule = (time: string): string => {
    // Implement time formatting here if necessary
    return time;
  };
  //..........................................................................................................
  
  const fetchLinkedChildAuthUID = async (parentUID) => {
    const userDocRef = doc(firestore, 'users', parentUID);
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists() && userSnapshot.data().linkedChildAuthUID) {
      return userSnapshot.data().linkedChildAuthUID;
    } else {
      console.warn('Parent user data not found or child Auth UID not set');
      return null;
    }
  };
  
  //................................................................................................................................

  const handleSelectApp = (app) => {
    const isSelected = selectedApps.some(
      (selected) => selected.packageName === app.packageName
    );
  
    if (isSelected) {
      setSelectedApps(
        selectedApps.filter((a) => a.packageName !== app.packageName)
      );
    } else {
      setSelectedApp(app); // Set the selected app to be scheduled
      setTimePickerModalVisible(true); // Open the modal to set the block time
    }
  };
  

  const groupAppsByCategory = (apps) => {
    const grouped = apps.reduce((acc, app) => {
      const category = app.category || 'Uncategorized'; // Handle missing category
      if (!acc[category]) acc[category] = [];
      acc[category].push(app);
      return acc;
    }, {});
  
    // Convert the grouped object into an array for SectionList
    return Object.keys(grouped).map((category) => ({
      title: category,
      data: grouped[category],
    }));
  };
  
//.........................................................................................................
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}  refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={toggleModal} style={styles.controlButtonWrapper}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.controlButton}>
              <Ionicons name="calendar-outline" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.controlButtonText}>Set Schedule</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButtonWrapper}>
            <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.controlButton}>
              <MaterialIcons name="apps" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.controlButtonText}>View Applications Usage</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

    
   {/* Parent Created Schedules .......................................................*/}


   <Text style={styles.sectionHeader}>Created Schedules</Text>
{loadingSchedules ? (
  <ActivityIndicator size="large" color="#0000ff" />
) : schedules.length > 0 ? (
  schedules.map((schedule, index) => (
    <View key={index} style={styles.scheduleItem}>
      {/* Schedule Header */}
      <View style={styles.scheduleHeader}>
        <Ionicons name="calendar" size={24} color="#007AFF" style={styles.scheduleIcon} />
        <View style={styles.scheduleTextContainer}>
          <Text style={styles.scheduleName}>{schedule.scheduleName}</Text>
          <Text style={styles.scheduleTime}>
            {schedule.startDate} {schedule.startTime} - {schedule.endDate} {schedule.endTime}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteIconContainer}
          onPress={() => handleDeleteSchedule(schedule.scheduleName)}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Applications List */}
      <Text style={styles.sectionHeader}>Scheduled Apps:</Text>
      <View style={styles.scheduleappsContainer}>
        {Object.keys(schedule.apps).map((appKey) => {
          const app = schedule.apps[appKey];
          return (
            <View key={appKey} style={styles.appItemschedule}>
              {/* Display the app icon or fallback icon */}
              {app.icon ? (
                <Image
                  source={{ uri: `data:image/png;base64,${app.icon}` }}
                  style={styles.appIconschedule}
                />
              ) : (
                <Ionicons name="apps-outline" size={40} color="#007AFF" />
              )}
              {/* App Name */}
              <Text style={styles.appName}>{app.appName}</Text>
              {/* App Block Time */}
              <Text style={styles.appTime}>
                Start Time: {app.blockStart ? app.blockStart : 'Not Set'} | End Time: {app.blockEnd ? app.blockEnd : 'Not Set'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  ))
) : (
  <Text>No schedules available</Text>
)}




      
{/* Applications with Usage Data .......................................................*/}

<Text style={styles.sectionHeader}>Applications with Usage Data</Text>
{loading ? (
  <ActivityIndicator size="large" color="#0000ff" />
) : usageApps.length > 0 ? (
  usageApps.map((app, index) => renderAppItem(app, index, true)) // Pass index to ensure unique keys
) : (
  <Text>No apps with usage data available</Text>
)}

<View style={styles.divider} />

{/* All Installed Applications */}
<Text style={styles.sectionHeader}>Installed Applications</Text>
{loading ? (
  <ActivityIndicator size="large" color="#0000ff" />
) : allApps.length > 0 ? (
  allApps.map((app, index) => renderAppItem(app, index)) // Pass index to ensure unique keys
) : (
  <Text>No installed apps available</Text>
)}

 {/* Modal .............................................................................................*/}

<Modal visible={modalVisible} animationType="slide" transparent onRequestClose={toggleModal}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
    <View style={styles.inputContainer}>
      <Ionicons name="calendar-outline" size={20} color="#666" style={styles.icon} />
      <TextInput
        placeholder="Enter Schedule Name"
        value={scheduleName}
        onChangeText={setScheduleName}
        onFocus={() => setErrorMessage('')}
        style={styles.input}
      />
    </View>
 {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      
<View style={styles.timeContainer}>
  {/* Left Section: Start and End Dates */}
  <View style={styles.dateSection}>
    {/* Start Date Section */}
    <Text style={styles.sectionTitle}>Set Date</Text>
    <View style={styles.dateTimeSection}>
    <TouchableOpacity onPress={showStartDatePicker} style={styles.dateButton}>
        <Text style={styles.sectionTitle}>Start Date</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmStartDate}
        onCancel={() => setStartDatePickerVisibility(false)}
      />
      <Text style={styles.selectedDateTime}>{startDate}</Text>
    </View>

    {/* End Date Section */}
    <View style={styles.dateTimeSection}>
      <TouchableOpacity onPress={showEndDatePicker} style={styles.dateButton}>
        <Text style={styles.sectionTitle}>End Date</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmEndDate}
        onCancel={() => setEndDatePickerVisibility(false)}
      />
      <Text style={styles.selectedDateTime}>{endDate}</Text>
    </View>
  </View>

  {/* Right Section: Scheduled Applications */}
  <View style={styles.scheduledAppsSection}>
    <Text style={styles.sectionTitle}>Scheduled Applications</Text>
    <ScrollView style={styles.scheduledAppsScrollView}>
      {selectedApps.length > 0 ? (
        selectedApps.map((app, index) => (
          <View key={index} style={styles.scheduledAppItem}>
            {app.icon ? (
              <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
            ) : (
              <Ionicons name="image-outline" size={24} color="#4F8EF7" />
            )}
            <View style={styles.appInfoContainer}>
              <Text style={styles.appName}>{app.name}</Text>
              <Text style={styles.appTime}>
                Start: {app.blockStart ? app.blockStart : "Not Set"} | End: {app.blockEnd ? app.blockEnd : "Not Set"}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noAppsText}>No applications scheduled yet</Text>
      )}
    </ScrollView>
  </View>
</View>







      <View style={styles.modalApplications}>
  
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
          
        ) : (
          <SectionList
            sections={groupAppsByCategory(allApps)}
            keyExtractor={(item) => item.packageName}
            renderItem={({ item }) => null} // Skip direct rendering, handled inside FlatList per section
            renderSectionHeader={({ section: { title, data } }) => (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>{title}</Text>
                <FlatList
                  data={data}
                  keyExtractor={(item) => item.packageName}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                    onPress={() => handleSelectApp(item)}
                    style={[
                      styles.appItemModal,
                      selectedApps.some(a => a.packageName === item.packageName) ? styles.selectedAppModal : {}
                    ]}
                  >
                    {item.icon ? (
                      <Image
                        source={{ uri: `data:image/png;base64,${item.icon}` }}
                        style={styles.appIconModal}
                      />
                    ) : (
                      <Ionicons name="image-outline" size={30} color="#fff" />
                    )}
                    <Text style={styles.appNameModal}>{item.name}</Text>
                  </TouchableOpacity>
                  )}
                  numColumns={3} // This will arrange the apps in rows
                />
              </View>
            )}
            contentContainerStyle={styles.appListModal}
          />
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
  <Text style={styles.saveButtonText}>Save Schedule</Text>
      </TouchableOpacity>
    </View>
  </View>



</Modal>


<Modal visible={isTimePickerModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlaySet}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>
        Set Block Time for {selectedApp?.name}
      </Text>

      {/* Start Time Picker */}
      <TouchableOpacity
        onPress={() => setStartTimePickerVisibility(true)}
        style={styles.timeButton}
      >
        <Ionicons name="time-outline" size={20} color="#ffffff" style={styles.timeIcon} />
        <Text style={styles.timeButtonText}>Select Start Time</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={(time) => {
          setAppStartTime(formatTime(time));
          setStartTimePickerVisibility(false);
        }}
        onCancel={() => setStartTimePickerVisibility(false)}
        is24Hour={false}
      />

      {/* End Time Picker */}
      <TouchableOpacity
        onPress={() => setEndTimePickerVisibility(true)}
        style={styles.timeButton}
      >
        <Ionicons name="time-outline" size={20} color="#ffffff" style={styles.timeIcon} />
        <Text style={styles.timeButtonText}>Select End Time</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={(time) => {
          setAppEndTime(formatTime(time));
          setEndTimePickerVisibility(false);
        }}
        onCancel={() => setEndTimePickerVisibility(false)}
        is24Hour={false}
      />

      {/* Display Selected Times */}
      <View style={styles.selectedTimesContainer}>
        <Text style={styles.selectedDateTime}>
          Selected Start Time: {appStartTime ? appStartTime : 'Not Selected'}
        </Text>
        <Text style={styles.selectedDateTime}>
          Selected End Time: {appEndTime ? appEndTime : 'Not Selected'}
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={() => {
          if (appStartTime && appEndTime) {
            const updatedApp = {
              ...selectedApp,
              blockStart: appStartTime,
              blockEnd: appEndTime,
            };

            // Update the selected app with block times
            setSelectedApps((prevApps) => {
              const existingIndex = prevApps.findIndex(
                (app) => app.packageName === updatedApp.packageName
              );
              if (existingIndex !== -1) {
                const newApps = [...prevApps];
                newApps[existingIndex] = updatedApp; // Update existing app
                return newApps;
              } else {
                return [...prevApps, updatedApp]; // Add new app if not present
              }
            });

            // Reset states and close the modal
            setSelectedApp(null);
            setAppStartTime('');
            setAppEndTime('');
            setTimePickerModalVisible(false);
          } else {
            // Handle if start or end time is not selected
            showMessage({
              message: 'Error',
              description: 'Please select both start and end times for the application.',
              type: 'danger',
            });
          }
        }}
        style={styles.saveButton}
      >
        <Text style={styles.saveButtonText}>Save Time</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => {
          setTimePickerModalVisible(false); // Close the modal
        }}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>





     </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding:10,
  
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  contentContainer: {
    padding: 10,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  iconStyle: {
    marginRight: 10,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#388E3C',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  controlsContainer: {
    marginVertical: 10,
  },
  controlButtonWrapper: {
    marginBottom: 10,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appCategory: {
    fontSize: 14,
    color: '#555',
  },
  appUsage: {
    fontSize: 14,
    color: '#777',
  },
  installedDate: {
    fontSize: 14,
    color: '#777',
  },

  //......................................................
  errorText: {
    fontSize: 16,
    color: '#D32F2F',  // Typically red to indicate error
    textAlign: 'center',  // Light red background for better visibility
    borderRadius: 5,
  },
  selectedAppModal: {
    backgroundColor: '#DDEEFF', // Light blue background for selected apps
    borderColor: '#007AFF', // Highlight with a blue border
    shadowColor: '#0000FF', // Slightly blue shadow for a glowing effect
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.5,
   
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    top: 10,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light gray background for the input container
    borderRadius: 10, // Rounded corners for the container
    paddingHorizontal: 10, // Padding for better spacing between icon and input
    height: 50, // Height of the input container
  },
  searchIcon: {
    marginRight: 10, // Space between the icon and the input field
  },
  input: {
    flex: 1, // Make the input take the available width
    fontSize: 16,
    color: '#333', // Darker text color for better contrast
  },
  icon: {
    marginRight: 10, // Space between the icon and the input field
  },
  timeContainer: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    marginHorizontal: 5,
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  selectedDateTime: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  timeInput: {
    flex: 1,
    marginRight: 10,
  },
  modalApplications: {
    width: '100%',
    maxHeight: 320,
    marginBottom: 10,
     // Limit height to make it scrollable if needed
  },
  appListModal: {
    paddingVertical: 10,
  },
  appItemModal: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#FFF', // Default background color for non-selected apps
    borderWidth: 1,
    borderColor: '#DDD', // Subtle border for non-selected apps
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  appIconModal: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  appNameModal: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  //.............Option..................
  menuButton: {
    padding: 10,
  },
  //..................Schedule COntianer....................
  scheduleItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  scheduleTime: {
    fontSize: 14,
    color: '#555',
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scheduleIcon: {
    marginRight: 10,
  },
  scheduleappsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // This helps align apps with even spacing
    alignItems: 'center', // Align items vertically in the center
    marginHorizontal: 8, // Add some margin to the sides to ensure spacing
  },
  
  scheduleTextContainer: {
    flex: 1,
  },
  appItemschedule: {
    width: '48%', // Setting the width to 48% allows two apps per row with some spacing
    marginBottom: 16, // Add some space at the bottom between rows
    backgroundColor: '#f5f5f5', // Optional: add a background color for better visibility
    padding: 10, // Add padding to ensure content inside has some space
    borderRadius: 8, // Add some rounding for better design
    alignItems: 'center', // Center align the content horizontally
  },
  appIconschedule: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginBottom: 8,
  },
  deleteIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },

//........................Time Container...........................
appTime: {
  fontSize: 14,
  color: '#666',
  textAlign: 'center',
},
dateSection: {
 
  paddingRight: 16,
  borderRightWidth: 2,
  borderRightColor: '#ccc',
},
scheduledAppsSection: {
  flex: 1,
  paddingHorizontal: 10,
},
dateTimeSection: {
  marginBottom: 20,
},
scheduledAppItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 15,
},
appInfoContainer: {
  flex: 1,
},
scheduledAppsScrollView: {
  maxHeight: 150, // Restrict the scroll area to 200 pixels height
},
noAppsText: {
  fontSize: 16,
  color: '#999',
  marginTop: 16,
},
dateButton: {
  backgroundColor: '#4F8EF7',

  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
},

modalOverlaySet: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
timeButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#4F8EF7',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 8,
  marginVertical: 10,
  width: '80%',
  justifyContent: 'center',
},
timeIcon: {
  marginRight: 10,
},
timeButtonText: {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 'bold',
},
modalCard: {
  backgroundColor: '#ffffff',
  padding: 20,
  borderRadius: 15,
  width: '85%',
  alignItems: 'center',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
},
selectedTimesContainer: {
  marginTop: 15,
  alignItems: 'center',
},
backButton: {
  backgroundColor: '#FF6347', // Tomato color for distinction
  paddingVertical: 10,
  paddingHorizontal: 25,
  borderRadius: 8,
  marginTop: 15,
  alignSelf: 'stretch',
  alignItems: 'center',
},
backButtonText: {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 'bold',
},
});

export default Dashboard;
