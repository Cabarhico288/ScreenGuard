import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

type GetStartedNavigationProp = StackNavigationProp<RootStackParamList, 'GetStarted'>;

const GetStarted: React.FC = () => {
  const navigation = useNavigation<GetStartedNavigationProp>();

  const imageContainerAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(imageContainerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();

    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 600,
      delay: 800,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();

    Animated.timing(messageAnim, {
      toValue: 1,
      duration: 600,
      delay: 1400,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [imageContainerAnim, titleAnim, messageAnim]);

  const handleGetStarted = () => {
    navigation.navigate('TermsAndConditions');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { opacity: imageContainerAnim }]}>
        <Image 
          source={require('../../assets/images/ScreenGuard.png')} 
          style={styles.image}
        />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: titleAnim }]}>ScreenGuard</Animated.Text>
      <Animated.Text style={[styles.message, { opacity: messageAnim }]}>
        Your Digital Parenting Partner
      </Animated.Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container style
  container: {
    flex: 1, // Takes up the full available space
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
    padding: 10, // Padding inside the container
    backgroundColor: Platform.OS === 'web' ? 'white' : '#f8f8f8', // Conditional background color
    ...(Platform.OS === 'web' && {
      height: '80%', // Takes up full height on web
      paddingHorizontal: '10%', // Adds more padding horizontally for wider screens
    }),
  },
  // Image container style
  imageContainer: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'web' ? '100%' : '130%',
    height: Platform.OS === 'web' ? '40%' : '50%',
    borderBottomEndRadius: 300,
    borderBottomStartRadius: 300,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Image style
  image: {
    width: Platform.OS === 'web' ? 250 : 180,
    height: Platform.OS === 'web' ? 250 : 180,
    borderRadius: 125,
  },
  // Title text style
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 32,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'web' ? '20%' : '100%', // Adjusted for web
    color: '#00796b',
    textAlign: 'center', // Ensures centered text
  },
  // Message text style
  message: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#555',
    paddingHorizontal: Platform.OS === 'web' ? '20%' : 0,
    marginTop: Platform.OS === 'web' ? 20 : 10, // Adjusted for web
  },
  // Button style
  button: {
    backgroundColor: '#00796b',
    paddingVertical: Platform.OS === 'web' ? 20 : 15,
    paddingHorizontal: Platform.OS === 'web' ? 60 : 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginTop: Platform.OS === 'web' ? 10 : 10, // Adjusted for web
  },
  // Button text style
  buttonText: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});


export default GetStarted;
