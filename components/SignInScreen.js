import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import styles from '../styles/signInStyles';
import { sendCodeWithResend } from '../lib/email';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const validateEduEmail = (text) => {
    return text.toLowerCase().endsWith('.edu');
  };

  const handleEmailChange = (text) => {
    setEmail(text);

    if (text.length === 0) {
      setIsValidEmail(true);
      setErrorMessage('');
    } else if (!validateEmail(text)) {
      setIsValidEmail(false);
      setErrorMessage('Please enter a valid email address');
    } else if (!validateEduEmail(text)) {
      setIsValidEmail(false);
      setErrorMessage('Please use a .edu email address');
    } else {
      setIsValidEmail(true);
      setErrorMessage('');
    }
  };


//     const handleContinue = async () => {
//   if (validateEmail(email) && validateEduEmail(email)) {
//     try {
//       const { code, success, error } = await sendCodeWithResend(email.trim());

//       if (success) {
//         Alert.alert('Verification code sent', `Check your email: ${email}`);
//         navigation?.navigate('VerifyScreen', { email, code }); // Pass the code
//       } else {
//         // error might be string or object, handle gracefully
//         const message = error?.message || error || 'Failed to send verification code.';
//         Alert.alert('Error', message);
//         console.error('Verification error:', message);
//       }
//     } catch (err) {
//       Alert.alert('Error', err.message || 'Something went wrong.');
//       console.error('Unexpected error:', err);
//     }
//   } else if (!validateEduEmail(email)) {
//     setIsValidEmail(false);
//     setErrorMessage('Please use a .edu email address');
//   } else {
//     setIsValidEmail(false);
//     setErrorMessage('Please enter a valid email address');
//   }
// };
  const handleContinue = () => {
    if (validateEmail(email) && validateEduEmail(email)) {
      console.log('Sending verification to:', email);
      navigation?.navigate('VerifyScreen', { email });
    } else if (!validateEduEmail(email)) {
      setIsValidEmail(false);
      setErrorMessage('Please use a .edu email address');
    } else {
      setIsValidEmail(false);
      setErrorMessage('Please enter a valid email address');
    }
  };

  const handleSignUp = () => {
    navigation?.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/ribit_main_frog.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Ribit</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Enter your email to sign in to your account
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.emailInput,
                !isValidEmail && styles.inputError
              ]}
              placeholder="your.name@university.edu"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />
            {!isValidEmail && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              !(validateEmail(email) && validateEduEmail(email)) && styles.buttonDisabled
            ]}
            onPress={handleContinue}
            disabled={!(validateEmail(email) && validateEduEmail(email))}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpText}>
              Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}