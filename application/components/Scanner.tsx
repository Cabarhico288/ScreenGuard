import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const Scanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    
    // Assuming the QR code contains JSON data
    try {
      const parsedData = JSON.parse(data); // Parse the scanned QR code data
      const { childId, connectionUrl } = parsedData;

      // Confirm connection to the scanned device
      Alert.alert(
        'QR Code Scanned!',
        `Child ID: ${childId}\nDo you want to connect to this device?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
          { text: 'Connect', onPress: () => connectToDevice(childId, connectionUrl) }
        ]
      );
    } catch (error) {
      Alert.alert('Invalid QR Code', 'The scanned QR code is not valid.');
      setScanned(false);
    }
  };

  const connectToDevice = async (childId, connectionUrl) => {
    // Example: Make an API call or navigate to another screen to complete the connection
    try {
      const response = await fetch(connectionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentDeviceId: 'your-parent-device-id' }),
      });

      if (response.ok) {
        Alert.alert('Connected', `Successfully connected to child device with ID: ${childId}`);
        // Navigate to another screen or update the state
      } else {
        Alert.alert('Connection Failed', 'Failed to connect to the child device.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while connecting to the child device.');
    }
    setScanned(false);
  };

  if (hasPermission === null) {
    return <Text style={styles.messageText}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.messageText}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.barcodeContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      {scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.90,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  barcodeContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    borderColor: '#fff',
    borderWidth: 2,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginVertical: 90,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Scanner;
