import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const RealtimeMonitor: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Realtime Monitor</Text>

      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.screenContainer}
      >
        <Image
          source={{ uri: 'https://via.placeholder.com/300' }} // Placeholder for real-time screen image
          style={styles.screenImage}
          resizeMode="contain"
        />
      </LinearGradient>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Device: Child's Device</Text>
        <Text style={styles.infoText}>Status: Online</Text>
        <Text style={styles.infoText}>Last Updated: Just Now</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.buttonGradient}
          >
            <Text style={styles.controlButtonText}>Refresh Screen</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <LinearGradient
            colors={['#FF5722', '#FF7043']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.buttonGradient}
          >
            <Text style={styles.controlButtonText}>Take Action</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  screenContainer: {
    width: width * 0.9,
    height: height * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  screenImage: {
    width: '100%',
    height: '150%',
  },
  infoContainer: {
    marginVertical: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    marginVertical: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  controlButton: {
    width: '45%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RealtimeMonitor;
