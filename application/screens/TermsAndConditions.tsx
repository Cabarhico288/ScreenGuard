import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Animated, Easing, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation'; 

type TermsAndConditionsScreenProp = StackNavigationProp<RootStackParamList, 'TermsAndConditions'>;

const TermsAndConditions = () => {
  const [isChecked, setIsChecked] = useState(false);
  const navigation = useNavigation<TermsAndConditionsScreenProp>();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();

    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 600,
      delay: 800,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [headerAnim, contentAnim]);

  const handleContinue = () => {
    if (isChecked) {
      navigation.navigate('RoleSelection');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Image Container Section */}
      <Animated.View style={[styles.imageContainer, { opacity: headerAnim }]}>
      <Image 
          source={require('../../assets/TermsCondition.png')} // Add your image path here
          style={styles.image}
        />
      </Animated.View>

      {/* Animated Header Section */}
      <Animated.View style={[styles.headerContainer, { opacity: headerAnim }]}>
        <Ionicons name="document-text-outline" size={50} color="#007bff" />
        <Text style={styles.title}>Terms and Conditions</Text>
      </Animated.View>

      {/* Animated Content Section */}
      <Animated.View style={{ opacity: contentAnim }}>
        <View style={styles.sectionContainer}>
          <Ionicons name="information-circle-outline" size={30} color="#007bff" />
          <Text style={styles.sectionTitle}>Introduction</Text>
        </View>
        <Text style={styles.content}>
          Welcome to ScreenGuard. These Terms and Conditions govern your use of our application,
          which allows parents to monitor and set schedules on their child's device. By using this
          application, you agree to comply with these terms.
        </Text>

        <View style={styles.sectionContainer}>
          <Ionicons name="checkmark-done-outline" size={30} color="#007bff" />
          <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
        </View>
        <Text style={styles.content}>
          By downloading, installing, or using ScreenGuard, you agree to be bound by these Terms and 
          Conditions. If you do not agree to these terms, do not use this application.
        </Text>

        <View style={styles.sectionContainer}>
          <Ionicons name="shield-outline" size={30} color="#007bff" />
          <Text style={styles.sectionTitle}>Parental Responsibility</Text>
        </View>
        <Text style={styles.content}>
          ScreenGuard is designed to help parents monitor and manage their child's device usage. As a 
          parent, you are responsible for ensuring the appropriate use of this application and the 
          devices under your control.
        </Text>

        <View style={styles.sectionContainer}>
          <Ionicons name="mail-outline" size={30} color="#007bff" />
          <Text style={styles.sectionTitle}>Contact Us</Text>
        </View>
        <Text style={styles.content}>
          If you have any questions about these Terms and Conditions, please contact us at: 
          screenguard288@gmail.com
        </Text>
      </Animated.View>

      {/* Checkbox and Continue Button */}
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setIsChecked(!isChecked)}
        >
          <Ionicons name={isChecked ? "checkmark-circle" : "ellipse-outline"} size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>I agree to the Terms and Conditions</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !isChecked && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!isChecked}
      >
        <LinearGradient
          colors={!isChecked ? ['#cccccc', '#b0b0b0'] : ['#00796b', '#48a999']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  // Image Container
  imageContainer: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'web' ? '100%' : '130%',
    height: Platform.OS === 'web' ? '40%' : '20%',
    borderBottomEndRadius: 300,
    borderBottomStartRadius: 300,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Platform.OS === 'web' ? 350 : 180,
    height: Platform.OS === 'web' ? 350 : 180,
    borderRadius: 125,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    marginTop: Platform.OS === 'web' ? '35%' : '55%', // Adjust margin to accommodate the image
  },
  title: {
    fontSize: Platform.OS === 'web' ? 36 : 28,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#007bff',
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    
  },
  content: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 22,
    color: '#666',
    paddingHorizontal: Platform.OS === 'web' ? '10%' : 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  checkbox: {
    marginRight: 8,
    justifyContent: 'center',
 
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: Platform.OS === 'web' ? 20 : 15,
    paddingHorizontal: Platform.OS === 'web' ? 60 : 40,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
 
  // Button text style
  buttonText: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TermsAndConditions;
