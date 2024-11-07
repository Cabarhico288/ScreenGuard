import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { RootStackParamList } from '../types/navigation';
import { ActivityIndicator } from 'react-native';
import { styles } from '../../css/AuthForm.styles';
import { handleLogin, handleSignup, handleNextStep, resendVerificationLink, handleForgotPassword } from '../services/authHandlers';
import { _signInWithGoogle, _signInWithFacebook } from '../services/ProviderHandlers';

//...........................................................................................................................................

const AuthForm = ({ route }) => {
  const { selectedRole = 'parent' } = route.params || {};
  const [selectedForm, setSelectedForm] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState(1);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  console.log(selectedRole); // Debug to see what role is being passed
//...........................................................................................................................................
// Google sign-in attempt
const handleGoogleSignInAttempt = async () => {
  await _signInWithGoogle(navigation, selectedRole, setLoading);
};
// Facebook sign-in attempt
const handleFacebookSignInAttempt = async () => {
  await _signInWithFacebook(navigation, selectedRole, setLoading);
};
//...........................................................................................................................................

const handleForgotPasswordAttempt = async () => {
  if (!loginEmail) {
    showMessage({
      message: 'Error',
      description: 'Please enter your email address to reset your password.',
      type: 'danger',
    });
    return;
  }
  setLoading(true);
  try {
    await handleForgotPassword(loginEmail); // Call the forgot password handler
  } catch (error) {
    console.log('Forgot Password Error:', error);
  } finally {
    setLoading(false);
  }
};
  // Handle password visibility toggles
const togglePasswordVisibility = () => setShowPassword(!showPassword);
const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


//...........................................................................................................................................

const handleLoginAttempt = async () => {
  if (!loginEmail || !loginPassword) {
    showMessage({ 
      message: 'Error', 
      description: 'Please enter email and password.', 
      type: 'danger' 
    });
    return;
  }

  setLoading(true); // Start loading

  try {
    // Call handleLogin which handles the success or failure messages
    await handleLogin(loginEmail, loginPassword, selectedRole, navigation, setLoading);
  } catch (error) {
    // Only handle unexpected errors not caught in handleLogin
    showMessage({ 
      message: 'Login Failed', 
      description: error.message || 'An unexpected error occurred.', 
      type: 'danger' 
    });
  } finally {
    setLoading(false); // Stop loading after completion or error
  }
};
  
//...........................................................................................................................................

  const handleResendVerificationLink = async () => {
    if (loginEmail) {
      const response = await resendVerificationLink(loginEmail);
      if (response.success) {
        showMessage({
          message: "Success",
          description: "Verification link sent to your email.",
          type: "success",
        });
      } else if (response.message === "Your email is already verified.") {
        showMessage({
          message: "Info",
          description: "Your email is already verified.",
          type: "info",
        });
      } else {
        showMessage({
          message: "Error",
          description: response.message || "Failed to resend verification link.",
          type: "danger",
        });
      }
    } else {
      showMessage({
        message: "Error",
        description: "Please enter an email.",
        type: "warning",
      });
    }
  };
//...........................................................................................................................................
  // General signup form validation
  const handleSignupAttempt = async () => {
    setLoading(true); // Start loading
  
    try {
      // Call handleSignup with the necessary data
      await handleSignup(
        signupEmail,
        signupPassword,
        signupConfirmPassword,
        selectedRole,
        {
          age,
          firstName,
          lastName,
          address,
        },
        navigation,
        setLoading // Pass setLoading as the last argument
      );
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.message,
        type: 'danger',
      });
    } finally {
      setLoading(false); // Stop loading after completion or error
    }
  };
  //...........................................................................................................................................
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={selectedRole === 'parent' ? require('../../assets/images/parent.png') : require('../../assets/images/child.png')} style={styles.image} />
      </View>
      <Text style={styles.title}>{selectedRole === 'parent' ? 'Parent Portal' : 'Child Portal'}</Text>

      {selectedForm === 'login' ? (
        <View style={styles.formContainer}>
          <TextInput value={loginEmail} onChangeText={setLoginEmail} style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
          <View style={styles.passwordContainer}>
            <TextInput value={loginPassword} onChangeText={setLoginPassword} style={styles.input} placeholder="Password" secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="gray" />
            </TouchableOpacity>
          
            <TouchableOpacity onPress={handleForgotPasswordAttempt}>
  <Text style={styles.forgotP}>Forgot Password?</Text>
</TouchableOpacity>
    
          </View>
          <TouchableOpacity
  style={[styles.primaryButton, loading ? styles.disabledButton : null]}
  onPress={handleLoginAttempt}
  disabled={loading} // Disable the button when loading
>
  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
</TouchableOpacity>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignInAttempt}>
              <AntDesign name="google" size={24} color="white" />
              <Text style={styles.googleButtonText}>Log In with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.facebookButton} onPress={handleFacebookSignInAttempt}>
              <AntDesign name="facebook-square" size={24} color="white" />
              <Text style={styles.facebookButtonText}>Log In with Facebook</Text>
            </TouchableOpacity>
          </View>


          <TouchableOpacity onPress={() => setSelectedForm('signup')}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.forgotP}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity >
      <Text style={styles.switchText}>
        Didn't receive the Verification link? <Text onPress={handleResendVerificationLink} style={styles.linkText}>Resend Verification Link</Text>
      </Text>
    </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formContainer}>
          {step === 1 && (
            <>
              <TextInput value={age} onChangeText={setAge} style={styles.input} placeholder="Age" />
              <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} placeholder="First Name" />
              <TextInput value={lastName} onChangeText={setLastName} style={styles.input} placeholder="Last Name" />
              <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Address" />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => handleNextStep(step, age, firstName, lastName, address, signupPassword, signupConfirmPassword, setStep)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <TextInput value={signupEmail} onChangeText={setSignupEmail} style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
              <View style={styles.passwordContainer}>
                <TextInput value={signupPassword} onChangeText={setSignupPassword} style={styles.input} placeholder="Password" secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="gray" />
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={signupConfirmPassword}
                  onChangeText={setSignupConfirmPassword}
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
                  <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color="gray" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleSignupAttempt}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
        <FlashMessage position="top" />
    </View>
    
  );
};
export default AuthForm;