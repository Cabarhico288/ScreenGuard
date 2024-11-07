// css/AuthForm.styles.ts

import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Platform.OS === 'web' ? 'white' : '#f8f8f8',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    width: Platform.OS === 'web' ? '100%' : '130%',
    height: Platform.OS === 'web' ? '40%' : '35%',
    borderBottomEndRadius: 300,
    borderBottomStartRadius: 300,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: Platform.OS === 'web' ? 250 : 180,
    height: Platform.OS === 'web' ? 250 : 180,
    borderRadius: 125,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 32,
    fontWeight: 'bold',
    marginTop: Platform.OS === 'web' ? '20%' : '70%',
    color: '#00796b',
    textAlign: 'center',
  },
  formContainer: {
    width: 300,
    borderRadius: 10,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 18,
  },
  primaryButton: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  switchText: {
    marginTop: 20,
  },
  linkText: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
  },
  backButtonText: {
    color: '#1E88E5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#DB4437',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  facebookButton: {
    flexDirection: 'row',
    backgroundColor: '#4267B2',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },

  // New styles for OTP feature
  sendOtpButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    
    width: 50, // Fixed width for the button
  },
  emailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
 
    width: '100%', // Make the container take full width
  },
  inputWithButton: {
    flex: 1, // Make the email input take most of the available space
    marginRight: 10, // Add some space between the input and the button
  },
  verifyButton: {
    backgroundColor: '#4CAF50', // Green background
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkVerifyButton: {
    backgroundColor: '#2196F3', // Blue background
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkVerifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotP:{
  color: '#1E88E5',
  fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#aaa', // Lighter color to indicate disabled state
  },
});
