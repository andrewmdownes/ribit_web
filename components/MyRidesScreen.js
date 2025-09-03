import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import styles from '../styles/myRidesScreenStyles';
import { ridesApi, authApi } from '../lib/api'; 
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { Platform, TextInput, Modal } from 'react-native'; // Add to your imports
import { markPickupVerified } from '../lib/api';
import { getPassengerPricingBreakdown } from '../lib/distances';
export default function MyRidesScreen({ navigation, route }) {
  // Set initial tab based on route params, default to 'booked'
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'booked');
  const [postedRides, setPostedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancellingRide, setCancellingRide] = useState(null);
  const [hidingBookedRide, setHidingBookedRide] = useState(null);
  const [hidingPostedRide, setHidingPostedRide] = useState(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifyingPassenger, setVerifyingPassenger] = useState(null);
  // Helper function to format extra miles for display with new pickup/dropoff clarity


  const handleVerifyPickup = (passenger) => {
  if (Platform.OS === 'ios') {
    Alert.prompt(
      'Verify Pickup',
      `Enter the PIN for ${passenger.name}, when you pick them up to start the ride.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
       {
  text: 'Verify',
  onPress: async (input) => {
    if (input === passenger.passenger_pin) {
      
      // Update local state first (optional: you can wait for backend confirmation instead)


      // Call your API to update backend
      console.log(passenger.booking_id);
      const { data, error } = await markPickupVerified(passenger.booking_id);

      if (error) {
        Alert.alert('Error', 'Failed to update pickup verification.');
        console.error(error);
        // Optionally revert your local state here
      } else {
        
        loadRidesData(); // Refresh rides data to reflect changes
        setPinModalVisible(false); // Close the modal
        Alert.alert('Success', 'Pickup verified!');

      }
    } else {
      Alert.alert('Error', 'Incorrect PIN.');
    }
  }
},
      ],
      'plain-text'
    );
  } else {
    setVerifyingPassenger(passenger);
    setPinInput('');
    setPinError('');
    setPinModalVisible(true);
  }
};

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time24) => {
    if (!time24) return '';

    const [hourStr, minute] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${hour12}:${minute} ${ampm}`;
  };

  const formatExtraMilesForDisplay = (extraMiles) => {
    switch(extraMiles) {
      case 'no':
      case null:
      case undefined:
        return 'Exact locations only';
      case '5':
        return 'Up to 5 miles detour';
      case '10':
        return 'Up to 10 miles detour';
      case '15':
        return 'Up to 15 miles detour';
      default:
        return 'Not specified';
    }
  };

  // Handle route params when screen receives focus
  useFocusEffect(
    React.useCallback(() => {
      // Check if we should set a specific tab
      if (route.params?.initialTab) {
        setActiveTab(route.params.initialTab);
        // Clear the param to prevent it from affecting future navigations
        navigation.setParams({ initialTab: undefined });
      }
      
      console.log('MyRidesScreen gained focus, refreshing rides...');
      loadRidesData();
      
      if (route.params?.refresh) {
        console.log('Explicit refresh requested');
        navigation.setParams({ refresh: undefined });
      }
    }, [route.params?.refresh, route.params?.initialTab])
  );

  const loadRidesData = async () => {
    setLoading(true);
    
    try {
      
      // Load both booked and posted rides
      const [bookedResult, postedResult] = await Promise.all([
        ridesApi.getBookedRides(),
        ridesApi.getPostedRides()
      ]);




      if (bookedResult.error) {
        console.error('Failed to load booked rides:', bookedResult.error);
      } else {
        console.log('Booked rides loaded:', bookedResult.data.length, 'rides');
        setBookedRides(bookedResult.data);
      }

      if (postedResult.error) {
        console.error('Failed to load posted rides:', postedResult.error);
      } else {
        console.log('Posted rides loaded:', postedResult.data.length, 'rides');
        setPostedRides(postedResult.data);
      }
    } catch (error) {
      console.error('Error loading rides data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId, rideName) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for ${rideName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingBooking(bookingId);
            try {
              const result = await ridesApi.cancelBooking(bookingId);
              
              if (result.error) {
                Alert.alert('Error', 'Failed to cancel booking. Please try again.');
                console.error('Cancel booking error:', result.error);
              } else {
                Alert.alert('Success', 'Your booking has been cancelled successfully.');
                // Just refresh the current screen data
                await loadRidesData();
              }
            } catch (error) {
              console.error('Cancel booking error:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setCancellingBooking(null);
            }
          }
        }
      ]
    );
  };

  // Handle ride cancellation
  const handleCancelRide = async (rideId, rideName) => {
    Alert.alert(
      'Cancel Ride',
      `Are you sure you want to cancel your ride from ${rideName}? This will also cancel all passenger bookings.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingRide(rideId);
            try {
              const result = await ridesApi.cancelRide(rideId);
              
              if (result.error) {
                Alert.alert('Error', 'Failed to cancel ride. Please try again.');
                console.error('Cancel ride error:', result.error);
              } else {
                Alert.alert('Success', 'Your ride has been cancelled successfully.');
                // Just refresh the current screen data
                await loadRidesData();
              }
            } catch (error) {
              console.error('Cancel ride error:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setCancellingRide(null);
            }
          }
        }
      ]
    );
  };

  // Handle hiding a booked ride from view
  const handleHideBookedRide = async (bookingId, rideName) => {
    setHidingBookedRide(bookingId);
    try {
      const result = await ridesApi.hideBookedRide(bookingId);
      
      if (result.error) {
        Alert.alert('Error', 'Failed to remove ride from screen. Please try again.');
        console.error('Hide booked ride error:', result.error);
      } else {
        // Refresh the current screen data
        await loadRidesData();
      }
    } catch (error) {
      console.error('Hide booked ride error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setHidingBookedRide(null);
    }
  };

  // Handle hiding a posted ride from view
  const handleHidePostedRide = async (rideId, rideName) => {
    setHidingPostedRide(rideId);
    try {
      const result = await ridesApi.hidePostedRide(rideId);
      
      if (result.error) {
        Alert.alert('Error', 'Failed to remove ride from screen. Please try again.');
        console.error('Hide posted ride error:', result.error);
      } else {
        // Refresh the current screen data
        await loadRidesData();
      }
    } catch (error) {
      console.error('Hide posted ride error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setHidingPostedRide(null);
    }
  };

  // Helper function to render status badge
  const renderStatusBadge = (status) => {
    let badgeStyle = styles.statusBadge;
    let textStyle = styles.statusBadgeText;
    let text = '';

    switch (status) {
      case 'completed':
        badgeStyle = [styles.statusBadge, styles.statusBadgeCompleted];
        textStyle = [styles.statusBadgeText, styles.statusBadgeTextCompleted];
        text = 'Completed';
        break;
      case 'cancelled':
        badgeStyle = [styles.statusBadge, styles.statusBadgeCancelled];
        textStyle = [styles.statusBadgeText, styles.statusBadgeTextCancelled];
        text = 'Cancelled';
        break;
      case 'ride_cancelled':
        badgeStyle = [styles.statusBadge, styles.statusBadgeCancelled];
        textStyle = [styles.statusBadgeText, styles.statusBadgeTextCancelled];
        text = 'Ride Cancelled';
        break;
      default:
        return null;
    }

    return (
      <View style={badgeStyle}>
        <Text style={textStyle}>{text}</Text>
      </View>
    );
  };

// Render each booked ride listing
const renderBookedRideItem = ({ item }) => {
  // Calculate the actual amount the passenger paid
  const pricingBreakdown = getPassengerPricingBreakdown(item.price, item.bookedSeats);
  const actualAmountPaid = pricingBreakdown.totalCost;

  return (
    <TouchableOpacity 
      style={[
        styles.rideCard,
        (item.status === 'completed' || item.status === 'cancelled' || item.status === 'ride_cancelled') && styles.completedRideCard
      ]}
      onPress={() => {
        if (item.status === 'completed' || item.status === 'cancelled' || item.status === 'ride_cancelled') {
          return; // Disable navigation for inactive/cancelled rides
        }

        const rideForYourRide = {
          id: item.id,
          driver: {
            name: item.driver?.name ?? 'Unknown Driver',
            rating: item.driver?.rating ?? 0,
            rides: item.driver?.rides ?? 0,
            carColor: item.driver?.carColor ?? 'Unknown',
            licensePlate: item.driver?.licensePlate ?? 'Unknown',
            avatar: item.driver?.avatar ?? null,
          },
          from: item.from,
          to: item.to,
          date: item.date,
          time: item.time,
          price: item.price,
          seatsAvailable: item.available_seats,
          bookedSeats: item.bookedSeats,
          pickupLocation: item.pickupLocation || null,
          dropoffLocation: item.dropoffLocation || null,
          rideId: item.rideId,
          // NEW: Add pickup verification status for passenger
          pickup_verified: item.pickup_verified || false,
          passenger_pin: item.passenger_pin,
        };

        navigation?.navigate('YourRide', { 
          ride: rideForYourRide, 
          userRole: 'passenger' 
        });
      }}
      disabled={item.status === 'completed' || item.status === 'cancelled' || item.status === 'ride_cancelled'}
    >

      {renderStatusBadge(item.status)}

      <View style={styles.rideHeader}>
        <View style={styles.driverInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.driver.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.driverName}>{item.driver.name}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>★ {item.driver.rating}</Text>
              <Text style={styles.ridesText}>{item.driver.rides} rides</Text>
            </View>
          </View>
        </View>
        <Text style={styles.priceText}>
          <Text style={{ fontWeight: 'bold' }}>${actualAmountPaid}</Text>
          <Text> for </Text>
          <Text style={{ fontWeight: 'bold' }}>{item.bookedSeats}</Text>
          <Text> {item.bookedSeats === 1 ? 'seat' : 'seats'}</Text>
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.rideDetails}>
        <View style={styles.locationContainer}>
          <View style={styles.locationDot} />
          <View style={styles.locationLine} />
          <View style={styles.locationPin} />

          <View style={styles.locationTextContainer}>
            <Text style={styles.fromLocationText}>{item.from}</Text>
            <Text style={styles.toLocationText}>{item.to}</Text>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.timeText}>{convertTo12HourFormat(item.time)}</Text>
          <View style={styles.seatsContainer}>
            <Text style={styles.seatsText}>
              {item.bookedSeats} {item.bookedSeats === 1 ? 'seat' : 'seats'} booked
            </Text>
          </View>
        </View>
      </View>

      {/* PIN section: always show if exists, right after ride details */}
      {item.passenger_pin && (
        <View style={{ marginTop: 8, marginBottom: 4, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', color: '#5DBE62', fontSize: 16 }}>
            Your Pickup PIN: <Text selectable style={{ fontFamily: 'monospace', fontSize: 18 }}>{item.passenger_pin}</Text>
          </Text>
          <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
            Show this PIN to your driver at pickup.
          </Text>
        </View>
      )}
      {/* Show cancel button for upcoming rides */}
      {item.status === 'upcoming' && (
        <TouchableOpacity 
          style={[
            styles.cancelButton,
            cancellingBooking === item.id && styles.cancelButtonDisabled
          ]}
          onPress={() => handleCancelBooking(item.bookingId, `${item.from} → ${item.to}`)}
          disabled={cancellingBooking === item.id}
        >
          {cancellingBooking === item.id ? (
            <ActivityIndicator size="small" color="#ff6b6b" />
          ) : (
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Show remove button for cancelled rides */}
      {(item.status === 'cancelled' || item.status === 'ride_cancelled') && (
        <TouchableOpacity 
          style={[
            styles.removeButton,
            hidingBookedRide === item.id && styles.removeButtonDisabled
          ]}
          onPress={() => handleHideBookedRide(item.bookingId, `${item.from} → ${item.to}`)}
          disabled={hidingBookedRide === item.id}
        >
          {hidingBookedRide === item.id ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            <Text style={styles.removeButtonText}>Remove from Screen</Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

  // Render each posted ride listing (Updated navigation)
  const renderPostedRideItem = ({ item }) => {
    const from = item.from_city?.name || 'Unknown';
    const to = item.to_city?.name || 'Unknown';
    const dateFormatted = moment(item.departure_date).format('MMM D, YYYY');
    const timeFormatted = moment(item.departure_time, 'HH:mm:ss').format('h:mm A');
    const totalSeatsBooked = item.seatsBooked || 0;
    const totalSeats = item.total_seats;
    
    const hasPassengers = item.passengers && Array.isArray(item.passengers) && item.passengers.length > 0;

    const isInactive = item.status === 'cancelled';

    return (
      <TouchableOpacity
        style={[
          styles.rideCard,
          (item.status === 'completed' || isInactive) && styles.completedRideCard,
          isInactive && { opacity: 0.6 }
        ]}
        onPress={() => {
          if (!isInactive) {
            // Only navigate if not cancelled
            const rideForYourRide = {
              id: item.id,
              driver: {
                name: 'You', // Since this is the driver's own ride
                rating: item.profiles?.rating ?? 0,
                rides: 0,
                carColor: item.profiles?.car_color ?? 'Unknown',
                licensePlate: item.profiles?.license_plate ?? 'Unknown',
              },
              from,
              to,
              date: dateFormatted,
              time: timeFormatted,
              price: item.price,
              seatsAvailable: item.available_seats,
              bookedSeats: totalSeatsBooked,
              // NEW: Add pickup/dropoff location data
              pickupLocation: item.pickup_location || null,
              dropoffLocation: item.dropoff_location || null,
              // Add raw ride data for tracking
              rideId: item.id,
              passengers: item.passengers || [],   // <== Add this line
          luggage: {
          medium: item.medium_luggage || 0
            },
          };
          navigation?.navigate('YourRide', { 
            ride: rideForYourRide, 
            userRole: 'driver' 
          });
          }
        }}
        disabled={isInactive}
      >
        {renderStatusBadge(item.status)}

        {/* Show booking indicator only for active rides */}
        {hasPassengers && item.status === 'active' && (
          <View style={styles.bookingIndicator}>
            <Text style={styles.bookingIndicatorText}>
              {totalSeatsBooked} seat{totalSeatsBooked > 1 ? 's' : ''} booked!
            </Text>
          </View>
        )}

        <View style={styles.postedRideHeader}>
          <View style={styles.routeContainer}>
            <Text style={styles.routeText}>{from} → {to}</Text>
          </View>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.postedRideDetails}>
          <View>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>{dateFormatted}, {timeFormatted}</Text>
          </View>

          <View>
            <Text style={styles.detailLabel}>Seats</Text>
            <Text style={[
              styles.detailValue,
              hasPassengers && item.status === 'active' && styles.detailValueHighlight
            ]}>
              {totalSeatsBooked}/{totalSeats} booked
            </Text>
          </View>
        </View>

        {/* NEW: Pickup/Dropoff flexibility display for posted rides */}
        {item.extra_miles_willing && (
          <View style={styles.flexibilityContainer}>
            <Text style={styles.flexibilityLabel}>Pickup/Dropoff flexibility:</Text>
            <Text style={styles.flexibilityValue}>
              {formatExtraMilesForDisplay(item.extra_miles_willing)}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.passengersSection}>
          <Text style={styles.passengersTitle}>
            {hasPassengers 
              ? `Passengers (${item.passengers.length})` 
              : item.status === 'cancelled' 
                ? 'Ride was cancelled'
                : 'No passengers yet'}
          </Text>

          {hasPassengers && item.status !== 'cancelled' ? (
            item.passengers.map((passenger, index) => (
              <View key={index} style={styles.passengerRow}>
                <View style={styles.passengerAvatarContainer}>
                  <Text style={styles.passengerAvatarText}>
                    {(passenger.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger.name || 'Unknown Passenger'}</Text>
                  <Text style={styles.passengerSeats}>
                    {passenger.seatsBooked} seat{passenger.seatsBooked > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={styles.passengerRating}>★ {passenger.rating || 4.8}</Text>
              {/* Add the button here */}
      {passenger.pickup_verified ? (
  <View style={{ marginLeft: 8, backgroundColor: '#5DBE62', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}>
    <Text style={{ color: 'white', fontWeight: 'bold' }}>Verified</Text>
  </View>
) : (
  <TouchableOpacity
    style={[styles.cancelButton, { marginLeft: 8, backgroundColor: '#5DBE62' }]}
    onPress={() => handleVerifyPickup(passenger)}
  >
    <Text style={[styles.cancelButtonText, { color: 'white' }]}>Verify Pickup</Text>
  </TouchableOpacity>
)}

    </View>
  ))
) : item.status === 'cancelled' ? (
  <Text style={styles.cancelledText}>
    All bookings were automatically cancelled
  </Text>
) : (
  <Text style={styles.noPassengersText}>
    Share your ride link to get passengers!
  </Text>
)}
        </View>
        

<Modal
  visible={pinModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setPinModalVisible(false)}
>
  <View style={{
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)'
  }}>
    <View style={{
      backgroundColor: 'white', borderRadius: 10, padding: 24, width: 300, alignItems: 'center'
    }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
        Enter PIN for {verifyingPassenger?.name}
      </Text>
      <TextInput
        style={{
          borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, width: '80%', textAlign: 'center', fontSize: 18, letterSpacing: 4
        }}
        value={pinInput}
        onChangeText={setPinInput}
        keyboardType="numeric"
        maxLength={4}
        placeholder="PIN"
      />
      {pinError ? <Text style={{ color: 'red', marginTop: 6 }}>{pinError}</Text> : null}
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity
          style={{ marginRight: 16 }}
          onPress={() => setPinModalVisible(false)}
        >
          <Text style={{ color: '#888' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#5DBE62', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 8 }}
       onPress={async () => {
          if (pinInput === verifyingPassenger?.passenger_pin) {
            const success = await markPickupAsVerified(verifyingPassenger.booking_id);
            if (success) {
              setPinModalVisible(false);
              setBookedRides(prev => 
                prev.map(ride => ({
                  ...ride,
                  passengers: ride.passengers.map(p =>
                    p.booking_id === verifyingPassenger.booking_id
                      ? { ...p, pickup_verified: true }
                      : p
                  )
                }))
              );
              Alert.alert('Success', 'Pickup verified!');
            }
          } else {
            setPinError('Incorrect PIN. Please try again.');
          }
        }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

        {/* Show cancel button for active rides */}
        {item.status === 'active' && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              cancellingRide === item.id && styles.cancelButtonDisabled
            ]}
            onPress={() => handleCancelRide(item.id, `${from} → ${to}`)}
            disabled={cancellingRide === item.id}
          >
            {cancellingRide === item.id ? (
              <ActivityIndicator size="small" color="#ff6b6b" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Ride</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Show remove button for cancelled rides */}
        {isInactive && (
          <TouchableOpacity
            style={[
              styles.removeButton,
              hidingPostedRide === item.id && styles.removeButtonDisabled
            ]}
            onPress={() => handleHidePostedRide(item.id, `${from} → ${to}`)}
            disabled={hidingPostedRide === item.id}
          >
            {hidingPostedRide === item.id ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.removeButtonText}>Remove from Screen</Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // FIXED: Loading state now includes proper content wrapper
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>ribit</Text>
        </View>
        
        {/* FIXED: Added content wrapper for grey background */}
        <View style={styles.content}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <ActivityIndicator size="large" color="#87d77c" />
            <Text style={{ marginTop: 10, color: '#666', fontSize: 16, fontFamily: 'Roboto' }}>Loading your rides...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>ribit</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'booked' && styles.activeTab]}
          onPress={() => setActiveTab('booked')}
        >
          <Text style={[styles.tabText, activeTab === 'booked' && styles.activeTabText]}>
            Booked Rides
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posted' && styles.activeTab]}
          onPress={() => setActiveTab('posted')}
        >
          <Text style={[styles.tabText, activeTab === 'posted' && styles.activeTabText]}>
            Posted Rides
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {activeTab === 'booked' ? (
          <View style={styles.ridesContainer}>
            <Text style={styles.sectionTitle}>
              Your Booked Rides ({bookedRides.length})
            </Text>
            <FlatList
              data={bookedRides}
              renderItem={renderBookedRideItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ridesList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>You haven't booked any rides yet.</Text>
                </View>
              }
            />
          </View>
        ) : (
          <View style={styles.ridesContainer}>
            <Text style={styles.sectionTitle}>
              Your Posted Rides ({postedRides.length})
            </Text>
            <FlatList
              data={postedRides}
              renderItem={renderPostedRideItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ridesList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>You haven't posted any rides yet.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}