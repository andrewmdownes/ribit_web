import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import styles from '../styles/driverSignUpStyles';
import { authApi, profileApi} from '../lib/api';
import { sendToResend } from '../lib/email';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Animated } from 'react-native';
import { LayoutAnimation, UIManager } from 'react-native';
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
console.log('DEBUG profileApi:', profileApi);
export default function DriverSignUpScreen({ navigation }) {
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [licenseUri, setLicenseUri] = useState(null);
  const [insuranceUri, setInsuranceUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [carColor, setCarColor] = useState('');
  const [insuranceUploaded, setInsuranceUploaded] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
const [paymentDetails, setPaymentDetails] = useState({
  paypal: '',
  venmo: '',
  zelle: '',
});

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const handleSelectPayment = (method) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setSelectedPayment(method);
};

  // Check if profile exists when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Get profile data
        const { data: profileData, error } = await profileApi.getProfile();
        
        if (error) {
          console.error('Error loading profile:', error);
          return;
        }
        
        if (profileData) {
          // Populate form with existing profile data
          setFirstName(profileData.first_name || '');
          setLastName(profileData.last_name || '');
          
          // If no profile exists, redirect to profile screen
          if (!profileData.first_name || !profileData.last_name) {
            navigation.replace('Profile', { fromDriverSignup: true, requiresCompletion: true });
          }
          
          // Set window.userProfile for other components
          window.userProfile = {
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            email: profileData.email
          };
        } else {
          // No profile found, redirect to profile completion
          navigation.replace('Profile', { fromDriverSignup: true, requiresCompletion: true });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfileData();
  }, [navigation]);




const handleUploadOptions = async (type) => {
  Alert.alert(
    `Upload ${type === 'license' ? "Driver's License" : "Insurance Document"}`,
    'Choose a source',
    [
      {
        text: 'Choose from Library',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            console.log(`${type} selected from library:`, uri);
            if (type === 'license') {
              setLicenseUploaded(true);
              setLicenseUri(uri);
            } else {
              setInsuranceUploaded(true);
              setInsuranceUri(uri);
            }
          }
        },
      },
      
        {
    text: 'Browse Files',
    onPress: async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'video/*'],
      });

      console.log('📂 DocumentPicker result:', result);

      if (result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        console.log(`${type} file picked (new API):`, uri);
        if (type === 'license') {
          setLicenseUploaded(true);
          setLicenseUri(uri);
        } else {
          setInsuranceUploaded(true);
          setInsuranceUri(uri);
        }
      } else if (result.uri) {
        console.log(`${type} file picked (old API):`, result.uri);
        if (type === 'license') {
          setLicenseUploaded(true);
          setLicenseUri(result.uri);
        } else {
          setInsuranceUploaded(true);
          setInsuranceUri(result.uri);
        }
      } else {
        console.warn('❌ No valid URI returned from DocumentPicker');
      }
    },
  },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
};

  
  const handleSubmit = async () => {
    // Validate form
    // Inside handleSubmit, before calling updatePaymentMethod
    const { session } = await authApi.getSession();
    if (!session || !session.user?.id) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

const userId = session.user.id;
    if (!firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name.');
      return;
    }
    
    if (!lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter your last name.');
      return;
    }
    
    if (!licenseUploaded) {
      Alert.alert('Missing Document', 'Please upload your driver\'s license.');
      return;
    }
    
    if (!insuranceUploaded) {
      Alert.alert('Missing Document', 'Please upload your insurance document.');
      return;
    }
    
    // Submit for verification
    console.log('Submitting driver information:', { firstName, lastName, licenseUploaded, insuranceUploaded });
    
    try {
      setLoading(true);
      
      // Update profile to mark as pending verification
      const { data, error } = await profileApi.updateProfile({
      is_driver: true,
      verification_pending: true,
      license_plate: licensePlate,
      car_color: carColor
    });
      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to submit for verification. Please try again.');
        return;
      }
      
      console.log('Updated profile with verification pending status:', data);
      // Send both uploaded documents
      const getFileNameFromUri = (uri, fallbackName) => {
        const parts = uri.split('/');
        const last = parts[parts.length - 1];
        return last.includes('.') ? last : fallbackName;
      };

      const licenseFilename = getFileNameFromUri(licenseUri, 'driver_license_upload.jpg');
      const insuranceFilename = getFileNameFromUri(insuranceUri, 'insurance_upload.pdf');

      const subject = `Driver Verification - ${firstName} ${lastName}`;
      await sendToResend(licenseUri, licenseFilename, subject);
      await sendToResend(insuranceUri, insuranceFilename, subject);
      const paymentPayload = {
  userId,
  selectedPayment,
  paymentDetails: {
    [selectedPayment]: paymentDetails[selectedPayment] || '',
  },
};

console.log("🔍 Payment update payload:", paymentPayload);
      const { error: paymentError, data: paymentData } = await profileApi.updatePaymentMethod({
        userId,
        selectedPayment,
        paymentDetails: {
          [selectedPayment]: paymentDetails[selectedPayment] || '',
        },
      });

      if (paymentError) {
        console.error('Payment update error:', paymentError);
        Alert.alert("Error", "Failed to save payment method.");
        return;
      } else {
        console.log("Updated payment info:", paymentData);
      }
Alert.alert('Success', 'Documents have been sent for verification.');

      // Set verification status to pending in global window object for other components
      if (window && typeof window.setPendingVerification === 'function') {
        window.setPendingVerification();
      } else {
        // Set it if not exists
        window.setPendingVerification = () => {
          console.log('Setting verification status to pending');
        };
        window.setPendingVerification();
      }
      
      // Navigate to the verification status screen
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('VerificationStatus');
      }, 500);
    } catch (error) {
      console.error('Verification submission error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Become a Driver</Text>
        </View>
        
        {/* NEW: Content wrapper for grey background (following pattern from other screens) */}
        <View style={styles.content}>
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.sectionTitle}>Driver Registration</Text>
            <Text style={styles.sectionDescription}>
              To offer rides, we need to verify your driver information. This helps ensure safety and trust in our community.
            </Text>
            
            {/* Personal Information Section */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Personal Information</Text>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Smith"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
                
              </View>
            <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>License Plate Number</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC-1234"
                value={licensePlate}
                onChangeText={setLicensePlate}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Car Color</Text>
              <TextInput
                style={styles.input}
                placeholder="Blue"
                value={carColor}
                onChangeText={setCarColor}
              />
            </View>
          </View>


            </View>
            
            {/* Documents Section */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Required Documents</Text>
              
              <View style={styles.uploadSection}>
                <Text style={styles.inputLabel}>Driver's License (Front)</Text>
                <TouchableOpacity 
                  style={[
                    styles.uploadContainer, 
                    licenseUploaded && styles.fileUploaded
                  ]}
                  onPress={() => handleUploadOptions('license')}
                >
                 {licenseUploaded && licenseUri ? (
    <Text style={styles.fileNameText}>{licenseUri.split('/').pop()}</Text>
  ) : (
    <Text style={styles.uploadPlaceholder}>No file selected</Text>
  )}
                  <TouchableOpacity 
                    style={styles.uploadButton}
                  onPress={() => handleUploadOptions('license')}
                  >
                    <Text style={styles.uploadButtonText}>
                      {licenseUploaded ? 'Change' : 'Upload'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                <Text style={styles.requirementText}>
                  Clear photo of your valid driver's license (front)
                </Text>
              </View>
              
              <View style={styles.uploadSection}>
                <Text style={styles.inputLabel}>Insurance Document</Text>

                <TouchableOpacity
                  style={[
                    styles.uploadContainer,
                    insuranceUploaded && styles.fileUploaded,
                  ]}
                  onPress={() => handleUploadOptions('insurance')}
                >
                 {insuranceUploaded && insuranceUri ? (
                    <Text style={styles.fileNameText}>{insuranceUri.split('/').pop()}</Text>
                  ) : (
                    <Text style={styles.uploadPlaceholder}>No file selected</Text>
                  )}

                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUploadOptions('insurance')}
                >
                  <Text style={styles.uploadButtonText}>
                    {insuranceUploaded ? 'Change' : 'Upload'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.requirementText}>
                  Current insurance policy showing your name and coverage
                </Text>
              </View>
            </View>
            {/* Payment Section */}
  <View style={styles.formSection}>
    <Text style={styles.formSectionTitle}>Preferred Payment Method</Text>

    <View style={styles.paymentOptionsContainer}>
      {['paypal', 'venmo', 'zelle'].map((method) => (
        <TouchableOpacity
          key={method}
          style={[
            styles.paymentOptionBox,
            selectedPayment === method
              ? styles.paymentOptionSelected
              : styles.paymentOptionUnselected
          ]}
        onPress={() => handleSelectPayment(method)}
        >
          <Text
            style={[
              styles.paymentOptionText,
              selectedPayment === method && styles.paymentOptionTextSelected
            ]}
          >
            {method.charAt(0).toUpperCase() + method.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    <Animated.View
      style={[
        styles.paymentFormWrapper,
        { opacity: selectedPayment ? 1 : 0, transform: [{ scale: selectedPayment ? 1 : 0.95 }] },
      ]}
    >
      {selectedPayment && (
        <>
          <Text style={styles.inputLabel}>
            {selectedPayment.charAt(0).toUpperCase() + selectedPayment.slice(1)} Email / Phone / Username
          </Text>
          <TextInput
            style={styles.inputField}
            placeholder={`Enter your ${selectedPayment} account`}
            value={paymentDetails[selectedPayment]}
            onChangeText={(text) =>
              setPaymentDetails((prev) => ({ ...prev, [selectedPayment]: text }))
            }
            keyboardType="email-address"
          />
        </>
      )}
    </Animated.View>
  </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit for Verification</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}