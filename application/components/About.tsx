import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const About: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }} // Replace with your logo or image
          style={styles.logo}
        />
        <Text style={styles.title}>About Our App</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Introduction</Text>
        <Text style={styles.text}>
          Our app is designed to provide a seamless experience for parents to monitor and manage their children's activities.
          It includes features such as real-time monitoring, scheduling, notifications, and more.
        </Text>

        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.text}>
          - Real-time Location Tracking{'\n'}
          - App Usage Monitoring{'\n'}
          - Schedule Management{'\n'}
          - Notifications and Alerts{'\n'}
          - Customizable Settings
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.text}>
          Our mission is to empower parents with the tools they need to ensure their children's safety and well-being
          in the digital age.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.text}>
          For any inquiries or support, please contact us at: screenguard@gmail.com
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
  },
  contentContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  text: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 20,
  },
});

export default About;
