// BlockingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

interface BlockingScreenProps {
  onClose: () => void;
}

const BlockingScreen: React.FC<BlockingScreenProps> = ({ onClose }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>This app is currently blocked.</Text>
      <Button title="Close" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
  },
  message: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default BlockingScreen;
