/**
 * Validate password strength.
 * @param password - The password to validate.
 * @returns Whether the password is valid and an error message if invalid.
 */
export const validatePassword = (password: string): { isValid: boolean; errorMessage: string } => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return {
        isValid: false,
        errorMessage: 'Password must be at least 8 characters, contain an uppercase letter, a number, and a special character.',
      };
    }
    return { isValid: true, errorMessage: '' };
  };
