// components/SignUpScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import styles from '../styles/signUpStyles';
import { authApi } from '../lib/api';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  const handleContinue = async () => {
    if (validateEmail(email) && validateEduEmail(email)) {
      setLoading(true);
      
      try {
        const { error } = await authApi.signUp(email);
        
        if (error) {
          console.error('Signup error:', error);
          Alert.alert('Error', error.message || 'Failed to sign up');
          setLoading(false);
          return;
        }
        
        // Navigate to verification screen
        navigation.navigate('VerifyScreen', { email });
      } catch (err) {
        console.error('Error:', err);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (!validateEduEmail(email)) {
      setIsValidEmail(false);
      setErrorMessage('Please use a .edu email address');
    } else {
      setIsValidEmail(false);
      setErrorMessage('Please enter a valid email address');
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
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
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>
            Enter your .edu email to create an account
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
              editable={!loading}
            />
            {!isValidEmail && (
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.button,
              (!(validateEmail(email) && validateEduEmail(email)) || loading) && styles.buttonDisabled
            ]} 
            onPress={handleContinue}
            disabled={!(validateEmail(email) && validateEduEmail(email)) || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSignIn} disabled={loading}>
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}