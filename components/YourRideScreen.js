import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
  Linking,
  Platform,
  TextInput,
  ActivityIndicator
} from 'react-native';
import styles from '../styles/yourRideStyles';
// CHANGED: Import from platform-specific MapComponent instead of react-native-maps
import { MapComponent, Marker, Polyline, isMapsAvailable } from './MapComponent';
import * as Location from 'expo-location';
import { trackingApi, ridesApi, markPickupVerified } from '../lib/api';
import { getRouteDirections, getRouteDirectionsByCoordinates, getRouteRegion } from '../lib/directions';

export default function YourRideScreen({ route, navigation }) {
  const { ride, userRole } = route.params; // userRole will be 'driver' or 'passenger'
  
  // Pickup verification state
  const [isPickupVerified, setIsPickupVerified] = useState(false);
  const [loadingVerification, setLoadingVerification] = useState(true);
  
  // PIN verification state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  
  // Location and tracking state
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingSession, setTrackingSession] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState(null);

  // Refs
  const mapRef = useRef(null);

  // Check pickup verification status
  useEffect(() => {
    checkPickupVerificationStatus();
  }, []);

  const checkPickupVerificationStatus = () => {
    setLoadingVerification(true);
    
    try {
      if (userRole === 'passenger') {
        // For passengers, use the pickup_verified status passed from MyRidesScreen
        setIsPickupVerified(ride.pickup_verified || false);
        
      } else if (userRole === 'driver') {
        // For drivers, check if ALL passengers have been verified
        if (ride.passengers && ride.passengers.length > 0) {
          // Check if ALL passengers are verified
          const allVerified = ride.passengers.every(passenger => 
            passenger.pickup_verified === true
          );
          setIsPickupVerified(allVerified);
        } else {
          // No passengers yet, so not verified
          setIsPickupVerified(false);
        }
      }
      
    } catch (error) {
      console.error('Error checking pickup verification:', error);
      setIsPickupVerified(false);
    } finally {
      setLoadingVerification(false);
    }
  };

  // Handle PIN verification for drivers
  const handleVerifyPin = async () => {
    if (!pinInput.trim()) {
      setPinError('Please enter a PIN');
      return;
    }

    if (pinInput.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }

    setVerifyingPin(true);
    setPinError('');

    try {
      // Find the passenger with the matching PIN
      const passenger = ride.passengers?.find(p => p.passenger_pin === pinInput);
      
      if (!passenger) {
        setPinError('Invalid PIN. Please check and try again.');
        setVerifyingPin(false);
        return;
      }

      // Verify the pickup
      const { data, error } = await markPickupVerified(passenger.booking_id);

      if (error) {
        setPinError('Failed to verify pickup. Please try again.');
        console.error('Verification error:', error);
        setVerifyingPin(false);
        return;
      }

      // Success - update local state
      if (ride.passengers) {
        // Update the specific passenger's verification status
        ride.passengers = ride.passengers.map(p => 
          p.booking_id === passenger.booking_id 
            ? { ...p, pickup_verified: true }
            : p
        );
        
        // Check if all passengers are now verified
        const allVerified = ride.passengers.every(p => p.pickup_verified === true);
        setIsPickupVerified(allVerified);
      }

      // Clear the input and show success
      setPinInput('');
      Alert.alert('Success', `Pickup verified for ${passenger.name}!`);

    } catch (error) {
      console.error('PIN verification error:', error);
      setPinError('Something went wrong. Please try again.');
    } finally {
      setVerifyingPin(false);
    }
  };

  // Helper function to check if ride has pickup/dropoff locations
  const hasPickupDropoffLocations = () => {
    return ride?.pickupLocation && ride?.dropoffLocation;
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Location access is required to use live tracking.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  };

  // Check for existing tracking session on mount
  useEffect(() => {
    if (isPickupVerified) {
      checkExistingTrackingSession();
    }
    
    return () => {
      // Cleanup on unmount
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, [isPickupVerified]);

  // Load route data when tracking starts
  const loadRouteData = async () => {
    try {
      // First check if we have specific pickup and dropoff coordinates
      if (hasPickupDropoffLocations() && 
          ride?.pickupLocation?.latitude && 
          ride?.pickupLocation?.longitude &&
          ride?.dropoffLocation?.latitude && 
          ride?.dropoffLocation?.longitude) {
        
        console.log('Loading route using pickup/dropoff coordinates');
        console.log('From:', ride.pickupLocation.name, 
                   `(${ride.pickupLocation.latitude}, ${ride.pickupLocation.longitude})`);
        console.log('To:', ride.dropoffLocation.name, 
                   `(${ride.dropoffLocation.latitude}, ${ride.dropoffLocation.longitude})`);
        
        const routeData = await getRouteDirectionsByCoordinates(
          parseFloat(ride.pickupLocation.latitude),
          parseFloat(ride.pickupLocation.longitude),
          parseFloat(ride.dropoffLocation.latitude),
          parseFloat(ride.dropoffLocation.longitude)
        );
        
        if (routeData && routeData.polylineCoordinates) {
          console.log('Setting route coordinates:', routeData.polylineCoordinates.length, 'points');
          setRouteCoordinates(routeData.polylineCoordinates);
          setRouteInfo({
            distance: routeData.distance,
            duration: routeData.duration,
          });

          // Set initial map region to show the full route
          const routeRegion = getRouteRegion(routeData.polylineCoordinates);
          
          if (routeRegion) {
            setRegion(routeRegion);
            // CHANGED: Only animate if maps are available and on native platforms
            if (isMapsAvailable()) {
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.animateToRegion(routeRegion, 1000);
                }
              }, 500);
            }
          }
        }
      } else {
        // Fallback to city-based routing if coordinates are not available
        if (!ride?.from || !ride?.to) {
          console.log('Missing route information');
          return;
        }

        console.log('Fallback: Loading route from city names', ride.from, 'to', ride.to);
        
        const routeData = await getRouteDirections(ride.from, ride.to);
        
        if (routeData && routeData.polylineCoordinates) {
          console.log('Setting route coordinates:', routeData.polylineCoordinates.length, 'points');
          setRouteCoordinates(routeData.polylineCoordinates);
          setRouteInfo({
            distance: routeData.distance,
            duration: routeData.duration,
          });

          // Set initial map region to show the full route
          const routeRegion = getRouteRegion(routeData.polylineCoordinates);
          
          if (routeRegion) {
            setRegion(routeRegion);
            // CHANGED: Only animate if maps are available and on native platforms
            if (isMapsAvailable()) {
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.animateToRegion(routeRegion, 1000);
                }
              }, 500);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading route:', error);
      Alert.alert('Route Error', 'Could not load route information.');
    }
  };

  // Check if user already has an active tracking session
  const checkExistingTrackingSession = async () => {
    try {
      const { data: activeSession, error } = await trackingApi.getUserActiveSession(ride.rideId || ride.id);
      
      if (!error && activeSession) {
        console.log('Found existing tracking session:', activeSession);
        setTrackingSession(activeSession);
        setIsTracking(true);
        
        // Load route and start monitoring when existing session is found
        await loadRouteData();
        await startLocationMonitoring();
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  };

  // Start location monitoring
const startLocationMonitoring = async () => {
  console.log('🎯 Starting location monitoring...');
  
  // Check location permission first
  const granted = await requestLocationPermission();
  if (!granted) {
    console.log('❌ Location permission not granted');
    Alert.alert('Permission Required', 'Location access is required for live tracking.');
    return;
  }

  console.log('✅ Location permission granted');

  // Get initial location with detailed error handling
  try {
    console.log('📍 Requesting initial location...');
    
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 15000,
      maximumAge: 60000,
    });

    console.log('📍 Initial location received:', {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      accuracy: currentLocation.coords.accuracy,
      timestamp: new Date(currentLocation.timestamp).toISOString()
    });

    const coords = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };

    setLocation(coords);

    // CRITICAL: Send the first location update immediately
    console.log('📤 Sending initial location to database...');
    console.log('🎫 Using tracking session:', {
      id: trackingSession?.id,
      token: trackingSession?.session_token,
      hasSession: !!trackingSession
    });

    if (trackingSession) {
      try {
        const updateResult = await trackingApi.addLocationUpdate(
          trackingSession.id,
          coords.latitude,
          coords.longitude
        );
        
        console.log('📊 Location update result:', updateResult);
        
        if (updateResult.error) {
          console.error('❌ Failed to send initial location:', updateResult.error);
          Alert.alert('Location Update Failed', `Error: ${updateResult.error}`);
        } else {
          console.log('✅ Initial location sent successfully!');
          Alert.alert('Location Updated', 'Your location has been shared successfully!');
        }
      } catch (error) {
        console.error('💥 Error sending initial location:', error);
        Alert.alert('Location Error', `Failed to send location: ${error.message}`);
      }
    } else {
      console.error('❌ No tracking session available');
      Alert.alert('Session Error', 'No tracking session found. Please restart tracking.');
      return;
    }

    // Set up periodic updates every 30 seconds
    console.log('⏰ Setting up periodic location updates...');
    
    const interval = setInterval(async () => {
      console.log('🔄 Periodic location update triggered...');
      
      try {
        const periodicLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
          maximumAge: 30000,
        });

        const periodicCoords = {
          latitude: periodicLocation.coords.latitude,
          longitude: periodicLocation.coords.longitude,
        };

        console.log('📍 Periodic location:', periodicCoords);
        setLocation(periodicCoords);

        if (trackingSession) {
          const periodicResult = await trackingApi.addLocationUpdate(
            trackingSession.id,
            periodicCoords.latitude,
            periodicCoords.longitude
          );
          
          if (periodicResult.error) {
            console.error('❌ Periodic update failed:', periodicResult.error);
          } else {
            console.log('✅ Periodic update successful');
          }
        }

      } catch (error) {
        console.error('💥 Periodic location error:', error);
      }
    }, 30000);

    setLocationUpdateInterval(interval);

  } catch (error) {
    console.error('💥 Failed to get initial location:', error);
    Alert.alert(
      'Location Error', 
      `Could not get your location: ${error.message}\n\nPlease check:\n• Location services are enabled\n• App has location permission\n• You're not in airplane mode`
    );
  }
};

  // Stop location monitoring
  const stopLocationMonitoring = () => {
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      setLocationUpdateInterval(null);
    }
    
    // Clear location and route data when stopping
    setLocation(null);
    setRegion(null);
    setRouteCoordinates([]);
    setRouteInfo(null);
  };

  // Handle start tracking
const handleStartTracking = async () => {
  try {
    console.log('🚀 Starting tracking for ride:', ride.rideId || ride.id);
    
    const { data: session, error } = await trackingApi.startTrackingSession(ride.rideId || ride.id);
    
    if (error) {
      console.error('❌ Failed to create tracking session:', error);
      Alert.alert('Error', 'Failed to start tracking. Please try again.');
      return;
    }

    console.log('✅ Tracking session created successfully:', {
      id: session.id,
      token: session.session_token,
      expiresAt: session.expires_at
    });

    setTrackingSession(session);
    setIsTracking(true);
    
    // Load route data first
    await loadRouteData();
    
    // IMPORTANT: Pass the session directly instead of relying on React state
    console.log('🎯 Starting location monitoring with session...');
    await startLocationMonitoringWithSession(session);

    const shareUrl = trackingApi.generateShareableUrl(session.session_token);
    console.log('🔗 Share URL:', shareUrl);

    Alert.alert(
      'Live Tracking Started',
      'Your location tracking has started and your first location has been shared!',
      [{ text: 'OK' }]
    );

  } catch (error) {
    console.error('💥 Error starting tracking:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};

// New function that accepts session as parameter
const startLocationMonitoringWithSession = async (session) => {
  console.log('🎯 Starting location monitoring with session:', session.id);
  
  const granted = await requestLocationPermission();
  if (!granted) {
    console.log('❌ Location permission not granted');
    Alert.alert('Permission Required', 'Location access is required for live tracking.');
    return;
  }

  console.log('✅ Location permission granted');

  // Get initial location
  try {
    console.log('📍 Requesting initial location...');
    
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 15000,
      maximumAge: 60000,
    });

    console.log('📍 Initial location received:', {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      accuracy: currentLocation.coords.accuracy,
      timestamp: new Date(currentLocation.timestamp).toISOString()
    });

    const coords = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };

    setLocation(coords);

    // Send the first location update immediately using the passed session
    console.log('📤 Sending initial location to database...');
    console.log('🎫 Using session directly:', {
      id: session.id,
      token: session.session_token
    });

    try {
      const updateResult = await trackingApi.addLocationUpdate(
        session.id, // Use passed session instead of state
        coords.latitude,
        coords.longitude
      );
      
      console.log('📊 Initial location update result:', updateResult);
      
      if (updateResult.error) {
        console.error('❌ Failed to send initial location:', updateResult.error);
        Alert.alert('Location Update Failed', `Error: ${updateResult.error}`);
      } else {
        console.log('✅ Initial location sent successfully!');
      }
    } catch (error) {
      console.error('💥 Error sending initial location:', error);
      Alert.alert('Location Error', `Failed to send location: ${error.message}`);
    }

    // Center map on user's location - CHANGED: Only if maps are available
    if (isMapsAvailable()) {
      setTimeout(() => {
        if (mapRef.current && coords) {
          const userRegion = {
            ...coords,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          mapRef.current.animateToRegion(userRegion, 1000);
        }
      }, 1500);
    }

  } catch (error) {
    console.error('💥 Failed to get initial location:', error);
    Alert.alert(
      'Location Error', 
      `Could not get your location: ${error.message}`
    );
    return;
  }

  // Set up periodic updates every 30 seconds
  console.log('⏰ Setting up periodic location updates...');
  
  const interval = setInterval(async () => {
    console.log('🔄 Periodic location update triggered...');
    
    try {
      const periodicLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 30000,
      });

      const periodicCoords = {
        latitude: periodicLocation.coords.latitude,
        longitude: periodicLocation.coords.longitude,
      };

      console.log('📍 Periodic location:', periodicCoords);
      setLocation(periodicCoords);

      // Use the passed session for periodic updates too
      const periodicResult = await trackingApi.addLocationUpdate(
        session.id, // Use passed session instead of state
        periodicCoords.latitude,
        periodicCoords.longitude
      );
      
      if (periodicResult.error) {
        console.error('❌ Periodic update failed:', periodicResult.error);
      } else {
        console.log('✅ Periodic update successful');
      }

    } catch (error) {
      console.error('💥 Periodic location error:', error);
    }
  }, 30000);

  setLocationUpdateInterval(interval);
  console.log('✅ Location monitoring started successfully');
};

  // Handle stop tracking
  const handleStopTracking = async () => {
    try {
      if (!trackingSession) return;

      console.log('Stopping tracking session:', trackingSession.id);
      
      const { error } = await trackingApi.stopTrackingSession(trackingSession.id);
      
      if (error) {
        Alert.alert('Error', 'Failed to stop tracking. Please try again.');
        console.error('Stop tracking error:', error);
        return;
      }

      setIsTracking(false);
      setTrackingSession(null);
      
      // Stop location monitoring and clear map data
      stopLocationMonitoring();

      Alert.alert(
        'Live Tracking Stopped',
        'Your location sharing has been turned off.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error stopping tracking:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  // Toggle tracking
  const handleToggleTracking = () => {
    if (isTracking) {
      handleStopTracking();
    } else {
      handleStartTracking();
    }
  };

  // Handle share ride
  const handleShareRide = async () => {
    if (!trackingSession) {
      Alert.alert(
        'Start Tracking First',
        'You need to start live tracking before you can share your location.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start Tracking', onPress: handleStartTracking }
        ]
      );
      return;
    }

    const shareUrl = trackingApi.generateShareableUrl(trackingSession.session_token);
    
    try {
      const result = await Share.share({
        message: `Track my live location on my Ribit ride from ${ride.from} to ${ride.to}: ${shareUrl}`,
        url: shareUrl,
        title: 'Live Ride Tracking',
      });

      if (result.action === Share.sharedAction) {
        console.log('Tracking link shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Share Error', 'Could not share the tracking link. Please try again.');
    }
  };

  // Enhanced handleOpenInMaps with pickup/dropoff support
  const handleOpenInMaps = () => {
    let destination = '';
    let origin = '';

    if (hasPickupDropoffLocations()) {
      // Use specific pickup and dropoff addresses
      if (userRole === 'driver') {
        // For drivers, navigate to pickup location first
        destination = `${ride.pickupLocation.address}`;
        origin = ''; // Start from current location
      } else {
        // For passengers, navigate to pickup location
        destination = `${ride.pickupLocation.address}`;
        origin = ''; // Start from current location
      }
    } else {
      // Fallback to city names for legacy rides
      destination = `${ride.to}, FL`;
      origin = '';
    }

    const mapsUrl = Platform.OS === 'ios' 
      ? `maps://app?daddr=${encodeURIComponent(destination)}`
      : `google.navigation:q=${encodeURIComponent(destination)}`;
    
    Linking.openURL(mapsUrl).catch(() => {
      // Fallback to web maps
      const webUrl = `https://maps.google.com/maps?daddr=${encodeURIComponent(destination)}`;
      Linking.openURL(webUrl);
    });
  };

  // NEW: Handle drop-off navigation with app options (for drivers only)
  const handleDropoffNavigation = () => {
    let destination = '';

    if (hasPickupDropoffLocations() && ride.dropoffLocation) {
      destination = ride.dropoffLocation.address;
    } else {
      // Fallback to destination city
      destination = `${ride.to}, FL`;
    }

    // Show options for different navigation apps
    Alert.alert(
      'Navigate to Drop-off',
      `Choose your preferred navigation app to get directions to:\n${destination}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const appleUrl = `maps://app?daddr=${encodeURIComponent(destination)}`;
            Linking.openURL(appleUrl).catch(() => {
              Alert.alert('Error', 'Apple Maps is not available on this device.');
            });
          },
        },
        {
          text: 'Google Maps',
          onPress: () => {
            const googleUrl = Platform.OS === 'ios'
              ? `comgooglemaps://?daddr=${encodeURIComponent(destination)}`
              : `google.navigation:q=${encodeURIComponent(destination)}`;
            
            Linking.openURL(googleUrl).catch(() => {
              // Fallback to web Google Maps
              const webUrl = `https://maps.google.com/maps?daddr=${encodeURIComponent(destination)}`;
              Linking.openURL(webUrl);
            });
          },
        },
        {
          text: 'Waze',
          onPress: () => {
            const wazeUrl = `waze://?q=${encodeURIComponent(destination)}`;
            Linking.openURL(wazeUrl).catch(() => {
              Alert.alert('Error', 'Waze is not installed on this device.');
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

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
          <Text style={styles.headerTitle}>Your Ride</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.content}>
          <Text style={{ padding: 20 }}>Ride data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state while checking verification
  if (loadingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Ride</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.content}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#666' }}>Checking ride status...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header outside of content - part of green background */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Ride</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content wrapper with grey background */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Ride Information Card - Always visible */}
          <View style={styles.rideInfoCard}>
            <View style={styles.routeSection}>
              <Text style={styles.sectionTitle}>Ride Details</Text>
              <View style={styles.routeContainer}>
                <View style={styles.routeIconsContainer}>
                  <View style={styles.originDot} />
                  <View style={styles.routeLine} />
                  <View style={styles.destinationDot} />
                </View>
                <View style={styles.routeDetails}>
                  <View style={styles.locationDetail}>
                    <Text style={styles.locationName}>{ride.from}</Text>
                    {hasPickupDropoffLocations() ? (
                      <>
                        <Text style={styles.meetingPoint}>{ride.pickupLocation.name}</Text>
                        <Text style={styles.meetingPointAddress}>{ride.pickupLocation.address}</Text>
                      </>
                    ) : (
                      <Text style={styles.meetingPoint}>Pickup location TBD</Text>
                    )}
                  </View>
                  <View style={styles.locationDetail}>
                    <Text style={styles.locationName}>{ride.to}</Text>
                    {hasPickupDropoffLocations() ? (
                      <>
                        <Text style={styles.meetingPoint}>{ride.dropoffLocation.name}</Text>
                        <Text style={styles.meetingPointAddress}>{ride.dropoffLocation.address}</Text>
                      </>
                    ) : (
                      <Text style={styles.meetingPoint}>Drop-off location TBD</Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rideDetailsSection}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{ride.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{ride.time}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Price</Text>
                  <Text style={styles.detailValue}>${ride.price}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Seats</Text>
                  <Text style={styles.detailValue}>
                    {userRole === 'passenger' ? ride.bookedSeats : ride.seatsAvailable}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Car Color</Text>
                <Text style={styles.detailValue}>{ride.driver.carColor || 'Unknown'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>License Plate</Text>
                <Text style={styles.detailValue}>{ride.driver.licensePlate || 'Unknown'}</Text>
              </View>
            </View>
          </View>

          {/* Pickup Navigation - Always accessible */}
          <View style={styles.actionButtonsCard}>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={handleOpenInMaps}
            >
              <Text style={styles.directionsButtonText}>
                {hasPickupDropoffLocations() 
                  ? `Navigate to ${userRole === 'driver' ? 'Pickup' : 'Pickup'} Location`
                  : 'Open in Maps'
                }
              </Text>
            </TouchableOpacity>
          </View>

          {/* Drop-off Navigation - Prominent location but blurred until verified, drivers only */}
          {userRole === 'driver' && (
            <View style={[
              styles.actionButtonsCard,
              !isPickupVerified && styles.restrictedContentBlurred
            ]}>
              <TouchableOpacity 
                style={styles.dropoffButton}
                onPress={handleDropoffNavigation}
                disabled={!isPickupVerified}
              >
                <Text style={styles.dropoffButtonText}>
                  Navigate to Drop-off Location
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Verification Status Notice - only show if not verified */}
          {!isPickupVerified && (
            <View style={styles.verificationNoticeCard}>
              <Text style={styles.verificationNoticeTitle}>
                🔒 Ride Not Yet Started
              </Text>
              
              {userRole === 'driver' ? (
                <View>
                  <Text style={styles.verificationNoticeText}>
                    Enter your passenger's PIN to verify pickup and unlock full ride features.
                  </Text>
                  
                  {/* Driver PIN Verification Interface */}
                  <View style={styles.pinVerificationContainer}>
                    <Text style={styles.pinInputLabel}>Passenger PIN:</Text>
                    <View style={styles.pinInputRow}>
                      <TextInput
                        style={[
                          styles.pinInput,
                          pinError && styles.pinInputError
                        ]}
                        value={pinInput}
                        onChangeText={(text) => {
                          setPinInput(text.replace(/\D/g, '').slice(0, 4));
                          if (pinError) setPinError('');
                        }}
                        placeholder="1234"
                        keyboardType="numeric"
                        maxLength={4}
                        textAlign="center"
                        editable={!verifyingPin}
                      />
                      <TouchableOpacity
                        style={[
                          styles.verifyButton,
                          (!pinInput.trim() || verifyingPin) && styles.verifyButtonDisabled
                        ]}
                        onPress={handleVerifyPin}
                        disabled={!pinInput.trim() || verifyingPin}
                      >
                        {verifyingPin ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.verifyButtonText}>Verify</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    {pinError ? (
                      <Text style={styles.pinErrorText}>{pinError}</Text>
                    ) : null}
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.verificationNoticeText}>
                    Your driver will verify pickup with your PIN to unlock full ride features.
                  </Text>
                  
                  {/* Passenger PIN Display - only show if NOT verified yet */}
                  {ride.passenger_pin && !ride.pickup_verified && (
                    <View style={styles.passengerPinDisplay}>
                      <Text style={styles.passengerPinDisplayLabel}>Your Pickup PIN:</Text>
                      <View style={styles.passengerPinDisplayContainer}>
                        <Text style={styles.passengerPinDisplayCode}>
                          {ride.passenger_pin}
                        </Text>
                      </View>
                      <Text style={styles.passengerPinDisplayHint}>
                        Show this PIN to your driver when they pick you up.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Show success message once verified */}
          {isPickupVerified && (
            <View style={styles.verificationSuccessCard}>
              <Text style={styles.verificationSuccessTitle}>
                🚗 Ride Started!
              </Text>
              <Text style={styles.verificationSuccessText}>
                Pickup verified. All ride features are now available.
              </Text>
            </View>
          )}

          {/* Blurred Content - Only show when pickup is verified */}
          <View style={[
            styles.restrictedContent,
            !isPickupVerified && styles.restrictedContentBlurred
          ]}>
            {/* Participant Information Card */}
            <View style={styles.participantCard}>
              <Text style={styles.sectionTitle}>
                {userRole === 'driver' ? 'Passengers' : 'Driver'}
              </Text>

              {userRole === 'driver' && ride.passengers && ride.passengers.length > 0 ? (
                <View style={styles.passengerList}>
                  {ride.passengers.map((p, index) => (
                    <View key={index} style={styles.participantInfo}>
                      <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                          {p.name ? p.name.charAt(0) : '?'}
                        </Text>
                      </View>
                      <View style={styles.participantDetails}>
                        <Text style={styles.participantName}>{p.name}</Text>
                        
                        {/* Rating and seats */}
                        <View style={styles.ratingContainer}>
                          <Text style={styles.ratingText}>★ {p.rating || 'N/A'}</Text>
                          <Text style={styles.ridesText}>{p.seatsBooked} seat{p.seatsBooked > 1 ? 's' : ''}</Text>
                        </View>
                        
                        {/* Luggage info below rating */}
                        <View style={styles.luggageContainer}>
                          <Text style={styles.luggageText}>
                            🧳 {p.medium_luggage || 0}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={() => Alert.alert('Contact', `Contact functionality for ${p.name} coming soon!`)}
                      >
                        <Text style={styles.contactButtonText}>Contact</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : userRole === 'driver' ? (
                <Text style={{ color: '#888', textAlign: 'center', marginVertical: 16 }}>
                  No passengers yet
                </Text>
              ) : (
                <View style={styles.participantInfo}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {ride.driver?.name ? ride.driver.name.charAt(0) : '?'}
                    </Text>
                  </View>
                  <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>
                      {userRole === 'driver' ? 'Your Passengers' : ride.driver?.name || 'Driver'}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>★ {ride.driver?.rating || 4.8}</Text>
                      <Text style={styles.ridesText}>{ride.driver?.rides || 0} rides</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => Alert.alert('Contact', 'Contact functionality coming soon!')}
                  >
                    <Text style={styles.contactButtonText}>Contact</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Live Tracking Action Buttons */}
            <View style={styles.actionButtonsCard}>
              <TouchableOpacity 
                style={[
                  styles.trackingButton, 
                  isTracking && styles.trackingButtonActive
                ]}
                onPress={handleToggleTracking}
                disabled={!isPickupVerified}
              >
                <Text style={[
                  styles.trackingButtonText,
                  isTracking && styles.trackingButtonTextActive
                ]}>
                  {isTracking ? 'Stop Live Tracking' : 'Start Live Tracking'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.shareButton,
                  (!isTracking || !isPickupVerified) && styles.shareButtonDisabled
                ]}
                onPress={handleShareRide}
                disabled={!isTracking || !isPickupVerified}
              >
                <Text style={[
                  styles.shareButtonText,
                  (!isTracking || !isPickupVerified) && styles.shareButtonTextDisabled
                ]}>
                  Share Live Location
                </Text>
              </TouchableOpacity>
            </View>

            {/* Conditional Map Display */}
            <View style={styles.mapContainer}>
              <Text style={styles.mapPlaceholderTitle}>Live Map</Text>
              
              {/* Show live map only when tracking is active */}
              {isTracking && region ? (
                // CHANGED: Use MapComponent instead of MapView
                <MapComponent
                  mapRef={mapRef}
                  style={styles.mapView}
                  region={region}
                  showsUserLocation={true}
                  followsUserLocation={false}
                  showsMyLocationButton={true}
                  onRegionChangeComplete={setRegion}
                >
                  {/* Route polyline - solid line for tracking */}
                  {routeCoordinates.length > 0 && (
                    <Polyline
                      coordinates={routeCoordinates}
                      strokeColor="#5DBE62"
                      strokeWidth={4}
                    />
                  )}
                  
                  {/* User's current location marker */}
                  {location && (
                    <Marker
                      coordinate={location}
                      title="Your Location"
                      description="Current position"
                      pinColor="#007AFF"
                    />
                  )}

                  {/* Pickup location marker - only if coordinates are available */}
                  {hasPickupDropoffLocations() && 
                   ride.pickupLocation && 
                   ride.pickupLocation.latitude && 
                   ride.pickupLocation.longitude && (
                    <Marker
                      coordinate={{
                        latitude: parseFloat(ride.pickupLocation.latitude),
                        longitude: parseFloat(ride.pickupLocation.longitude),
                      }}
                      title="Pickup Location"
                      description={ride.pickupLocation.name}
                      pinColor="#5DBE62"
                    />
                  )}

                  {/* Dropoff location marker - only if coordinates are available */}
                  {hasPickupDropoffLocations() && 
                   ride.dropoffLocation && 
                   ride.dropoffLocation.latitude && 
                   ride.dropoffLocation.longitude && (
                    <Marker
                      coordinate={{
                        latitude: parseFloat(ride.dropoffLocation.latitude),
                        longitude: parseFloat(ride.dropoffLocation.longitude),
                      }}
                      title="Dropoff Location"
                      description={ride.dropoffLocation.name}
                      pinColor="#ff6b6b"
                    />
                  )}
                </MapComponent>
              ) : (
                /* Show placeholder when tracking is inactive */
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapPlaceholderText}>
                    {isTracking ? 'Loading map and route...' : 'Start live tracking to see your route and location'}
                  </Text>
                  {/* ADDED: Show additional message on web */}
                  {!isMapsAvailable() && (
                    <Text style={[styles.mapPlaceholderText, { marginTop: 8, fontSize: 12, color: '#999' }]}>
                      Map functionality is limited on web. Use mobile app for full experience.
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Status Information */}
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Tracking Status</Text>
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: isTracking ? '#5DBE62' : '#ccc' }
                ]} />
                <Text style={styles.statusText}>
                  {isTracking ? 'Live Tracking Active' : 'Tracking Inactive'}
                </Text>
              </View>
              <Text style={styles.statusDescription}>
                {isTracking 
                  ? `Your location is being shared via: ${trackingSession ? trackingApi.generateShareableUrl(trackingSession.session_token) : ''}`
                  : userRole === 'driver' 
                    ? 'Start tracking to share your location with passengers and family.'
                    : 'Start tracking to share your location with family and friends.'
                }
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}