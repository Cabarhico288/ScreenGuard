import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import Swipeable only for non-web platforms
let Swipeable;
if (Platform.OS !== 'web') {
  Swipeable = require('react-native-gesture-handler').Swipeable;
}

const initialNotifications = [
  { id: '1', title: 'New Message', description: 'You have received a new message from John.', icon: 'chatbubble-ellipses' },
  { id: '2', title: 'Update Available', description: 'A new update is available. Please update the app.', icon: 'download' },
  { id: '3', title: 'Reminder', description: 'Don’t forget to complete your profile.', icon: 'alert' },
  // Add more notifications here
];

const NotificationItem = ({ title, description, icon, onDelete }) => {
  const renderRightActions = () => (
    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
      <Ionicons name="trash" size={30} color="#fff" />
    </TouchableOpacity>
  );

  return (
    Platform.OS === 'web' ? (
      <View style={styles.notificationItem}>
        <Ionicons name={icon} size={30} color="#0891b2" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationDescription}>{description}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.webDeleteButton}>
          <Ionicons name="trash" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
    ) : (
      <Swipeable renderRightActions={renderRightActions}>
        <View style={styles.notificationItem}>
          <Ionicons name={icon} size={30} color="#0891b2" style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={styles.notificationTitle}>{title}</Text>
            <Text style={styles.notificationDescription}>{description}</Text>
          </View>
        </View>
      </Swipeable>
    )
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleDelete = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            title={item.title}
            description={item.description}
            icon={item.icon}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    marginTop: 45,
  },
  headerContainer: {
    backgroundColor: '#0891b2',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8e8d8d',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#737373',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 10,
    marginVertical: 8,
    marginRight: 16,
  },
  webDeleteButton: {
    padding: 10,
  },
});

export default Notifications;
