import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import icons from Ionicons

const applications = {
  'Social Media': [
    { name: 'Facebook', icon: 'logo-facebook' },
    { name: 'Instagram', icon: 'logo-instagram' },
    { name: 'Twitter', icon: 'logo-twitter' },
  ],
  Entertainment: [
    { name: 'YouTube', icon: 'logo-youtube' },
    { name: 'TikTok', icon: 'logo-tiktok' },
  ],
  School: [
    { name: 'Zoom', icon: 'videocam-outline' },
    { name: 'Google Classroom', icon: 'school-outline' },
    { name: 'Khan Academy', icon: 'school-outline' },
  ],
  Games: [
    { name: 'Minecraft', icon: 'game-controller-outline' },
    { name: 'Roblox', icon: 'game-controller-outline' },
    { name: 'Fortnite', icon: 'game-controller-outline' },
  ],
};

const SetSchedule: React.FC = () => {
  const [selectedApps, setSelectedApps] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [scheduleName, setScheduleName] = useState('');

  const handleSelectApp = (app) => {
    if (selectedApps.includes(app)) {
      setSelectedApps(selectedApps.filter(a => a !== app));
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const handleSaveSchedule = () => {
    console.log(`Schedule: ${scheduleName}, Apps: ${selectedApps.map(a => a.name).join(', ')}, Time: ${startTime} - ${endTime}`);
    setSelectedApps([]);
    setStartTime('');
    setEndTime('');
    setScheduleName('');
  };

  const renderAppItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.appItem, selectedApps.includes(item) && styles.selectedAppItem]}
      onPress={() => handleSelectApp(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={30} color="#fff" />
      </View>
      <Text style={styles.appName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item: category }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <FlatList
        data={applications[category]}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.name}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Set Schedule</Text>
        <TextInput
          placeholder="Enter Schedule Name"
          value={scheduleName}
          onChangeText={setScheduleName}
          style={styles.input}
        />
        <View style={styles.timeContainer}>
          <TextInput
            placeholder="Start Time"
            value={startTime}
            onChangeText={setStartTime}
            style={[styles.input, styles.timeInput]}
          />
          <TextInput
            placeholder="End Time"
            value={endTime}
            onChangeText={setEndTime}
            style={[styles.input, styles.timeInput]}
          />
        </View>
        <FlatList
          data={Object.keys(applications)}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.appList}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
          <Text style={styles.saveButtonText}>Save Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeInput: {
    flex: 1,
    marginRight: 0, // Add space between the inputs
  },
  appList: {
    marginTop: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  selectedAppItem: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SetSchedule;
