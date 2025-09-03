import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import styles from '../styles/mainScreenStyles';
import { authApi, profileApi, citiesApi, ridesApi, locationsApi } from '../lib/api'; // Add locationsApi import
import AuthCheck from './AuthCheck';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import { Picker } from '@react-native-picker/picker';
import Dropdown from './Dropdown';
import { 
  calculateMaxDriverPrice, 
  validateDriverPrice, 
  getDistanceBetweenCities,
  getDriverPricingBreakdown,
  getPlatformFees,
  calculatePassengerCost
} from '../lib/distances';


// Updated constants for header animation
const HEADER_MAX_HEIGHT = 320; // Increased to accommodate date field and proper spacing
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function MainScreen({ navigation, route }) {
  // Updated travel options with 10 miles option - for pickup/dropoff flexibility
  const travelOptions = [
    { label: 'Select an option', value: '' },
    { label: 'No - exact locations only', value: 'no' },
    { label: 'Yes - up to 5 miles from route', value: '5' },
    { label: 'Yes - up to 10 miles from route', value: '10' },
    { label: 'Yes - up to 15 miles from route', value: '15' },
  ];
  
  const [activeTab, setActiveTab] = useState('search');
  const [willingToTravel, setWillingToTravel] = useState('');
  // Search input states (what user is currently selecting)
  const [fromLocation, setFromLocation] = useState('Gainesville');

    // NEW: Location-related state
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState(null);
  const [loadingFromLocations, setLoadingFromLocations] = useState(false);
  const [loadingToLocations, setLoadingToLocations] = useState(false);
  
  // Search input states (what user is currently selecting)
  const [toLocation, setToLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');
  
  // Applied search states (what was actually searched)
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [isVerifiedDriver, setIsVerifiedDriver] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('none');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);

  // Driver pricing states
  const [driverPricingInfo, setDriverPricingInfo] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [priceError, setPriceError] = useState('');
  
  // Search calendar states
  const [showSearchCalendar, setShowSearchCalendar] = useState(false);
  const [searchCalendarPosition, setSearchCalendarPosition] = useState({ x: 0, y: 0 });
  const searchDateInputRef = useRef(null);
  
  // Offer ride calendar states (keeping existing)
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ x: 0, y: 0 });
  const dateInputRef = useRef(null);
  
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const ampm = ['AM', 'PM'];
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedAmPm, setSelectedAmPm] = useState('PM'); // Changed to PM for 12:00 PM default
  const [showPicker, setShowPicker] = useState(false);
  const [timeError, setTimeError] = useState(''); // New state for time validation error
  const formattedTime = `${selectedHour}:${selectedMinute} ${selectedAmPm}`;

  // Function to validate time range (5:00 AM to 8:00 PM) and check for past times
  const validateTimeRange = (hour, minute, ampm, selectedDate) => {
    // Convert to 24-hour format
    let hour24 = parseInt(hour);
    if (ampm === 'PM' && hour !== '12') {
      hour24 += 12;
    } else if (ampm === 'AM' && hour === '12') {
      hour24 = 0;
    }
    
    const timeInMinutes = hour24 * 60 + parseInt(minute);
    const minTime = 5 * 60; // 5:00 AM
    const maxTime = 20 * 60; // 8:00 PM
    
    // Check basic time range (5:00 AM - 8:00 PM)
    if (timeInMinutes < minTime || timeInMinutes > maxTime) {
      return { valid: false, error: 'Ride start times must be between 5:00 AM and 8:00 PM' };
    }
    
    // If a date is selected and it's today, check against current time + 1 hour
    if (selectedDate) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      if (selectedDate === todayString) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        // Require at least 1 hour from now
        const minAllowedTime = currentTimeInMinutes + 60;
        
        if (timeInMinutes < minAllowedTime) {
          // Calculate the next valid hour
          const nextHour = Math.ceil(minAllowedTime / 60);
          const displayHour = nextHour > 12 ? nextHour - 12 : (nextHour === 0 ? 12 : nextHour);
          const displayAmPm = nextHour >= 12 ? 'PM' : 'AM';
          
          return { 
            valid: false, 
            error: `For today's rides, start time must be at least ${displayHour}:00 ${displayAmPm} or later` 
          };
        }
      }
    }
    
    return { valid: true, error: '' };
  };

  const loadPickupLocations = async (cityName) => {
    if (!cityName) {
      setFromLocations([]);
      setSelectedPickupLocation(null);
      return;
    }

    setLoadingFromLocations(true);
    try {
      // Find the city ID
      const fromCity = cities.find(city => city.name === cityName);
      if (!fromCity) {
        console.log('City not found:', cityName);
        setFromLocations([]);
        setSelectedPickupLocation(null);
        return;
      }

      // Fetch locations for this city
      const { data: locations, error } = await locationsApi.getLocationsByCity(fromCity.id);
      
      if (error) {
        console.error('Error loading pickup locations:', error);
        setFromLocations([]);
        setSelectedPickupLocation(null);
        return;
      }

      console.log('Loaded pickup locations for', cityName, ':', locations);
      setFromLocations(locations || []);
      
      // Auto-select first location if only one available
      if (locations && locations.length === 1) {
        setSelectedPickupLocation(locations[0]);
      } else {
        setSelectedPickupLocation(null);
      }
    } catch (error) {
      console.error('Error loading pickup locations:', error);
      setFromLocations([]);
      setSelectedPickupLocation(null);
    } finally {
      setLoadingFromLocations(false);
    }
  };

  // NEW: Function to load dropoff locations when destination city is selected
  const loadDropoffLocations = async (cityName) => {
    if (!cityName) {
      setToLocations([]);
      setSelectedDropoffLocation(null);
      return;
    }

    setLoadingToLocations(true);
    try {
      // Find the city ID
      const toCity = cities.find(city => city.name === cityName);
      if (!toCity) {
        console.log('City not found:', cityName);
        setToLocations([]);
        setSelectedDropoffLocation(null);
        return;
      }

      // Fetch locations for this city
      const { data: locations, error } = await locationsApi.getLocationsByCity(toCity.id);
      
      if (error) {
        console.error('Error loading dropoff locations:', error);
        setToLocations([]);
        setSelectedDropoffLocation(null);
        return;
      }

      console.log('Loaded dropoff locations for', cityName, ':', locations);
      setToLocations(locations || []);
      
      // Auto-select first location if only one available
      if (locations && locations.length === 1) {
        setSelectedDropoffLocation(locations[0]);
      } else {
        setSelectedDropoffLocation(null);
      }
    } catch (error) {
      console.error('Error loading dropoff locations:', error);
      setToLocations([]);
      setSelectedDropoffLocation(null);
    } finally {
      setLoadingToLocations(false);
    }
  };

  // Updated city selection handlers
  const handleFromCitySelect = (city) => {
    setOfferFrom(city);
    if (city === offerTo) {
      setOfferTo('');
      setToLocations([]);
      setSelectedDropoffLocation(null);
    }
    // Load pickup locations for selected city
    loadPickupLocations(city);
  };

  const handleToCitySelect = (city) => {
    setOfferTo(city);
    // Load dropoff locations for selected city
    loadDropoffLocations(city);
  };

  // Function to handle time changes and validate
  const handleTimeChange = (newHour, newMinute, newAmPm) => {
    setSelectedHour(newHour);
    setSelectedMinute(newMinute);
    setSelectedAmPm(newAmPm);
    
    const validation = validateTimeRange(newHour, newMinute, newAmPm, offerDate);
    if (!validation.valid) {
      setTimeError(validation.error);
    } else {
      setTimeError('');
    }
  };

  // Get today's date in YYYY-MM-DD format for calendar minDate
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log('MainScreen gained focus, refreshing rides...');
      fetchRides();
      
      if (route.params?.refresh) {
        console.log('Explicit refresh requested');
        navigation.setParams({ refresh: undefined });
      }
    }, [route.params?.refresh])
  );

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Updated animation interpolations for larger header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const routeDisplayOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 3, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });
  
  const collapsedHeaderBackgroundColor = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: ['rgba(135, 215, 124, 0.95)', 'rgba(135, 215, 124, 1)'],
    extrapolate: 'clamp',
  });
  
  const convertTo12HourFormat = (time24) => {
    if (!time24) return '';

    const [hourStr, minute] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${hour12}:${minute} ${ampm}`;
  };

  // Offer ride states
  const [offerFrom, setOfferFrom] = useState(''); // No default for consistency
  const [offerTo, setOfferTo] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [offerTime, setOfferTime] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('');
  const [luggageCapacity, setLuggageCapacity] = useState('');

  // Calculate max price when route changes
  useEffect(() => {
    if (offerFrom && offerTo && offerFrom !== offerTo) {
      const distance = getDistanceBetweenCities(offerFrom, offerTo);
      const maxDriverPrice = calculateMaxDriverPrice(offerFrom, offerTo);
      
      setRouteDistance(distance);
      setMaxPrice(maxDriverPrice);
      
      // Clear price error when route changes
      setPriceError('');
      
      // Reset price if it exceeds new max
      if (price && maxDriverPrice && parseFloat(price) > maxDriverPrice) {
        setPrice('');
      }
    } else {
      setRouteDistance(null);
      setMaxPrice(null);
      setPriceError('');
    }
  }, [offerFrom, offerTo]);

// Add this function after the useEffect above
  // Validate price when it changes
  const handlePriceChange = (newPrice) => {
    setPrice(newPrice);
    
    if (newPrice && offerFrom && offerTo) {
      const numericPrice = parseFloat(newPrice);
      if (!isNaN(numericPrice) && numericPrice > 0) {
        const validation = validateDriverPrice(numericPrice, offerFrom, offerTo);
        if (!validation.isValid) {
          setPriceError(validation.error);
          setDriverPricingInfo(null);
        } else {
          setPriceError('');
          // Calculate what passengers will pay
          const pricingBreakdown = getDriverPricingBreakdown(numericPrice);
          setDriverPricingInfo(pricingBreakdown);
        }
      } else {
        setDriverPricingInfo(null);
      }
    } else {
      setPriceError('');
      setDriverPricingInfo(null);
    }
  };

  // Load profile and cities data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await profileApi.getProfile();
        
        if (profileError) {
          console.error('Profile error:', profileError);
        }
        
        if (profileData) {
          setProfile(profileData);
          setIsVerifiedDriver(profileData.is_verified_driver || false);
          setVerificationStatus(
            profileData.is_verified_driver ? 'verified' : 
            profileData.verification_pending ? 'pending' : 
            'none'
          );
        }
        
        // Fetch cities from database
        const { data: citiesData, error: citiesError } = await citiesApi.getAllCities();
        
        if (citiesError) {
          console.error('Cities error:', citiesError);
        }
        
        if (citiesData && citiesData.length > 0) {
          setCities(citiesData);
          console.log('Cities loaded from database:', citiesData);
        } else {
          // Fall back to default cities if none in database
          const defaultCities = [
            { id: '1', name: 'Gainesville', state: 'FL', is_active: true },
            { id: '2', name: 'Orlando', state: 'FL', is_active: true },
            { id: '3', name: 'Tampa', state: 'FL', is_active: true },
            { id: '4', name: 'Miami', state: 'FL', is_active: true }
          ];
          setCities(defaultCities);
          console.log('Using default cities as fallback:', defaultCities);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        // Ensure we at least have default cities if everything fails
        const defaultCities = [
          { id: '1', name: 'Gainesville', state: 'FL', is_active: true },
          { id: '2', name: 'Orlando', state: 'FL', is_active: true },
          { id: '3', name: 'Tampa', state: 'FL', is_active: true },
          { id: '4', name: 'Miami', state: 'FL', is_active: true }
        ];
        setCities(defaultCities);
      } finally {
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, []);

  useEffect(() => {
    const checkForReviewNotifications = async () => {
      const { session } = await authApi.getSession();
      if (!session) return;

      const { data: bookedRides, error } = await ridesApi.getBookedRidesByUser(session.user.id);
      if (error || !bookedRides.length) return;

      const now = new Date();

      for (const booking of bookedRides) {
        const { date, time } = booking.ride;
        const endTime = new Date(`${date}T${time}`);
        endTime.setHours(endTime.getHours() + 1); // assume ride takes 1 hour
        const reviewTriggerTime = new Date();
        // Change the line to this for testing
        // reviewTriggerTime.setHours(reviewTriggerTime.getHours() - 10);

        reviewTriggerTime.setHours(reviewTriggerTime.getHours() + 4);

        console.log(`Booking ID: ${booking.id}, reviewed:`, booking.reviewed);

        if (now >= reviewTriggerTime && !booking.reviewed) {
          Alert.alert(
            "Rate Your Ride",
            `How was your ride to ${booking.ride.to_city.name}?`,
            [
              { text: "Later", style: "cancel" },
              {
                text: "Rate Now",
                onPress: () => navigation.navigate("ReviewScreen", {
                  bookingId: booking.id,
                  rideId: booking.ride.id,
                  driverId: booking.ride.profiles?.user_id, // safely optional chain
                  driverName: booking.ride.profiles?.first_name ?? 'Driver',
                }),
              }
            ]
          );
          break; // Only trigger once
        }
      }
    };

    checkForReviewNotifications();
  }, []);

const fetchRides = async () => {
  console.log('Fetching rides...');
  const { data, error } = await ridesApi.getActiveRides();

  if (error) {
    console.error('Error fetching rides:', error);
  } else {
    console.log('Fetched', data.length, 'active rides');
    const formatted = data.map(ride => {
      
      return {
        id: ride.id,
        driver: {
          id: ride.profiles?.user_id,
          name: `${ride.profiles?.first_name ?? ''} ${ride.profiles?.last_name ?? ''}`.trim() || 'Unknown Driver',
          rating: ride.profiles?.rating ?? 4.8,
          rides: 12,
          avatar: ride.profiles?.avatar_url,
        },
        from: ride.from_city?.name ?? 'Unknown',
        to: ride.to_city?.name ?? 'Unknown',
        date: ride.departure_date,
        time: convertTo12HourFormat(ride.departure_time),
        price: ride.price,
        seatsAvailable: ride.available_seats,
        pickupLocationId: ride.pickup_location_id,
        dropoffLocationId: ride.dropoff_location_id,
        pickupLocation: ride.pickup_location,
        dropoffLocation: ride.dropoff_location,
        extra_miles_willing: ride.extra_miles_willing,
        available_luggage: ride.available_luggage,      // <-- Add this
        medium_luggage: ride.medium_luggage,  
      };
    });

    console.log('Formatted ride data:', formatted);
    setRides(formatted);
  }
};

  useEffect(() => {
    fetchRides();
  }, []);

  // Check verification status
  useEffect(() => {
    const checkDriverStatus = () => {
  
      
      if (route.params?.verified) {
        console.log('User was verified via params');
        setIsVerifiedDriver(true);
        setVerificationStatus('verified');
        navigation.setParams({ verified: undefined });
      }
      else if (profile?.is_verified_driver) {
        console.log('User is verified via profile');
        setIsVerifiedDriver(true);
        setVerificationStatus('verified');
      } 
      else if (profile?.verification_pending) {
        console.log('User verification is pending');
        setVerificationStatus('pending');
      }
    };
    
    checkDriverStatus();
    const unsubscribe = navigation.addListener('focus', checkDriverStatus);
    return unsubscribe;
  }, [navigation, route.params, profile]);

  // Get city names for display
  const getCityNames = () => {
    if (cities && cities.length > 0) {
      return cities
        .filter(city => city.is_active)
        .map(city => city.name);
    }
    
    return ['Gainesville', 'Orlando', 'Tampa', 'Miami'];
  };

  // Handle "Offer a Ride" tab click
  const handleOfferRideClick = () => {
    console.log('Offer ride clicked, status:', { 
      isVerified: isVerifiedDriver, 
      status: verificationStatus 
    });
    
    if (isVerifiedDriver || verificationStatus === 'verified') {
      setActiveTab('offer');
    } else if (verificationStatus === 'pending') {
      navigation.navigate('VerificationStatus');
    } else {
      if (profile && profile.first_name && profile.last_name) {
        navigation.navigate('DriverSignUp');
      } else {
        navigation.navigate('Profile', { fromDriverSignup: true, requiresCompletion: true });
      }
    }
  };
  
  // Updated search for rides - only executes when search button is pressed
  const handleSearch = () => {
    // Validate that origin and destination are not the same (only if both are selected)
    if (fromLocation && toLocation && fromLocation.toLowerCase() === toLocation.toLowerCase()) {
      Alert.alert('Invalid Selection', 'Origin and destination cannot be the same.');
      return;
    }

    // Apply the current input values to the search
    setAppliedFrom(fromLocation);
    setAppliedTo(toLocation);
    setAppliedDate(searchDate);
    setHasSearched(true);

    // Filter rides based on any combination of criteria
    const results = rides.filter(ride => {
      let matches = true;
      
      // Filter by from location if specified
      if (fromLocation) {
        matches = matches && ride.from.toLowerCase() === fromLocation.toLowerCase();
      }
      
      // Filter by to location if specified
      if (toLocation) {
        matches = matches && ride.to.toLowerCase() === toLocation.toLowerCase();
      }
      
      // Filter by date if specified
      if (searchDate) {
        matches = matches && ride.date === searchDate;
      }
      
      return matches;
    });

    console.log(`Filtered ${results.length} rides matching search criteria:`, {
      from: fromLocation || 'any',
      to: toLocation || 'any', 
      date: searchDate || 'any'
    });

    setFilteredRides(results);
  };

  // Clear search filters
  const clearSearch = () => {
    // Reset input states
    setFromLocation('');
    setToLocation('');
    setSearchDate('');
    
    // Reset applied search states
    setAppliedFrom('');
    setAppliedTo('');
    setAppliedDate('');
    setHasSearched(false);
    
    // Clear filtered results
    setFilteredRides([]);
  };
  
  // Handle posting a ride
  const handlePostRide = async () => {
    console.log("handlePostRide called");
    
    const fromCity = cities.find(city => city.name === offerFrom);
    const toCity = cities.find(city => city.name === offerTo);
    
    // Validation
    if (!offerFrom || !offerTo || !offerDate || !selectedHour || !selectedMinute || !selectedAmPm || !price || !seats) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!fromCity || !toCity) {
      Alert.alert('Invalid Cities', 'Please select valid cities.');
      return;
    }

    if (!selectedPickupLocation) {
      Alert.alert('Missing Pickup Location', 'Please select a pickup location.');
      return;
    }

    if (!selectedDropoffLocation) {
      Alert.alert('Missing Dropoff Location', 'Please select a dropoff location.');
      return;
    }

    // Validate price
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    const priceValidation = validateDriverPrice(numericPrice, offerFrom, offerTo);
    if (!priceValidation.isValid) {
      Alert.alert('Invalid Price', priceValidation.error);
      return;
    }

    // Format time to HH:MM:SS (24-hour)
    const hour24 =
      selectedAmPm === 'PM' && selectedHour !== '12'
        ? parseInt(selectedHour) + 12
        : selectedAmPm === 'AM' && selectedHour === '12'
        ? 0
        : parseInt(selectedHour);

    const formattedHour = hour24.toString().padStart(2, '0');
    const formattedMinute = selectedMinute.padStart(2, '0');
    const formattedTime = `${formattedHour}:${formattedMinute}:00`;

    console.log("Form Inputs", {
      offerFrom,
      offerTo,
      offerDate,
      offerTime: formattedTime,
      price,
      seats,
      luggageCapacity,
      pickupLocation: selectedPickupLocation?.name,
      dropoffLocation: selectedDropoffLocation?.name,
    });

    const parsedSeats = parseInt(seats);

    const { data, error } = await ridesApi.createRide({
      fromCityId: fromCity.id,
      toCityId: toCity.id,
      fromName: fromCity.name,
      toName: toCity.name,
      date: offerDate,
      time: formattedTime,
      price: numericPrice,
      seats: parsedSeats,
      availableSeats: parsedSeats,
      pickupLocationId: selectedPickupLocation.id,
      dropoffLocationId: selectedDropoffLocation.id,
      extraMilesWilling: willingToTravel,
      luggageCapacity: parseInt(luggageCapacity) || 0,
    });

    if (error) {
      Alert.alert('Error', 'Failed to post ride.');
      console.error('Post error:', error);
    } else {
      await fetchRides();
      Alert.alert('Ride Posted', 'Your ride has been posted successfully.', [
        { text: 'OK', onPress: () => setActiveTab('search') },
      ]);
      
      // Reset form
      setOfferFrom('');
      setOfferTo('');
      setOfferDate('');
      setPrice('');
      setSeats('');
      setLuggageCapacity('');
      setSelectedPickupLocation(null);
      setSelectedDropoffLocation(null);
      setFromLocations([]);
      setToLocations([]);
      setWillingToTravel('');
      setMaxPrice(null);
      setRouteDistance(null);
      setPriceError('');
      setDriverPricingInfo(null); 
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

  // Updated render each ride listing with repositioned extra miles
const renderRideItem = ({ item }) => {
    // Calculate what a single passenger would pay
    const singlePassengerCost = calculatePassengerCost(item.price, 1);
    
    return (
      <TouchableOpacity 
        style={styles.rideCard}
        onPress={() => navigation && navigation.navigate('RideDetail', { ride: item })}
      >
        <View style={styles.rideHeader}>
          <View style={styles.driverInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {item.driver?.name ? item.driver.name.charAt(0) : '?'}
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
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${singlePassengerCost}</Text>
            {<Text style={styles.priceSubtext}>(1 seat)</Text>}
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.rideDetails}>
          <View style={styles.locationContainer}>
            <View style={styles.locationDot} />
            <View style={styles.locationLine} />
            <View style={styles.locationPin} />
            
            <View style={styles.locationTextContainer}>
              <Text style={styles.fromLocationText}>
                {item.from} - {item.pickupLocation?.name || 'Location TBD'}
              </Text>
              <Text style={styles.toLocationText}>
                {item.to} - {item.dropoffLocation?.name || 'Location TBD'}
              </Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
            <View style={styles.seatsContainer}>
              <Text style={styles.seatsText}>
                Up to {item.seatsAvailable} {item.seatsAvailable === 1 ? 'seat' : 'seats'}
              </Text>
            </View>
          </View>
        </View>

        {/* Extra miles info below route details */}
        <View style={styles.extraMilesContainer}>
          <Text style={styles.extraMilesLabel}>Travel flexibility:</Text>
          <View style={styles.extraMilesBadge}>
            <Text style={styles.extraMilesText}>
              {item.extra_miles_willing === 'no' || !item.extra_miles_willing
                ? 'Exact locations only'
                : item.extra_miles_willing === '5'
                  ? 'Up to 5 miles'
                  : item.extra_miles_willing === '10'
                    ? 'Up to 10 miles'
                  : item.extra_miles_willing === '15'
                    ? 'Up to 15 miles'
                    : 'Not specified'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AuthCheck navigation={navigation}>
      <SafeAreaView style={styles.container}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#5DBE62" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.logo}>ribit</Text>
            </View>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'search' && styles.activeTab]}
                onPress={() => setActiveTab('search')}
              >
                <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
                  Find a Ride
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'offer' && styles.activeTab]}
                onPress={handleOfferRideClick}
              >
                <Text style={[styles.tabText, activeTab === 'offer' && styles.activeTabText]}>
                  Offer a Ride
                </Text>
              </TouchableOpacity>
            </View>
            
            {activeTab === 'search' ? (
              <View style={styles.content}>
                {/* Collapsible search header - updated with date field */}
                <Animated.View 
                  style={{
                    height: headerHeight,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#f9f9f9',
                    zIndex: 10,
                    paddingHorizontal: 15,
                    paddingTop: 15,
                  }}
                >
                  {/* Expanded search form */}
                  <Animated.View 
                    style={{
                      opacity: searchOpacity,
                      backgroundColor: 'white',
                      borderRadius: 10,
                      paddingHorizontal: 15,
                      paddingVertical: 15,
                      paddingBottom: 15,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 5,
                      elevation: 2,
                    }}
                  >
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>From</Text>
                      <View style={styles.citySelectContainer}>
                        {getCityNames().map((city) => (
                          <TouchableOpacity
                            key={city}
                            style={[
                              styles.cityButton,
                              fromLocation === city && styles.cityButtonSelected
                            ]}
                            onPress={() => {
                              setFromLocation(city);
                              if (city === toLocation) {
                                setToLocation('');
                              }
                            }}
                          >
                            <Text 
                              style={[
                                styles.cityButtonText,
                                fromLocation === city && styles.cityButtonTextSelected
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {city}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>To</Text>
                      <View style={styles.citySelectContainer}>
                        {getCityNames().map((city) => (
                          <TouchableOpacity
                            key={city}
                            style={[
                              styles.cityButton,
                              toLocation === city && styles.cityButtonSelected,
                              city === fromLocation && styles.cityButtonDisabled
                            ]}
                            disabled={city === fromLocation}
                            onPress={() => setToLocation(city)}
                          >
                            <Text 
                              style={[
                                styles.cityButtonText,
                                toLocation === city && styles.cityButtonTextSelected,
                                city === fromLocation && styles.cityButtonTextDisabled
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {city}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Date Input Field with calendar restrictions */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Date (Optional)</Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          searchDateInputRef.current.measure((fx, fy, width, height, px, py) => {
                            setSearchCalendarPosition({ x: px, y: py + height });
                            setShowSearchCalendar(true);
                          });
                        }}
                        ref={searchDateInputRef}
                      >
                        <View pointerEvents="none">
                          <TextInput
                            style={styles.input}
                            placeholder="Select date"
                            value={searchDate}
                            editable={false}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.searchButtonRow}>
                      <TouchableOpacity 
                        style={styles.searchButton}
                        onPress={handleSearch}
                      >
                        <Text style={styles.searchButtonText}>Search</Text>
                      </TouchableOpacity>
                      
                      {hasSearched && (
                        <TouchableOpacity 
                          style={styles.clearButton}
                          onPress={clearSearch}
                        >
                          <Text style={styles.clearButtonText}>Clear</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Animated.View>
                  
                  {/* Collapsed header - improved */}
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 15,
                      left: 0,
                      right: 0,
                      height: HEADER_MIN_HEIGHT - 30,
                      backgroundColor: collapsedHeaderBackgroundColor,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 15,
                      opacity: routeDisplayOpacity,
                      marginHorizontal: 15,
                      zIndex: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                  >
                    <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                      <Text style={{ fontWeight: '600', fontSize: 16, color: '#fff' }}>
                        {appliedFrom || 'Any'} 
                      </Text>
                      <Text style={{ marginHorizontal: 8, fontSize: 16, color: '#fff' }}>→</Text>
                      <Text style={{ fontWeight: '600', fontSize: 16, color: '#fff' }}>
                        {appliedTo || 'Any'}
                      </Text>
                      {appliedDate && (
                        <>
                          <Text style={{ marginHorizontal: 8, fontSize: 16, color: '#fff' }}>•</Text>
                          <Text style={{ fontWeight: '600', fontSize: 16, color: '#fff' }}>
                            {appliedDate}
                          </Text>
                        </>
                      )}
                    </View>
                    
                    <View style={{position: 'absolute', right: 15}}>
                      <Text style={{color: '#fff', fontSize: 16, fontWeight: '600'}}>Search</Text>
                    </View>
                  </Animated.View>
                </Animated.View>
                
                {/* Rides list - updated logic for search results */}
                <Animated.FlatList
                  data={(() => {
                    // If search has been performed, show filtered results (even if empty)
                    // If no search performed, show all rides
                    return hasSearched ? filteredRides : rides;
                  })()}
                  renderItem={renderRideItem}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ 
                    paddingTop: HEADER_MAX_HEIGHT + 40, // Increased padding to prevent overlap
                    paddingHorizontal: 15,
                    paddingBottom: 20, 
                  }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                  ListHeaderComponent={() => {
                    return (
                      <View style={{paddingTop: 10, paddingBottom: 5}}>
                        <Text style={styles.resultsTitle}>
                          {hasSearched
                            ? filteredRides.length > 0
                              ? `${filteredRides.length} rides found`
                              : 'No rides match your search'
                            : `${rides.length} rides available`}
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            ) : (
              // Offer ride section with time validation
              <ScrollView style={styles.content} contentContainerStyle={styles.offerContent}>
              <Text style={styles.sectionTitle}>Offer a Ride</Text>
              <Text style={styles.offerDescription}>
                Share your journey and reduce costs by offering a ride to others heading your way.
              </Text>
              
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Route Details</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>From City</Text>
                  <View style={styles.citySelectContainer}>
                    {getCityNames().map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={[
                          styles.cityButton,
                          offerFrom === city && styles.cityButtonSelected
                        ]}
                        onPress={() => handleFromCitySelect(city)}
                      >
                        <Text 
                          style={[
                            styles.cityButtonText,
                            offerFrom === city && styles.cityButtonTextSelected
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Pickup Location Selection */}
                {offerFrom && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Pickup Location in {offerFrom}</Text>
                    {loadingFromLocations ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#5DBE62" />
                        <Text style={styles.loadingText}>Loading pickup locations...</Text>
                      </View>
                    ) : fromLocations.length > 0 ? (
                      <View style={styles.locationSelectContainer}>
                        {fromLocations.map((location) => (
                          <TouchableOpacity
                            key={location.id}
                            style={[
                              styles.locationButton,
                              selectedPickupLocation?.id === location.id && styles.locationButtonSelected
                            ]}
                            onPress={() => setSelectedPickupLocation(location)}
                          >
                            <Text 
                              style={[
                                styles.locationButtonText,
                                selectedPickupLocation?.id === location.id && styles.locationButtonTextSelected
                              ]}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {location.name}
                            </Text>
                            <Text style={styles.locationAddressText}>
                              {location.address}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noLocationsText}>
                        No pickup locations available for {offerFrom}
                      </Text>
                    )}
                  </View>
                )}
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>To City</Text>
                  <View style={styles.citySelectContainer}>
                    {getCityNames().map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={[
                          styles.cityButton,
                          offerTo === city && styles.cityButtonSelected,
                          city === offerFrom && styles.cityButtonDisabled
                        ]}
                        disabled={city === offerFrom}
                        onPress={() => handleToCitySelect(city)}
                      >
                        <Text 
                          style={[
                            styles.cityButtonText,
                            offerTo === city && styles.cityButtonTextSelected,
                            city === offerFrom && styles.cityButtonTextDisabled
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Dropoff Location Selection */}
                {offerTo && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Dropoff Location in {offerTo}</Text>
                    {loadingToLocations ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#5DBE62" />
                        <Text style={styles.loadingText}>Loading dropoff locations...</Text>
                      </View>
                    ) : toLocations.length > 0 ? (
                      <View style={styles.locationSelectContainer}>
                        {toLocations.map((location) => (
                          <TouchableOpacity
                            key={location.id}
                            style={[
                              styles.locationButton,
                              selectedDropoffLocation?.id === location.id && styles.locationButtonSelected
                            ]}
                            onPress={() => setSelectedDropoffLocation(location)}
                          >
                            <Text 
                              style={[
                                styles.locationButtonText,
                                selectedDropoffLocation?.id === location.id && styles.locationButtonTextSelected
                              ]}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {location.name}
                            </Text>
                            <Text style={styles.locationAddressText}>
                              {location.address}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noLocationsText}>
                        No dropoff locations available for {offerTo}
                      </Text>
                    )}
                  </View>
                )}
                
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>  
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      dateInputRef.current.measure((fx, fy, width, height, px, py) => {
                        setCalendarPosition({ x: px, y: py + height });
                        setShowCalendar(true);
                      });
                    }}
                    ref={dateInputRef}
                  >
                    <View pointerEvents="none">
                      <TextInput
                        style={styles.input}
                        placeholder="MM/DD/YYYY"
                        value={offerDate}
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Time</Text>

                  {/* Time validation error message */}
                  {timeError ? (
                    <Text style={styles.timeErrorText}>{timeError}</Text>
                  ) : null}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowPicker(true)}
                  >
                    <View pointerEvents="none">
                      <TextInput
                        style={styles.input}
                        placeholder="Select time"
                        value={formattedTime}
                        editable={false}
                      />
                    </View>
                  </TouchableOpacity>

                  <Modal visible={showPicker} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                      <View style={styles.pickerContainer}>
                        <View style={styles.pickerRow}>
                          <View style={styles.pickerColumnWrapper}>
                            <WheelPickerExpo
                              height={150}
                              selectedStyle={styles.selected}
                              initialSelectedIndex={hours.indexOf(selectedHour)}
                              items={hours.map(val => ({ label: val, value: val }))}
                              onChange={({ item }) => handleTimeChange(item.value, selectedMinute, selectedAmPm)}
                            />
                          </View>
                          <View style={styles.pickerColumnWrapper}>
                            <WheelPickerExpo
                              height={150}
                              selectedStyle={styles.selected}
                              initialSelectedIndex={minutes.indexOf(selectedMinute)}
                              items={minutes.map(val => ({ label: val, value: val }))}
                              onChange={({ item }) => handleTimeChange(selectedHour, item.value, newAmPm)}
                            />
                          </View>
                          <View style={styles.pickerColumnWrapper}>
                            <WheelPickerExpo
                              height={150}
                              selectedStyle={styles.selected}
                              initialSelectedIndex={ampm.indexOf(selectedAmPm)}
                              items={ampm.map(val => ({ label: val, value: val }))}
                              onChange={({ item }) => handleTimeChange(selectedHour, selectedMinute, item.value)}
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.doneButton}
                          onPress={() => {
                            setShowPicker(false);
                          }}
                        >
                          <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </View>
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>Ride Details</Text>

                {/* Route info display */}
                {offerFrom && offerTo && routeDistance && maxPrice && (
                  <View style={styles.routeInfoContainer}>
                    <Text style={styles.routeInfoText}>
                      {offerFrom} → {offerTo}: {routeDistance} miles
                    </Text>
                    <Text style={styles.maxPriceText}>
                      Maximum price: ${maxPrice.toFixed(2)}
                    </Text>
                  </View>
                )}

                {/* Price and Seats side by side */}
                <View style={styles.rowInputs}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>
                      Your Price
                    </Text>
                    {priceError ? (
                      <Text style={styles.priceErrorText}>{priceError}</Text>
                    ) : null}
                    <TextInput
                      style={[styles.input, priceError && styles.inputError]}
                      placeholder="$"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={handlePriceChange}
                    />
                    {!priceError && price && (
                      <Text style={styles.priceHelpText}>
                        Up to ${(price * 0.875).toFixed(2)} after fees
                      </Text>
                    )}
                  </View>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Available seats</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1-4"
                      keyboardType="numeric"
                      value={seats}
                      onChangeText={setSeats}
                    />
                  </View>
                </View>

                {/* Driver pricing breakdown */}
                {driverPricingInfo && (
                  <View style={styles.pricingBreakdownContainer}>
                    <Text style={styles.pricingBreakdownTitle}>
                      What you'll earn (after fees) if a passenger books:
                    </Text>
                    <View style={styles.pricingBreakdownRow}>
                      <Text style={styles.pricingBreakdownLabel}>1 seat:</Text>
                      <Text style={styles.pricingBreakdownValue}>
                        ${(driverPricingInfo.oneSeat * 0.875).toFixed(2)} ({Math.round(driverPricingInfo.onePassengerPercentage * 100)}%)
                      </Text>
                    </View>
                    <View style={styles.pricingBreakdownRow}>
                      <Text style={styles.pricingBreakdownLabel}>2 seats:</Text>
                      <Text style={styles.pricingBreakdownValue}>
                        ${(driverPricingInfo.twoSeats * 0.875).toFixed(2)} ({Math.round(driverPricingInfo.twoPassengerPercentage * 100)}%)
                      </Text>
                    </View>
                    <View style={styles.pricingBreakdownRow}>
                      <Text style={styles.pricingBreakdownLabel}>3+ seats:</Text>
                      <Text style={styles.pricingBreakdownValue}>
                        ${(driverPricingInfo.threeSeats * 0.875).toFixed(2)} ({Math.round(driverPricingInfo.threePassengerPercentage * 100)}%)
                      </Text>
                    </View>
                    {/* <Text style={styles.pricingBreakdownNote}>
                      Higher passenger counts get better rates to encourage bulk bookings
                    </Text> */}
                  </View>
                )}

                {/* Dropdown for pickup/dropoff flexibility */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Pickup & Dropoff Flexibility</Text>
                  <Text style={styles.inputHelpText}>
                    Are you willing to detour from your main route to pick up or drop off passengers?
                  </Text>
                  <Dropdown
                    options={travelOptions}
                    selected={travelOptions.find(opt => opt.value === willingToTravel)}
                    onSelect={(option) => setWillingToTravel(option.value)}
                    placeholder="Select an option"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Luggage Capacity</Text>
                <TextInput
                style={styles.input}
                placeholder="Number of suitcases"
                keyboardType="numeric"
                value={luggageCapacity}
                onChangeText={text => {
                  // Only allow whole numbers >= 0, no decimals
                  const val = Math.max(0, parseInt(text.replace(/\D/g, ''), 10) || 0);
                  setLuggageCapacity(val.toString());
                }}
              />
              </View>
                
              </View>

              <TouchableOpacity 
                style={styles.postButton}
                onPress={handlePostRide}
              >
                <Text style={styles.postButtonText}>Post Ride</Text>
              </TouchableOpacity>
            </ScrollView>
            )}
          </>
        )}
        
        {/* Search Calendar Modal with date restrictions */}
        <Modal
          transparent={true}
          visible={showSearchCalendar}
          animationType="fade"
          onRequestClose={() => setShowSearchCalendar(false)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPressOut={() => setShowSearchCalendar(false)}
          >
            <View style={{
              position: 'absolute',
              top: searchCalendarPosition.y,
              left: searchCalendarPosition.x,
              backgroundColor: 'white',
              elevation: 4,
              borderRadius: 10,
              padding: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4
            }}>
              <Calendar
                onDayPress={day => {
                  const formattedDate = day.dateString;
                  setSearchDate(formattedDate);
                  setShowSearchCalendar(false);
                }}
                markedDates={{ [searchDate]: { selected: true } }}
                enableSwipeMonths={true}
                minDate={getTodayDate()}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        
        {/* Offer Ride Calendar Modal with date restrictions */}
        <Modal
          transparent={true}
          visible={showCalendar}
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPressOut={() => setShowCalendar(false)}
          >
            <View style={{
              position: 'absolute',
              top: calendarPosition.y,
              left: calendarPosition.x,
              backgroundColor: 'white',
              elevation: 4,
              borderRadius: 10,
              padding: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4
            }}>
              <Calendar
                onDayPress={day => {
                  const formattedDate = day.dateString;
                  setOfferDate(formattedDate);
                  setShowCalendar(false);
                  
                  // Re-validate time when date changes
                  const validation = validateTimeRange(selectedHour, selectedMinute, selectedAmPm, formattedDate);
                  if (!validation.valid) {
                    setTimeError(validation.error);
                  } else {
                    setTimeError('');
                  }
                }}
                markedDates={{ [offerDate]: { selected: true } }}
                enableSwipeMonths={true}
                minDate={getTodayDate()}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </AuthCheck>
  );
}