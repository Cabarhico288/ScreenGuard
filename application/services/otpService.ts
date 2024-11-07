// services/otpService.ts
import { sendEmailVerification, User } from 'firebase/auth'; // Ensure correct import for sendEmailVerification
import { showMessage } from 'react-native-flash-message';

/**
 * Function to generate a random OTP
 * @returns {string} - A 6-digit OTP
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Function to send OTP to the provided email
 * @param user - The Firebase user object after signing up
 * @param otp - The OTP to send via email
 */
export const sendOtpToEmail = async (user: User, otp: string) => {
  try {
    // Make sure you're using a valid Firebase user object here
    await sendEmailVerification(user);  // Firebase's method to send verification email

    // Display OTP in a flash message (for development purposes)
    showMessage({
      message: 'OTP Sent',
      description: `Your OTP is: ${otp} (In real-world apps, this would be sent via email).`,
      type: 'success',
      icon: 'success',
      duration: 8000,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    showMessage({
      message: 'Error Sending OTP',
      description: error.message,
      type: 'danger',
      icon: 'danger',
      duration: 8000,
    });
  }
};


/**
 * Function to verify if the provided OTP matches the generated one
 * @param providedOtp - The OTP inputted by the user
 * @param generatedOtp - The OTP that was generated and sent
 * @returns {boolean} - Whether the OTP is valid or not
 */
export const verifyOtp = (providedOtp: string, generatedOtp: string): boolean => {
  return providedOtp === generatedOtp;
};
