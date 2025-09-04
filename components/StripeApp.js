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

// Import platform-specific Stripe wrapper
let StripeProvider, CardField, useConfirmPayment;
try {
  if (Platform.OS === 'web') {
    const stripeWrapper = require('../lib/stripeWrapper.web');
    StripeProvider = stripeWrapper.StripeProvider;
    CardField = stripeWrapper.CardField;
    useConfirmPayment = stripeWrapper.useConfirmPayment;
  } else {
    const stripeWrapper = require('../lib/stripeWrapper.native');
    StripeProvider = stripeWrapper.StripeProvider;
    CardField = stripeWrapper.CardField;
    useConfirmPayment = stripeWrapper.useConfirmPayment;
  }
} catch (error) {
  console.log('Stripe import error:', error);
  // Fallback components
  StripeProvider = ({ children }) => children;
  CardField = () => null;
  useConfirmPayment = () => ({ confirmPayment: null, loading: false });
}

const API_URL = "https://landing-page-jet-rho-33.vercel.app";

// Main StripeApp Component wrapped with its own StripeProvider
function StripeAppContent({ route, navigation }) {
  const { ride, seats, totalPrice, luggage } = route.params;

  const [cardDetails, setCardDetails] = useState();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreesToTerms, setAgreesToTerms] = useState(false);
  
  // Payment hooks with error handling
  let confirmPayment = null;
  let confirmLoading = false;
  
  try {
    const paymentHook = useConfirmPayment();
    confirmPayment = paymentHook.confirmPayment;
    confirmLoading = paymentHook.loading;
  } catch (error) {
    console.log('useConfirmPayment error:', error);
  }

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
      } else {
        const { data: profile } = await profileApi.getProfile();
        if (profile?.email) {
          setUserEmail(profile.email);
        }
      }
    } catch (error) {
      console.error('Error loading user email:', error);
      Alert.alert('Error', 'Could not load user information');
    }
  };

  // SKIP PAYMENT AND BOOK RIDE DIRECTLY
  const testServerConnection = async () => {
    console.log('🧪 Skip Payment button clicked!');
    
    if (!agreesToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions to continue.");
      return;
    }

    setLoading(true);
    console.log('🚀 Starting booking process...');

    try {
      const luggagePayload = {
        small: luggage?.small ?? 0,
        medium: luggage?.medium ?? 0,
        large: luggage?.large ?? 0,
      };

      console.log('📦 Luggage payload:', luggagePayload);
      console.log('🎫 Booking ride:', ride.id, 'seats:', seats);

      const { data, error } = await ridesApi.bookRide(ride.id, seats, luggagePayload);
      
      console.log('📊 Booking result:', { data, error });
      
      if (error) {
        console.error('❌ Booking error:', error);
        Alert.alert("Booking Error", `Failed to book ride: ${error.message || error}`);
        return;
      }

      console.log('✅ Booking successful!');
      Alert.alert("Success", "Booking successful!", [
        {
          text: "OK",
          onPress: () => {
            console.log('🏠 Navigating to My Rides...');
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
      console.error('💥 Booking error:', err);
      Alert.alert("Booking Error", `Something went wrong: ${err.message}`);
    } finally {
      setLoading(false);
      console.log('🏁 Booking process finished');
    }
  };

  const fetchPaymentIntentClientSecret = async () => {
    try {
      console.log('🔗 Fetching payment intent from:', `${API_URL}/api/create-payment-intent`);
      
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment intent request failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Payment intent response:', { hasClientSecret: !!data.clientSecret });
      
      if (data.error) {
        return { clientSecret: null, error: data.error };
      }
      
      return { clientSecret: data.clientSecret, error: null };
    } catch (err) {
      console.error("💥 Payment intent error:", err);
      return { error: `Network error: ${err.message}` };
    }
  };

  const handleCardPayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Incomplete Card", "Please enter complete card details.");
      return;
    }

    if (!agreesToTerms) {
      Alert.alert("Terms Required", "Please agree to the terms and conditions to continue.");
      return;
    }

    if (!confirmPayment) {
      Alert.alert("Error", "Payment not available on this platform.");
      return;
    }

    try {
      setLoading(true);
      console.log('💳 Starting card payment process...');
      
      const { clientSecret, error } = await fetchPaymentIntentClientSecret();
      if (error) {
        Alert.alert("Payment Error", error);
        return;
      }

      console.log('🔐 Confirming payment with Stripe...');
      const { paymentIntent, error: confirmError } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: { email: userEmail },
        },
      });

      if (confirmError) {
        console.error('❌ Payment failed:', confirmError);
        Alert.alert("Payment Failed", confirmError.message);
      } else if (paymentIntent) {
        console.log('✅ Payment successful:', paymentIntent.status);
        await completeBooking();
      }
    } catch (error) {
      console.error('💥 Unexpected payment error:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async () => {
    try {
      console.log('📝 Booking ride after successful payment...');
      
      const luggagePayload = {
        small: luggage?.small ?? 0,
        medium: luggage?.medium ?? 0,
        large: luggage?.large ?? 0,
      };

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
                    index: 1,
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
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    const timeParts = timeString.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = timeParts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute} ${ampm}`;
  };

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
          {/* ALWAYS SHOW SKIP PAYMENT BUTTON */}
          <TouchableOpacity 
            onPress={testServerConnection}
            style={[styles.testButton, { 
              backgroundColor: '#007AFF',
              marginBottom: 20,
              padding: 15,
              borderRadius: 8,
              alignItems: 'center'
            }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.testButtonText, { 
                color: '#fff',
                fontSize: 16,
                fontWeight: 'bold'
              }]}>
                🧪 Skip Payment (TESTING) - Book Ride Now
              </Text>
            )}
          </TouchableOpacity>

          {/* Environment Indicator */}
          <View style={{
            backgroundColor: '#ff6b6b',
            padding: 8,
            borderRadius: 4,
            marginBottom: 16,
            alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              🔧 TESTING MODE - Skip Payment Available
            </Text>
            <Text style={{ color: 'white', fontSize: 10 }}>
              Platform: {Platform.OS} | Check console for logs
            </Text>
          </View>

          {/* Terms and Conditions - MOVED UP */}
          <View style={styles.termsCard}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => {
                console.log('📋 Terms checkbox clicked, current:', agreesToTerms);
                setAgreesToTerms(!agreesToTerms);
              }}
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

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total</Text>
              <Text style={styles.priceValue}>${totalPrice}</Text>
            </View>
          </View>

          {/* Payment Methods Card - Optional */}
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Payment Method (Optional - Use Skip Button Above)</Text>

            <Text style={styles.sectionLabel}>Card Details</Text>
            {CardField && (
              <CardField
                postalCodeEnabled={true}
                placeholder={{ number: "4242 4242 4242 4242" }}
                cardStyle={styles.card}
                style={styles.cardContainer}
                onCardChange={setCardDetails}
              />
            )}
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, (!agreesToTerms || loading) && styles.payButtonDisabled]}
            onPress={handleCardPayment}
            disabled={!agreesToTerms || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay ${totalPrice} (May Not Work)</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Export main component wrapped in StripeProvider
export default function StripeApp(props) {
  const stripePublishableKey = "pk_test_51RFSvZBzodOqsZP1NrhYlQsriGXAuf4A6YZwPwJ4ouFQyceljKBp5WGZhX8V3kTHTlww8mtHFH2JlqbuNwGGCDBw004h4gAnHX";
  
  console.log('🏦 StripeApp initialized with Stripe key:', stripePublishableKey ? 'Present' : 'Missing');
  
  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <StripeAppContent {...props} />
    </StripeProvider>
  );
}