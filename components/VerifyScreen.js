import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from '../styles/verifyStyles';
import { authApi } from '../lib/api';

export default function VerifyScreen({ route, navigation }) {
  const { email } = route?.params || { email: 'user@university.edu' };
  const [loading, setLoading] = useState(false);

  // Mask email for privacy
  const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    let maskedUsername = username;
    if (username.length > 2) {
      maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    }
    return `${maskedUsername}@${domain}`;
  };

  const handleGoBack = () => {
    if (loading) return;
    try {
      navigation.goBack();
    } catch (error) {
      Alert.alert('Navigation Error', 'Could not go back. Please try again.');
    }
  };

const handleContinue = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Call your auth API to verify and sign in with hardcoded code '123456'
      const { data, error } = await authApi.verifyWithCode(email, '123456');
      if (error) {
        Alert.alert('Verification Failed', error.message || 'Could not verify. Please try again.');
        setLoading(false);
        return;
      }
      // Success: navigate to main app screen
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to verify and continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to {'\n'}
            <Text style={styles.emailText}>{maskEmail(email)}</Text>
          </Text>
          <Text style={{ textAlign: 'center', marginTop: 5, marginBottom: 20, color: '#444', fontSize: 16 }}>
            Please check your email and click the verification link to continue.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleGoBack}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Back to Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { marginTop: 15 }]}
            onPress={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue [Testing]</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
