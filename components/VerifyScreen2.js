import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from '../styles/verifyStyles';
import { authApi } from '../lib/api';
import * as Clipboard from 'expo-clipboard';

export default function VerifyScreen({ route, navigation }) {
  const { email } = route?.params || { email: 'user@university.edu' };
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const hiddenInputRef = useRef(null);
const [activeIndex, setActiveIndex] = useState(0);

  // Display partially masked email for privacy
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

  const handleBoxPress = (index) => {
  setActiveIndex(index);
  hiddenInputRef.current?.focus();
 
};

const handlePasteCode = async () => {
  try {
    const clipboardText = await Clipboard.getStringAsync();
    const digits = clipboardText.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      const digitsArray = digits.split('');
      setVerificationCode(digitsArray);
      setActiveIndex(5); // move active index to last digit
      hiddenInputRef.current?.focus();
    } else {
      Alert.alert('Invalid Code', 'Clipboard does not contain a 6-digit numeric code.');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to access clipboard.');
  }
};

  // Called when user types or pastes into the hidden input
const handleChangeText = (text) => {
  const digits = text.replace(/\D/g, '').slice(0, 6);
  const digitsArray = digits.split('');
  while (digitsArray.length < 6) digitsArray.push('');

  setVerificationCode(digitsArray);

  // Set active index to first empty or last position
  const firstEmptyIndex = digitsArray.findIndex(d => d === '');
  setActiveIndex(firstEmptyIndex === -1 ? 5 : firstEmptyIndex);
};

  // Focus the hidden input automatically on mount
useEffect(() => {
  hiddenInputRef.current?.focus();
  const firstEmptyIndex = verificationCode.findIndex(d => d === '');
  setActiveIndex(firstEmptyIndex === -1 ? 5 : firstEmptyIndex);
}, []);

  // When user taps on any box, focus the hidden input
  const focusHiddenInput = () => {
    hiddenInputRef.current?.focus();
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');

    if (code.length === 6 && !verificationCode.includes('')) {
      setLoading(true);

      try {
        const { data, error } = await authApi.verifyWithCode(email, code);

        if (error) {
          Alert.alert('Verification Failed', error.message || 'Invalid code. Please try again.');
          setLoading(false);
          return;
        }

        // Success: navigate to main screen
        navigation.replace('MainTabs');
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Incomplete Code', 'Please enter all 6 digits of your verification code.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Verification</Text>

          <Text style={styles.subtitle}>
            Enter verification code for {'\n'}
            <Text style={styles.emailText}>{maskEmail(email)}</Text>
          </Text>

          <Text style={{ textAlign: 'center', color: '#666', marginBottom: 15 }}>
            Use code 123456 for testing
          </Text>

          <TouchableOpacity style={styles.codeContainer} onPress={focusHiddenInput} activeOpacity={1}>
            {verificationCode.map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.codeInput,
                    digit === '' && styles.emptyCodeInput, // style for empty box if needed
                  activeIndex === index && styles.activeCodeInput, // highlight active box
                ]}
              >
                <Text style={styles.codeInputText}>{digit}</Text>
              </View>
            ))}
          </TouchableOpacity>

          {/* Hidden input to capture all input */}
          <TextInput
            ref={hiddenInputRef}
            value={verificationCode.join('')}
            onChangeText={handleChangeText}
            keyboardType="number-pad"
            maxLength={6}
            style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
            autoFocus={true}
            caretHidden={true}
            editable={!loading}
          />
          <TouchableOpacity
  onPress={handlePasteCode}
  disabled={loading}
  activeOpacity={0.6}
>
  <Text style={styles.pasteCodeText}>Paste Code</Text>
</TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              (verificationCode.join('').length !== 6 || loading) && styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={verificationCode.join('').length !== 6 || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.changeEmailButton} onPress={() => navigation?.goBack()} disabled={loading}>
            <Text style={styles.changeEmailText}>Change Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
