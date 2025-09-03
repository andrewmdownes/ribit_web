import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import styles from '../styles/driverVerificationStatusStyles';
import { authApi, profileApi } from '../lib/api';

export default function DriverVerificationStatusScreen({ navigation }) {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const alertShown = useRef(false);
  
  // Check verification status when the component mounts
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        setLoading(true);
        
        // Get profile data
        const { data: profileData, error } = await profileApi.getProfile();
        
        if (error) {
          console.error('Error loading profile:', error);
          setLoading(false);
          return;
        }
        
        // Check if already verified on mount
        if (profileData && profileData.is_verified_driver) {
          setIsVerified(true);
          
          if (!alertShown.current) {
            showVerificationAlert();
          }
        }
        
        // Define or redefine the verification function for global access
        window.verifyDriver = async () => {
          try {
            console.log('Verifying driver status...');
            
            // Update profile to mark as verified
            const { data, error: updateError } = await profileApi.updateProfile({
              is_verified_driver: true,
              verification_pending: false
            });
            
            if (updateError) {
              console.error('Error updating verification status:', updateError);
              return;
            }
            
            console.log('Driver verification complete:', data);
            
            // Update local state and show alert if not already shown
            if (!alertShown.current) {
              setIsVerified(true);
              showVerificationAlert();
            }
          } catch (err) {
            console.error('Error in verifyDriver function:', err);
          }
        };
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkVerificationStatus();
    
    // Check status again whenever the screen gets focus
    const unsubscribe = navigation.addListener('focus', checkVerificationStatus);
    return unsubscribe;
  }, [navigation]);
  
  // Fixed showVerificationAlert function with correct navigation
  const showVerificationAlert = () => {
    // Set the ref so we don't show the alert again
    alertShown.current = true;
    
    Alert.alert(
      'Verification Complete',
      'Your driver account has been verified. You can now offer rides.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MainTabs', { 
            screen: 'Home',  // Navigate to Home screen inside MainTabs
            params: { verified: true }
          })
        }
      ]
    );
  };

  // Function to simulate verification approval (for testing only)
  const handleApproveVerification = async () => {
    if (!alertShown.current) {
      if (window.verifyDriver) {
        window.verifyDriver();
        console.log("Driver verification triggered from test button");
      } else {
        console.log('DEBUG: verifyDriver function not available');
        
        Alert.alert(
          'Developer Testing',
          'To verify this driver, open your browser console and run: window.verifyDriver()',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Verification</Text>
      </View>
      
      {/* NEW: Content wrapper for grey background (following pattern from other screens) */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#87d77c" />
            <Text style={styles.loadingText}>
              Checking verification status...
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer}>
            <View style={styles.statusCard}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{isVerified ? '✓' : '🕒'}</Text>
              </View>
              
              <Text style={styles.statusTitle}>
                {isVerified ? 'Verification Complete' : 'Verification Pending'}
              </Text>
              
              <Text style={styles.statusDescription}>
                {isVerified 
                  ? 'Your driver account has been verified. You can now offer rides!'
                  : 'We\'re reviewing your driver information. This process typically takes 1-2 business days. You\'ll receive a notification once your verification is complete.'}
              </Text>
              
              <View style={styles.statusInfo}>
                <View style={styles.statusView}>
                  <View style={[
                    styles.statusDot, 
                    isVerified ? styles.statusVerified : styles.statusPending
                  ]} />
                  <Text style={[
                    styles.statusText, 
                    isVerified ? styles.statusVerifiedText : styles.statusPendingText
                  ]}>
                    {isVerified ? 'Verified Driver' : 'Pending Review'}
                  </Text>
                </View>
              </View>
              
              {!isVerified && (
                <>
                  <View style={styles.divider} />
                  
                  <Text style={styles.sectionTitle}>What's Next?</Text>
                  
                  <View style={styles.stepContainer}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>1</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Review Process</Text>
                      <Text style={styles.stepDescription}>
                        Our team is reviewing your license and insurance information to ensure 
                        everything meets our safety standards.
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.stepContainer}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>2</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Approval</Text>
                      <Text style={styles.stepDescription}>
                        Once approved, you'll be able to post rides and start sharing your journeys
                        with fellow travelers.
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.stepContainer}>
                    <View style={styles.stepNumberContainer}>
                      <Text style={styles.stepNumber}>3</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Start Driving</Text>
                      <Text style={styles.stepDescription}>
                        Set your routes, prices, and preferences to begin offering rides to 
                        passengers going your way.
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
            
            {/* Fixed return button with correct navigation */}
            <TouchableOpacity 
              style={styles.returnButton}
              onPress={() => navigation.navigate('MainTabs', { 
                screen: 'Home',  // Navigate to Home screen inside MainTabs
                params: isVerified ? { verified: true } : {}
              })}
            >
              <Text style={styles.returnButtonText}>Return to Home</Text>
            </TouchableOpacity>
            
            {/* This button would be hidden in production - for testing only */}
            {__DEV__ && !isVerified && (
              <TouchableOpacity 
                style={styles.devButton}
                onPress={handleApproveVerification}
              >
                <Text style={styles.devButtonText}>
                  [DEV] Test Verification
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}