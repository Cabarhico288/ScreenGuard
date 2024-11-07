import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const NotificationContainer = () => {
  // Sample notifications array
  const notifications = [
    {
      id: 1,
      title: 'New Activity Alert',
      message: 'Your child has just arrived at school. Tap here to view location and details.',
    },
    {
      id: 2,
      title: 'Health Reminder',
      message: 'Your child has spent over 3 hours on social media today. Tap to see more details.',
    },
    {
      id: 3,
      title: 'Location Alert',
      message: 'Your child has left the geofenced area. Tap here for more info.',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <LinearGradient
              colors={['#ffffff', '#bdc5da']}
              style={styles.notificationContainer}
            >
              {/* Notification Icon */}
              <View style={styles.iconContainer}>
                <Icon name="notifications-outline" size={30} color="#007AFF" />
              </View>

              {/* Notification Content */}
              <View style={styles.contentContainer}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>View More</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', // Light background
    padding: 10,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  notificationCard: {
    marginBottom: 20, // Space between notification cards
  },
  notificationContainer: {
    padding: 20,
    borderRadius: 15,
    elevation: 3, // Shadow for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, // Shadow for iOS
    shadowRadius: 4,
    backgroundColor: '#fff', // Background for the notification card
    flexDirection: 'column',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15, // Space below the icon
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  actionButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
  },
});

export default NotificationContainer;
