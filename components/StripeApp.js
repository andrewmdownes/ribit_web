import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
  SafeAreaView
} from "react-native";
import styles from '../styles/stripeAppStyles';
import { ridesApi, authApi, profileApi } from '../lib/api';
import { getPassengerPricingBreakdown } from '../lib/distances';

// Import from our platform-specific wrapper
import { CardField, useConfirmPayment } from '../lib/stripeWrapper';

// UPDATED: Default to Vercel server (replace with your actual domain)
const API_URL = "https://landing-page-jet-rho-33.vercel.app";

// Alternative if you want to easily switch for local testing:
// const API_URL = "http://192.168.86.78:3000";  // Uncomment for local testing

export default function StripeApp({ route, navigation }) {
  const { ride, seats, totalPrice, luggage } = route.params;

  const [cardDetails, setCardDetails] = useState();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreesToTerms, setAgreesToTerms] = useState(false);
  
  // Payment hooks
  const { confirmPayment, loading: confirmLoading } = useConfirmPayment();

  const pricingBreakdown = getPassengerPricingBreakdown(ride.price, seats);
  
  // Load user email on component mount
  useEffect(() => {
    loadUserEmail();
  }, []);

  const loadUserEmail = async () => {
    try {
      const { session } = await authApi.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        console.log('👤 User email loaded:', session.user.email);
      } else {
        // Fallback to profile email
        const { data: profile } = await profileApi.getProfile();
        if (profile?.email) {
          setUserEmail(profile.email);
          console.log('👤 Profile email loaded:', profile.email);
        }
      }
    } catch (error) {
      console.error('❌ Error loading user email:', error);
      Alert.alert('Error', 'Could not load user information');
    }
  };

  // Test server connection function
  const testServerConnection = async () => {
    if (!agreesToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions to continue.");
      return;
    }

    setLoading(true);

    try {
    const luggagePayload = {
      small: luggage.small ?? 0,
      medium: luggage.medium ?? 0,
      large: luggage.large ?? 0,
    };

    const { data, error } = await ridesApi.bookRide(ride.id, seats, luggagePayload);
      if (error) {
        console.error('Booking error:', error);
        Alert.alert("Booking Error", "Failed to book ride. Please try again.");
        return;
      }

      Alert.alert("Success", "Booking successful!", [
        {
          text: "OK",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'MainTabs',
                  state: {
                    index: 1, // Navigate to My Rides tab
                    routes: [
                      { name: 'Home' },
                      { name: 'My Rides', params: { initialTab: 'booked', refresh: true } },
                      { name: 'Profile' }
                    ],
                  },
                },
              ],
            });
          }
        }
      ]);
    } catch (err) {
      console.error('Booking error:', err);
      Alert.alert("Booking Error", "Failed to book ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Fetch payment intent from Vercel backend
  const fetchPaymentIntentClientSecret = async () => {
    try {
      console.log('🔗 Fetching payment intent from:', `${API_URL}/api/create-payment-intent`);
      console.log('📋 Payment details:', {
        amount: totalPrice * 100,
        email: userEmail,
        rideId: ride.id,
        seats,
      });
      
      const response = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice * 100,
          email: userEmail,
          rideId: ride.id,
          seats,
        }),
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment intent request failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Payment intent response:', { 
        hasClientSecret: !!data.clientSecret,
        clientSecretPrefix: data.clientSecret?.substring(0, 20) + '...'
      });
      
      if (data.error) {
        console.error('❌ Backend returned error:', data.error);
        return { clientSecret: null, error: data.error };
      }
      
      return { clientSecret: data.clientSecret, error: null };
    } catch (err) {
      console.error("💥 Payment intent error:", err);
      return { error: `Network error: ${err.message}` };
    }
  };

  const handleCardPayment = async () => {
    console.log('💳 Starting card payment process...');
    console.log('🎯 Card details complete:', cardDetails?.complete);
    console.log('📋 Terms agreed:', agreesToTerms);
    console.log('🔧 Platform:', Platform.OS);

    if (!cardDetails?.complete) {
      console.log('❌ Card details incomplete');
      Alert.alert("Incomplete Card", "Please enter complete card details.");
      return;
    }

    if (!agreesToTerms) {
      console.log('❌ Terms not agreed');
      Alert.alert("Terms Required", "Please agree to the terms and conditions to continue.");
      return;
    }

    if (!confirmPayment) {
      console.log('❌ confirmPayment function not available');
      Alert.alert("Error", "Payment not available on this platform.");
      return;
    }

    try {
      setLoading(true);
      console.log('💳 Starting card payment process...');
      
      const { clientSecret, error } = await fetchPaymentIntentClientSecret();
      if (error) {
        console.error('❌ Failed to get client secret:', error);
        Alert.alert("Payment Error", error);
        return;
      }

      if (!clientSecret) {
        console.error('❌ No client secret received');
        Alert.alert("Payment Error", "Failed to initialize payment. Please try again.");
        return;
      }

      console.log('🔐 Confirming payment with Stripe...');
      const { paymentIntent, error: confirmError } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: { 
            email: userEmail,
            name: userEmail.split('@')[0] // Use email prefix as name fallback
          },
        },
      });

      if (confirmError) {
        console.error('❌ Payment failed:', confirmError);
        
        // More specific error messages
        let errorMessage = confirmError.message;
        if (confirmError.type === 'card_error') {
          errorMessage = `Card Error: ${confirmError.message}`;
        } else if (confirmError.type === 'validation_error') {
          errorMessage = `Validation Error: ${confirmError.message}`;
        }
        
        Alert.alert("Payment Failed", errorMessage);
      } else if (paymentIntent) {
        console.log('✅ Payment successful:', paymentIntent.status);
        
        if (paymentIntent.status === 'succeeded') {
          await completeBooking();
        } else {
          console.error('❌ Payment not successful. Status:', paymentIntent.status);
          Alert.alert("Payment Issue", `Payment status: ${paymentIntent.status}. Please try again.`);
        }
      } else {
        console.error('❌ No payment intent returned');
        Alert.alert("Payment Error", "No payment response received. Please try again.");
      }
    } catch (error) {
      console.error('💥 Unexpected payment error:', error);
      Alert.alert("Error", `Something went wrong: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

const completeBooking = async () => {
  try {
    console.log('📝 Booking ride after successful payment...');
    
    // Prepare luggage payload
    const luggagePayload = {
      small: luggage?.small ?? 0,
      medium: luggage?.medium ?? 0,
      large: luggage?.large ?? 0,
    };

    // Make the booking call with luggage
    const { data, error } = await ridesApi.bookRide(ride.id, seats, luggagePayload);
    
    if (error) {
      console.error('❌ Booking error after payment:', error);
      Alert.alert("Booking Error", "Payment successful but booking failed. Please contact support.");
      return;
    }
    
    console.log('✅ Booking successful after payment:', data);
    
    Alert.alert("Success", "Payment and booking successful!", [
      {
        text: "OK",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'MainTabs',
                state: {
                  index: 1, // Navigate to My Rides tab (index 1)
                  routes: [
                    { name: 'Home' },
                    { name: 'My Rides', params: { initialTab: 'booked', refresh: true } },
                    { name: 'Profile' }
                  ],
                },
              },
            ],
          });
        }
      }
    ]);
    
  } catch (bookingErr) {
    console.error('💥 Booking error:', bookingErr);
    Alert.alert("Booking Error", "Payment successful but booking failed. Please contact support.");
  }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Check if time is already formatted (contains AM/PM)
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString; // Already formatted, return as is
    }
    
    // Handle both HH:mm and HH:mm:ss formats
    const timeParts = timeString.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = timeParts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  // Debug card field changes
  const handleCardChange = (details) => {
    console.log('🎯 Card field changed:', {
      complete: details.complete,
      hasError: !!details.error,
      errorMessage: details.error?.message
    });
    setCardDetails(details);
  };

  // Render for all platforms - removed web restriction
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Development Test Button - Only show in development */}
          {__DEV__ && (
            <TouchableOpacity 
              onPress={testServerConnection}
              style={styles.testButton}
            >
              <Text style={styles.testButtonText}>Skip Payment (TESTING)</Text>
            </TouchableOpacity>
          )}

          {/* Environment Indicator */}
          <View style={{
            backgroundColor: __DEV__ ? '#ff6b6b' : '#5DBE62',
            padding: 8,
            borderRadius: 4,
            marginBottom: 16,
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              {__DEV__ ? '🔧 DEVELOPMENT MODE' : '🚀 PRODUCTION MODE'}
            </Text>
            <Text style={{ color: 'white', fontSize: 10 }}>
              API: {API_URL} | Platform: {Platform.OS}
            </Text>
            {__DEV__ && cardDetails && (
              <Text style={{ color: 'white', fontSize: 10 }}>
                Card Ready: {cardDetails.complete ? '✅' : '❌'}
              </Text>
            )}
          </View>

          {/* Ride Summary Card */}
          <View style={styles.rideCard}>
            <Text style={styles.cardTitle}>Ride Summary</Text>
            
            <View style={styles.routeContainer}>
              <View style={styles.routeIconsContainer}>
                <View style={styles.originDot} />
                <View style={styles.routeLine} />
                <View style={styles.destinationDot} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.locationText}>{ride.from}</Text>
                <Text style={styles.locationText}>{ride.to}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rideDetailsRow}>
              <View style={styles.rideDetail}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(ride.date)}</Text>
              </View>
              <View style={styles.rideDetail}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{formatTime(ride.time)}</Text>
              </View>
            </View>

            <View style={styles.rideDetailsRow}>
              <View style={styles.rideDetail}>
                <Text style={styles.detailLabel}>Driver</Text>
                <Text style={styles.detailValue}>{ride.driver?.name || 'Unknown'}</Text>
              </View>
              <View style={styles.rideDetail}>
                <Text style={styles.detailLabel}>Seats</Text>
                <Text style={styles.detailValue}>{seats} seat{seats > 1 ? 's' : ''}</Text>
              </View>
            </View>

            <View style={styles.rideDetailsRow}>
              <View style={styles.rideDetail}>
                <Text style={styles.detailLabel}>Driver's Price</Text>
                <Text style={styles.detailValue}>${ride.price}</Text>
              </View>
              <View style={styles.rideDetail}>
                <Text style={styles.detailLabel}>Your Discount</Text>
                <Text style={styles.detailValue}>{Math.round((1-pricingBreakdown.discountPercentage )* 100)}%</Text>
              </View>
            </View>

            {seats > 1 && (
              <View style={styles.rideDetailsRow}>
                <View style={styles.rideDetail}>
                  <Text style={styles.detailLabel}>Price per Seat</Text>
                  <Text style={styles.detailValue}>${pricingBreakdown.pricePerSeat}</Text>
                </View>
                <View style={styles.rideDetail}>
                  <Text style={styles.detailLabel}>You Save</Text>
                  <Text style={styles.savingsValue}>${pricingBreakdown.savings}</Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total</Text>
              <Text style={styles.priceValue}>${totalPrice}</Text>
            </View>
          </View>

          {/* Payment Methods Card */}
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Payment Method</Text>

            {/* Card Payment */}
            <Text style={styles.sectionLabel}>Card Details</Text>
            {CardField && (
              <CardField
                postalCodeEnabled={true}
                placeholder={{ number: "4242 4242 4242 4242" }}
                cardStyle={styles.card}
                style={styles.cardContainer}
                onCardChange={handleCardChange}
              />
            )}
            
            {/* Show card validation status in dev mode */}
            {__DEV__ && cardDetails && (
              <Text style={{ 
                fontSize: 12, 
                color: cardDetails.complete ? '#28a745' : '#666', 
                marginTop: 8 
              }}>
                Card Status: {cardDetails.complete ? 'Complete ✅' : 'Incomplete'}
                {cardDetails.error && ` | Error: ${cardDetails.error.message}`}
              </Text>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsCard}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreesToTerms(!agreesToTerms)}
            >
              <View style={[styles.checkbox, agreesToTerms && styles.checkboxChecked]}>
                {agreesToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  By booking, I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, (!agreesToTerms || !cardDetails?.complete || loading) && styles.payButtonDisabled]}
            onPress={handleCardPayment}
            disabled={!agreesToTerms || !cardDetails?.complete || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay ${totalPrice}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}