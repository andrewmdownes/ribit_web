// components/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/profileScreenStyles';
import { authApi, profileApi } from '../lib/api';

export default function ProfileScreen({ navigation, route }) {
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [editing, setEditing] = useState(true);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [rating, setRating] = useState(null);
  const [rideCount, setRideCount] = useState(0);
  const [rideTakenCount, setRideTakenCount] = useState(0);
  const [phone, setPhone] = useState('');

  // Phone number formatting function
  const formatPhoneNumber = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.substring(0, 10);
    
    // Apply formatting based on length
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  // Handle phone number input change
  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  // Extract raw phone number for database storage
  const getRawPhoneNumber = (formattedPhone) => {
    return formattedPhone.replace(/\D/g, '');
  };

  // Load profile data when component mounts
  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (route?.params?.requiresCompletion) {
      Alert.alert(
        'Complete Your Profile',
        'Please fill out all required information before booking a ride.'
      );
    }
  }, [route?.params?.requiresCompletion]);

  // Load profile data from Supabase
  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { session } = await authApi.getSession();
      
      if (!session) {
        console.log('No authenticated session found');
        navigation.replace('SignUp');
        return;
      }
      
      // Get current profile data
      const { data, error } = await profileApi.getProfile();
      
      if (error) {
        console.error('Error loading profile:', error);
        
        // If required to complete profile, stay in edit mode
        if (route?.params?.requiresCompletion) {
          setLoading(false);
          return;
        }
        
        Alert.alert('Error', 'Failed to load profile information');
        return;
      }
      
      if (data) {
        console.log('Profile loaded:', data);
        
        // Set profile data to state
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        
        // Format date from database format (YYYY-MM-DD) to MM/DD/YYYY
        if (data.dob) {
          try {
            const dateParts = data.dob.split('-');
            if (dateParts.length === 3) {
              // Format from YYYY-MM-DD to MM/DD/YYYY
              setDob(`${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`);
            } else {
              // If already in MM/DD/YYYY format, use as is
              setDob(data.dob);
            }
          } catch (e) {
            console.error('Error formatting date:', e);
            setDob(data.dob || '');
          }
        } else {
          setDob('');
        }
        
        setProfileImage(data.avatar_url || null);
        setBio(data.about_me || '');
        
        // Format phone number for display if it exists
        if (data.phone) {
          setPhone(formatPhoneNumber(data.phone));
        } else {
          setPhone('');
        }
        
        setRating(data.rating ? parseFloat(data.rating).toFixed(1) : null);
        setRideCount(data.ride_count || 0);
        setRideTakenCount(data.booking_count || 0);

        // If profile is complete, set editing to false unless explicitly requested
        const isProfileComplete = !!(data.first_name && data.last_name && data.dob);
        setEditing(route?.params?.requiresCompletion || !isProfileComplete);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong while loading your profile');
    } finally {
      setLoading(false);
    }
  };
  
  // Save profile data
  const saveProfile = async () => {
    // Validate form
    if (!firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name.');
      return;
    }
    
    if (!lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter your last name.');
      return;
    }
    
    if (!dob.trim()) {
      Alert.alert('Missing Information', 'Please enter your date of birth.');
      return;
    }
    
    // Validate date format (MM/DD/YYYY)
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(dob)) {
      Alert.alert('Invalid Date', 'Please enter date in MM/DD/YYYY format.');
      return;
    }

    // Validate phone number (optional but if provided should be 10 digits)
    const rawPhone = getRawPhoneNumber(phone);
    if (phone && rawPhone.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    
    try {
      setSaveLoading(true);
      
      // Convert date format from MM/DD/YYYY to YYYY-MM-DD for database
      let formattedDob = dob;
      try {
        const parts = dob.split('/');
        if (parts.length === 3) {
          formattedDob = `${parts[2]}-${parts[0]}-${parts[1]}`;
        }
      } catch (e) {
        console.error('Error converting date format:', e);
      }
      
      // Prepare profile data
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        dob: formattedDob,
        about_me: bio,
        phone: rawPhone, // Store raw phone number in database
        ...(profileImage && { avatar_url: profileImage })
      };
      
      console.log('Saving profile data:', profileData);
      
      // Save profile data to Supabase
      const { data, error } = await profileApi.updateProfile(profileData);
      
      if (error) {
        console.error('Error saving profile:', error);
        Alert.alert('Error', 'Failed to save profile. Please try again.');
        return;
      }
      
      console.log('Profile saved successfully:', data);
      
      // Handle different navigation flows
      if (route.params?.fromDriverSignup) {
        navigation.navigate('DriverSignUp');
      } else if (route.params?.fromRideDetail && route.params?.returnTo === 'StripeApp') {
        // User came from booking flow, redirect to payment
        navigation.navigate('StripeApp', route.params.returnParams);
      } else if (route.params?.requiresCompletion) {
        // New user completed profile, go to main screen
        navigation.replace('MainTabs');
      } else {
        // Exit edit mode
        setEditing(false);
        
        // Show success message
        Alert.alert(
          'Profile Saved',
          'Your profile information has been saved successfully.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('Profile save error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      navigation.replace('SignUp');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };
  
  // Pick image from library
  const pickImage = async () => {
    setShowImageOptions(false);
    
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select a profile picture.');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    setShowImageOptions(false);
    
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
      return;
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };
  
  // Format DOB input (MM/DD/YYYY)
  const formatDOB = (text) => {
    let cleaned = text.replace(/\D/g, ''); // Remove all non-digit characters
    let formatted = '';

    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    // Only auto-add a slash if the user is typing forward (not deleting)
    if (
      (dob.length === 1 && formatted.length === 2) || // going from M to MM
      (dob.length === 4 && formatted.length === 5)    // going from MM/D to MM/DD
    ) {
      formatted += '/';
    }

    setDob(formatted);
  };

  // FIXED: Loading state now includes proper content wrapper
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={route?.params?.requiresCompletion}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          {!route.params?.requiresCompletion && (
            <View style={styles.editButton}>
              <Text style={styles.editButtonText}></Text>
            </View>
          )}
        </View>
        
        {/* FIXED: Added content wrapper for grey background */}
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#87d77c" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            disabled={route?.params?.requiresCompletion}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          {!route.params?.requiresCompletion && !loading && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setEditing(!editing)}
            >
              <Text style={styles.editButtonText}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Add content wrapper for grey background */}
        <View style={styles.content}>
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity 
                disabled={!editing}
                style={styles.profileImageWrapper}
                onPress={() => editing && setShowImageOptions(true)}
              >
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage} 
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Text style={styles.profilePlaceholderText}>
                      {firstName && lastName 
                        ? `${firstName.charAt(0)}${lastName.charAt(0)}`
                        : '?'}
                    </Text>
                  </View>
                )}
                
                {editing && (
                  <View style={styles.editIconContainer}>
                    <Text style={styles.editIconText}>📷</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {editing && (
                <Text style={styles.profileImageHint}>
                  Adding a profile photo increases your chances of getting matched with rides
                </Text>
              )}
            </View>
            
            <View style={styles.formSection}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>First Name <Text style={{ color: 'red' }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={editing}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Last Name <Text style={{ color: 'red' }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Smith"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={editing}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date of Birth <Text style={{ color: 'red' }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  value={dob}
                  onChangeText={formatDOB}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={editing}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number <Text style={{ color: 'red' }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={14} // Allow for formatted length: (123) 456-7890
                  editable={editing}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>About Me</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChangeText={setBio}
                  editable={editing}
                />
              </View>
            </View>
            
            {editing && (
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveProfile}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {route.params?.fromRideDetail ? 'Save & Continue to Payment' : 'Save Profile'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            
            {!editing && (
              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{rideTakenCount}</Text>
                  <Text style={styles.statLabel}>Rides Taken</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{rideCount}</Text>
                  <Text style={styles.statLabel}>Rides Offered</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {rating !== null ? `⭐ ${rating}` : '⭐ N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            )}
            
            {!route.params?.requiresCompletion && (
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: '#ff6b6b', marginTop: 20 }]}
                onPress={handleSignOut}
              >
                <Text style={styles.saveButtonText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        
        {/* Image Selection Modal */}
        <Modal
          visible={showImageOptions}
          transparent={true}
          animationType="fade"
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowImageOptions(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={takePhoto}
              >
                <Text style={styles.modalOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={pickImage}
              >
                <Text style={styles.modalOptionText}>Choose from Library</Text>
              </TouchableOpacity>
              
              {profileImage && (
                <TouchableOpacity 
                  style={[styles.modalOption, styles.removeOption]}
                  onPress={() => {
                    setProfileImage(null);
                    setShowImageOptions(false);
                  }}
                >
                  <Text style={styles.removeOptionText}>Remove Photo</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.cancelOption}
                onPress={() => setShowImageOptions(false)}
              >
                <Text style={styles.cancelOptionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}