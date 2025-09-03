import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput
} from 'react-native';
import { ridesApi, profileApi } from '../lib/api'; 
import styles from '../styles/rideDetailStyles';
import { getPassengerPricingBreakdown } from '../lib/distances';

export default function RideDetailScreen({ route, navigation }) {
  const { ride } = route.params;

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={{ padding: 20 }}>Ride data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [selectedSeats, setSelectedSeats] = useState(1);
  const seatOptions = Array.from({ length: ride.seatsAvailable || 1 }, (_, i) => i + 1);
  const [mediumLuggage, setMediumLuggage] = useState(0);
  // Calculate passenger pricing breakdown
  const pricingBreakdown = getPassengerPricingBreakdown(ride.price, selectedSeats);

  // Check if user profile is complete before booking
  const checkProfileCompletion = async () => {
    try {
      const { data: profileData, error } = await profileApi.getProfile();
      
      if (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile information');
        return false;
      }
      
      // Check if required fields are present
      const isComplete = !!(
        profileData &&
        profileData.first_name &&
        profileData.last_name &&
        profileData.dob &&
        profileData.phone
      );
      
      if (!isComplete) {
        // Navigate directly to profile completion (no alert)
        navigation.navigate('MainTabs', {
          screen: 'Profile',
          params: {
            fromRideDetail: true,
            requiresCompletion: true,
            returnTo: 'StripeApp',
            returnParams: {
              ride,
              seats: selectedSeats,
              totalPrice: selectedSeats * ride.price,
            }
          }
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Profile check error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return false;
    }
  };

  const handleBooking = async () => {

    const profileComplete = await checkProfileCompletion();
    
    if (!profileComplete) {
      return; // User will be redirected to complete profile
    }
    
    // Profile is complete, proceed to payment
    console.log('Profile complete, navigating to payment screen...');
    navigation.navigate('StripeApp', {
      ride,
      seats: selectedSeats,
      totalPrice: pricingBreakdown.totalCost,
       luggage: {
      medium: mediumLuggage
    },
    });
  };

  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Add content wrapper for grey background */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.driverCard}>
            <View style={styles.driverHeader}>
              <View style={styles.driverInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{ride.driver.name.charAt(0)}</Text>
                </View>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.driverName}>{ride.driver.name}</Text>
                    {ride.driver.verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>★ {ride.driver.rating}</Text>
                    <Text style={styles.ridesText}>{ride.driver.rides} rides</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                  style={styles.viewProfileButton}
                  onPress={() => navigation.navigate('ViewDriverProfile', { userId: ride.driver.id })}
                >
                  <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>

            </View>
          </View>

          <View style={styles.rideCard}>
            <View style={styles.routeSection}>
              <View style={styles.routeHeader}>
                <Text style={styles.sectionTitle}>Route</Text>
                <Text style={styles.durationText}>{ride.estimatedDuration}</Text>
              </View>
                        <View style={styles.routeContainer}>
              <View style={styles.routeIconsContainer}>
                <View style={styles.originDot} />
                <View style={styles.routeLine} />
                <View style={styles.destinationDot} />
              </View>
              <View style={styles.routeDetails}>
                <View style={styles.locationDetail}>
                  <Text style={styles.locationName}>{ride.from}</Text>
                  <Text style={styles.meetingPoint}>
                    {ride.pickupLocation?.name || 'Pickup location TBD'}
                  </Text>
                  <Text style={styles.locationAddress}>
                    {ride.pickupLocation?.address || ''}
                  </Text>
                </View>
                <View style={styles.locationDetail}>
                  <Text style={styles.locationName}>{ride.to}</Text>
                  <Text style={styles.meetingPoint}>
                    {ride.dropoffLocation?.name || 'Dropoff location TBD'}
                  </Text>
                  <Text style={styles.locationAddress}>
                    {ride.dropoffLocation?.address || ''}
                  </Text>
                </View>
              </View>
            </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionRow}>
              <View style={styles.sectionItem}>
                <Text style={styles.sectionItemLabel}>Date</Text>
                <Text style={styles.sectionItemValue}>{ride.date}</Text>
              </View>
              <View style={styles.sectionItem}>
                <Text style={styles.sectionItemLabel}>Departure</Text>
                <Text style={styles.sectionItemValue}>{ride.time}</Text>
              </View>
            </View>
           
            <View style={{ height: 12 }} />

            {/* Pickup & Dropoff flexibility row */}
            <View style={styles.sectionRow}>
              <View style={styles.sectionItem}>
                <Text style={styles.sectionItemLabel}>Pickup & Dropoff Flexibility</Text>
                <Text style={styles.sectionItemValue}>
                  {ride.extra_miles_willing === 'no' || !ride.extra_miles_willing
                    ? 'Driver will only pick up/drop off at exact route locations'
                    : ride.extra_miles_willing === '5'
                      ? 'Driver willing to detour up to 5 miles for pickup/dropoff'
                      : ride.extra_miles_willing === '10'
                        ? 'Driver willing to detour up to 10 miles for pickup/dropoff'
                        : ride.extra_miles_willing === '15'
                          ? 'Driver willing to detour up to 15 miles for pickup/dropoff'
                          : 'Flexibility not specified'}
                </Text>
              </View>
            </View>
            

            <View style={styles.divider} />
          </View> 

          <View style={styles.bookingCard}>
            <View style={styles.seatSelection}>
              <Text style={styles.seatSelectionTitle}>Number of seats</Text>
              <View style={styles.seatButtons}>
                {seatOptions.map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.seatButton,
                      selectedSeats === num && styles.selectedSeatButton
                    ]}
                    onPress={() => setSelectedSeats(num)}
                  >
                    <Text
                      style={[
                        styles.seatButtonText,
                        selectedSeats === num && styles.selectedSeatButtonText
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.seatSelection}>
  <Text style={styles.seatSelectionTitle}>Number of Suitcases</Text>
  <View style={styles.luggageRow}>
    <TouchableOpacity
      onPress={() => setMediumLuggage(prev => Math.max(0, prev - 1))}
      style={styles.arrowButtonLarge}
    >
      <Text style={styles.arrowTextLarge}>-</Text>
    </TouchableOpacity>
    <TextInput
      style={styles.luggageInput}
      keyboardType="numeric"
      value={mediumLuggage.toString()}
      onChangeText={text => {
        // Only allow numbers >= 0 and <= available_luggage
        const max = ride.available_luggage ?? 0;
        let val = Math.max(0, parseInt(text.replace(/[^0-9]/g, ''), 10) || 0);
        if (val > max) val = max;
        setMediumLuggage(val);
      }}
      textAlign="center"
      maxLength={2}
    />
    <TouchableOpacity
      onPress={() =>
        setMediumLuggage(prev =>
          Math.min(ride.available_luggage ?? 0, prev + 1)
        )
      }
      style={styles.arrowButtonLarge}
    >
      <Text style={styles.arrowTextLarge}>+</Text>
    </TouchableOpacity>
  </View>
  <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
    Max allowed: {ride.available_luggage ?? 0}
  </Text>
</View>


            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Driver's price</Text>
                <Text style={styles.priceValue}>${ride.price}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  Your cost ({Math.round(pricingBreakdown.discountPercentage * 100)}% of driver's price)
                </Text>
                <Text style={styles.priceValue}>${pricingBreakdown.totalCost}</Text>
              </View>
              
              {selectedSeats > 1 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Price per seat</Text>
                  <Text style={styles.priceValue}>${pricingBreakdown.pricePerSeat}</Text>
                </View>
              )}
              
              {pricingBreakdown.savings > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.savingsLabel}>You save</Text>
                  <Text style={styles.savingsValue}>-${pricingBreakdown.savings}</Text>
                </View>
              )}
              
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${pricingBreakdown.totalCost}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBooking}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}