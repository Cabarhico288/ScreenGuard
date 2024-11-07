import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GetstartWeb: React.FC = () => {
 


  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { }]}>
        
      </Animated.View>
      <Animated.Text style={[styles.title, { }]}>ScreenGuard</Animated.Text>
      <Animated.Text style={[styles.message, { }]}>
        Your Digital Parenting Partner
      </Animated.Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    width: '130%',
    height: '50%', // Adjust the height as needed
    borderBottomEndRadius: 300,
    borderBottomStartRadius: 300,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: '100%', // Adjust the margin to position the text correctly
    color: '#00796b',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#555',
  },
  button: {
    backgroundColor: '#00796b',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GetstartWeb;
