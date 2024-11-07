import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';


const QuickResponse = ({ isVisible, onClose, deviceId }) => {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    // Generate the QR code value, for example, using the device ID or a connection token
    if (deviceId) {
      setQrValue(deviceId);
    }
  }, [deviceId]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Scan to Connect</Text>
          {qrValue ? (
            <View style={styles.qrContainer}>
             
            </View>
          ) : (
            <Text style={styles.placeholderText}>Loading QR Code...</Text>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  qrContainer: {
    marginTop: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#7F3DFF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default QuickResponse;
