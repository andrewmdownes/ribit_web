// lib/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';


const SUPABASE_URL = 'https://xetmnlcaaczjmilpcaez.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldG1ubGNhYWN6am1pbHBjYWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNTgxNDgsImV4cCI6MjA2MjgzNDE0OH0.BENWCvFNIDt14bTN9bX7KOqc5K-gtJftKdmM_1QbULs';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Authentication API
export const authApi = {
  // Sign up with email - only validates, doesn't actually send verification
  signUp: async (email) => {
    try {
      console.log('Simulated signup for:', email);
      // Sign up with Supabase but with no emails
      const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({ 
          email,
          password: 'TestPassword123!', // Use a standard password for all test accounts
        })
      });
      console.log('Raw response text:', await response.clone().text()); // 👈 before parsing

      const data = await response.json();
      console.log('Parsed ride data from Supabase:', data); // 👈 after parsing

      console.log('Signup response:', data);
      return { data, error: data.error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  // Verify with hardcoded OTP (123456)
  verifyWithCode: async (email, code) => {
    try {
      // Check if code matches our hardcoded value
      if (code !== '123456') {
        return { data: null, error: { message: 'Invalid verification code' } };
      }
      
      console.log('Using test code 123456 for verification');
      
      // Sign in directly with password for development environment
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({ 
          email,
          password: 'TestPassword123!' 
        })
      });
      
      const data = await response.json();
      console.log('Sign in response:', data);
      
      if (data.error) {
        return { data: null, error: data.error };
      }
      
      // Save tokens if successful
      if (data.access_token) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        console.log('Auth tokens saved successfully');
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Verification error:', error);
      return { data: null, error };
    }
  },
  
  // Get current session
  getSession: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(USER_KEY);
      
      if (!token || !userStr) {
        console.log('No auth tokens found in storage');
        return { session: null };
      }
      
      const user = JSON.parse(userStr);
      console.log('Found session for user:', user.id);
      return { session: { user, access_token: token } };
    } catch (error) {
      console.error('Session error:', error);
      return { session: null };
    }
  },
  
  // Sign out
  signOut: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      console.log('User signed out successfully');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }
};

// Profile API
export const profileApi = {
  // Get current profile
  getProfile: async () => {
    try {
      // Get session
      const { session } = await authApi.getSession();
      
      if (!session) {
        console.log('getProfile: No authenticated session');
        return { data: null, error: 'Not authenticated' };
      }
      
      console.log('Getting profile for user:', session.user.id);
      
      // Get profile data
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${session.user.id}&select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      
      if (!response.ok) {
        console.error('Profile fetch failed:', response.status);
        return { data: null, error: `HTTP error ${response.status}` };
      }
      
      const data = await response.json();
      console.log('Profile data retrieved:', data);
      return { data: data[0] || null, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { data: null, error };
    }
  },
  getProfileById: async (userId) => {
    try {
      const { session } = await authApi.getSession();

      if (!session) {
        console.log('getProfileById: No authenticated session');
        return { data: null, error: 'Not authenticated' };
      }

      if (!userId) {
        console.log('getProfileById: No userId provided');
        return { data: null, error: 'User ID is required' };
      }

      console.log('Getting profile for userId:', userId);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (!response.ok) {
        console.error('getProfileById fetch failed:', response.status);
        return { data: null, error: `HTTP error ${response.status}` };
      }

      const data = await response.json();
      console.log('getProfileById retrieved:', data);
      return { data: data[0] || null, error: null };
    } catch (error) {
      console.error('getProfileById error:', error);
      return { data: null, error };
    }
},

// Update preferred payment method in user profile
updatePaymentMethod: async ({ userId, selectedPayment, paymentDetails }) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    // Construct payload with only the selected payment method filled
    const payload = {
      paypal_payment: selectedPayment === 'paypal' ? paymentDetails.paypal : null,
      venmo_payment: selectedPayment === 'venmo' ? paymentDetails.venmo : null,
      zelle_payment: selectedPayment === 'zelle' ? paymentDetails.zelle : null,
      updated_at: new Date().toISOString(),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update payment method:', errorText);
      return { data: null, error: errorText };
    }

    const data = await response.json();
    console.log('Payment method updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('updatePaymentMethod error:', error);
    return { data: null, error: error.message };
  }
},


  // Update profile
  updateProfile: async (profileData) => {
    try {
      const { session } = await authApi.getSession();
      
      if (!session) {
        console.log('updateProfile: No authenticated session');
        return { data: null, error: 'Not authenticated' };
      }
      
      const userId = session.user.id;
      console.log('Updating profile for user:', userId);
      
      // Check if profile exists
      const { data: existingProfile } = await profileApi.getProfile();
      
      let method = 'POST';
      let url = `${SUPABASE_URL}/rest/v1/profiles`;
      let headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      };
      
      if (existingProfile) {
        console.log('Updating existing profile');
        // Update existing profile
        method = 'PATCH';
        url = `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`;
      } else {
        console.log('Creating new profile');
      }
      
      const body = {
        ...profileData,
        user_id: userId,
        email: session.user.email,
        ...(method === 'POST' && { created_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      };
      
      
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        console.error('Profile update failed:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        return { data: null, error: `HTTP error ${response.status}: ${errorText}` };
      }
      
      const data = await response.json();
      console.log('Profile updated successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  }
};

// Rides API
export const ridesApi = {



  createRide: async (rideData) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    const body = {
        driver_id: session.user.id,
      from_city_id: rideData.fromCityId,
      to_city_id: rideData.toCityId,
      departure_date: rideData.date,
      departure_time: rideData.time,
       total_seats: parseInt(rideData.seats), 
       available_seats: rideData.availableSeats ?? rideData.seats,
      extra_miles_willing: rideData.extraMilesWilling ?? null, 
      price: parseFloat(rideData.price),
      is_active: true,
      description: `Ride from ${rideData.fromName} to ${rideData.toName}`,
      pickup_location_id: rideData.pickupLocationId ,
      dropoff_location_id: rideData.dropoffLocationId,
      created_at: new Date().toISOString(),
      medium_luggage: parseInt(rideData.luggageCapacity) || 0, // <-- Add this line
      available_luggage: parseInt(rideData.luggageCapacity) || 0, // Add this line

    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rides`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ride creation failed:', response.status, errorText);
      return { data: null, error: errorText };
    }

    const data = await response.json();
    console.log('Ride created:', data);
    return { data: data[0], error: null };
  } catch (error) {
    console.error('createRide error:', error);
    return { data: null, error };
  }
},
submitReview: async ({ rideId, bookingId, driverId, rating, comment }) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) return { data: null, error: 'Not authenticated' };

    // Step 1: Submit the review
    const response = await fetch(`${SUPABASE_URL}/rest/v1/ride_reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        ride_id: rideId,
        booking_id: bookingId,
        passenger_id: session.user.id,
        driver_id: driverId,
        rating: parseInt(rating),
        comment,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Review failed:', errorText);
      return { data: null, error: errorText };
    }

    const data = await response.json();

    // ✅ Step 2: Only if review was successful, mark booking as reviewed
    const markReviewed = await fetch(`${SUPABASE_URL}/rest/v1/ride_bookings?id=eq.${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ reviewed: true }),
    });

    if (!markReviewed.ok) {
      console.warn('Review saved, but failed to update booking as reviewed');
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('submitReview error:', error);
    return { data: null, error: error.message };
  }
},
getBookedRidesByUser: async (userId) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: [], error: 'Not authenticated' };
    }

    const response = await fetch(
  `${SUPABASE_URL}/rest/v1/ride_bookings?passenger_id=eq.${userId}&select=id,ride_id,seats_booked,created_at,reviewed,ride:ride_id(id,departure_date,departure_time,total_seats,available_seats,price,is_active,driver_id,from_city:cities!from_city_id(name),to_city:cities!to_city_id(name),profiles:driver_id(user_id,first_name,last_name,rating))`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch booked rides:', errorText);
      return { data: [], error: errorText };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('getBookedRidesByUser error:', error);
    return { data: [], error: error.message };
  }
},
bookRide: async (rideId, seats, luggage = { medium: 0 }) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    const userId = session.user.id;
    console.log('🎫 Attempting to book ride:', rideId, 'seats:', seats);

    // First, verify the ride is still active and not cancelled
    const rideCheckResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rides?id=eq.${rideId}&select=id,is_active,cancelled_at,available_seats,total_seats,available_luggage,is_booked`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!rideCheckResponse.ok) {
      const errorText = await rideCheckResponse.text();
      console.error('❌ Failed to verify ride status:', errorText);
      return { data: null, error: 'Failed to verify ride availability' };
    }

    const rideCheckData = await rideCheckResponse.json();
    if (!rideCheckData || rideCheckData.length === 0) {
      return { data: null, error: 'Ride not found' };
    }

    const ride = rideCheckData[0];
    console.log('🔍 Ride status check:', ride);
    console.log('🔍 Current is_booked value:', ride.is_booked);

    // Check if ride is already booked
    if (ride.is_booked) {
      console.error('❌ Attempt to book already booked ride:', rideId);
      return { data: null, error: 'This ride has already been booked by another passenger' };
    }

    // Check if ride is cancelled
    if (ride.cancelled_at) {
      console.error('❌ Attempt to book cancelled ride:', rideId);
      return { data: null, error: 'This ride has been cancelled by the driver' };
    }

    // Check if ride is inactive
    if (!ride.is_active) {
      console.error('❌ Attempt to book inactive ride:', rideId);
      return { data: null, error: 'This ride is no longer available' };
    }

    // Check if enough seats are available
    if (ride.available_seats < seats) {
      console.error('❌ Not enough seats available:', ride.available_seats, 'requested:', seats);
      return { data: null, error: `Only ${ride.available_seats} seats available` };
    }

    // Check if enough luggage space is available
    if (ride.available_luggage < (luggage.medium ?? 0)) {
      console.error('❌ Not enough luggage space:', ride.available_luggage, 'requested:', luggage.medium ?? 0);
      return { data: null, error: `Only ${ride.available_luggage} suitcases allowed` };
    }
    
    const generateRandomPIN = () => Math.floor(1000 + Math.random() * 9000).toString();

    const passenger_pin = generateRandomPIN();
    // Proceed with booking
    const bookingBody = {
      ride_id: rideId,
      passenger_id: userId,
      seats_booked: seats,
      medium_luggage: luggage.medium ?? 0,
      created_at: new Date().toISOString(),
      passenger_pin,
      pickup_verified: false,
    };

    console.log('Creating booking:', bookingBody);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/ride_bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(bookingBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Booking creation failed:', response.status, errorText);
      return { data: null, error: errorText };
    }

    const bookingData = await response.json();
    console.log('✅ Booking successful:', bookingData);

    // Update available seats, luggage, and mark ride as booked
    const newAvailableSeats = ride.available_seats - seats;
    const newAvailableLuggage = ride.available_luggage - (luggage.medium ?? 0);

    console.log('🪑 Updating available seats from', ride.available_seats, 'to', newAvailableSeats);
    console.log('🧳 Updating available luggage from', ride.available_luggage, 'to', newAvailableLuggage);
    console.log('🔒 About to mark ride as booked...');

    const updatePayload = { 
      available_seats: newAvailableSeats,
      available_luggage: newAvailableLuggage,
      is_booked: true
    };
    
    console.log('🔍 Update payload:', updatePayload);

    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/rides?id=eq.${rideId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation', // Add this to get the updated record back
      },
      body: JSON.stringify(updatePayload),
    });

    console.log('🔍 Update response status:', updateResponse.status);
    console.log('🔍 Update response ok:', updateResponse.ok);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Failed to update seats/luggage/booking status:', updateResponse.status, errorText);
      return { data: bookingData[0], error: 'Booking saved, but failed to update ride status.' };
    }

    // Get the updated ride data to confirm the update worked
    const updatedRideData = await updateResponse.json();
    console.log('✅ Updated ride data:', updatedRideData);

    // Verify the is_booked field was actually updated
    if (updatedRideData && updatedRideData.length > 0) {
      console.log('🔍 Final is_booked value:', updatedRideData[0].is_booked);
    }

    console.log('✅ Ride booking completed successfully and marked as booked');
    return { data: bookingData[0], error: null };
  } catch (error) {
    console.error('bookRide error:', error);
    return { data: null, error: error.message };
  }
},

getBookedRides: async () => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: [], error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // Get all bookings for the current user (basic query first)
    const response = await fetch(
  `${SUPABASE_URL}/rest/v1/ride_bookings?passenger_id=eq.${userId}&select=*,rides:ride_id(id,departure_date,departure_time,price,total_seats,available_seats,is_active,cancelled_at,from_city:cities!from_city_id(name),to_city:cities!to_city_id(name),pickup_location:city_points!pickup_location_id(id,name,address,latitude,longitude),dropoff_location:city_points!dropoff_location_id(id,name,address,latitude,longitude),profiles!driver_id(user_id,first_name,last_name,email,avatar_url,rating,car_color,license_plate))&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { data: [], error: errorText };
    }

    const data = await response.json();
    console.log('Raw booked rides data:', data);

    // Format the data and determine status, filter out hidden rides if column exists
    const formattedBookings = data
      .filter(booking => {
        // Filter out hidden rides if the column exists and is true
        if (booking.hidden_by_passenger === true) {
          return false;
        }
        // Only include bookings with valid ride data
        return booking.rides;
      })
      .map(booking => {
        // Determine status
        let status = 'upcoming';
        if (booking.is_cancelled) {
          status = 'cancelled';
        } else if (booking.rides?.cancelled_at) {
          status = 'ride_cancelled';
        } else if (!booking.rides?.is_active) {
          status = 'completed';
        }

        return {
          id: `booking-${booking.id}`,
          driver: {
            id: booking.rides?.profiles?.user_id,
            name: `${booking.rides?.profiles?.first_name || ''} ${booking.rides?.profiles?.last_name || ''}`.trim() || 'Unknown Driver',
            rating: parseFloat(booking.rides?.profiles?.rating ?? 0).toFixed(1),
            rides: 12,
            avatar: booking.rides?.profiles?.avatar_url,
            carColor: booking.rides?.profiles?.car_color || 'Unknown',
            licensePlate: booking.rides?.profiles?.license_plate || 'Unknown',
          },
          from: booking.rides?.from_city?.name || 'Unknown',
          to: booking.rides?.to_city?.name || 'Unknown', 
          date: booking.rides?.departure_date,
          time: booking.rides?.departure_time?.slice(0, 5),
          price: booking.rides?.price,
          bookedSeats: booking.seats_booked,
          status,
          rideId: booking.ride_id,
          bookingId: booking.id,
          cancelledAt: booking.cancelled_at,
          rideCancelledAt: booking.rides?.cancelled_at,
          // NEW: Add pickup/dropoff location data
          pickupLocation: booking.rides?.pickup_location || null,
          dropoffLocation: booking.rides?.dropoff_location || null,
          passenger_pin: booking.passenger_pin,
          // NEW: Add pickup verification status
          pickup_verified: booking.pickup_verified || false,
        };
      });

    console.log('Formatted booked rides:', formattedBookings);
    return { data: formattedBookings, error: null };
  } catch (error) {
    console.error('getBookedRides error:', error);
    return { data: [], error: error.message };
  }
},

// Update getPostedRides function in lib/api.js
getPostedRides: async () => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: [], error: 'Not authenticated' };
    }

    const userId = session.user.id;
    console.log('Getting posted rides for driver user ID:', userId);

const ridesResponse = await fetch(
  `${SUPABASE_URL}/rest/v1/rides?driver_id=eq.${userId}&select=\
id,\
departure_date,\
departure_time,\
available_seats,\
total_seats,\
price,\
is_active,\
cancelled_at,\
cancellation_reason,\
hidden_by_driver,\
extra_miles_willing,\
from_city:cities!from_city_id(name),\
to_city:cities!to_city_id(name),\
pickup_location:city_points!pickup_location_id(id,name,address,latitude,longitude),\
dropoff_location:city_points!dropoff_location_id(id,name,address,latitude,longitude),\
profiles!driver_id(user_id,first_name,last_name,rating,car_color,license_plate),\
ride_bookings!ride_id(id,passenger_id,seats_booked,medium_luggage)\
&order=departure_date.desc`,
  {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${session.access_token}`,
    },
  }
);

    if (!ridesResponse.ok) {
      const errorText = await ridesResponse.text();
      console.error('Failed to fetch posted rides:', errorText);
      return { data: [], error: errorText };
    }

    const rides = await ridesResponse.json();
    console.log('Posted rides found:', rides.length);

    // Filter out hidden rides if the column exists and is true
    const visibleRides = rides.filter(ride => {
      if (ride.hidden_by_driver === true) {
        return false;
      }
      return true;
    });

    // For each visible ride, get the booking details
    const ridesWithBookings = await Promise.all(
      visibleRides.map(async (ride) => {
        console.log(`Checking bookings for ride ${ride.id}...`);
        
        // Get bookings for this specific ride (including cancelled ones for history)
        const bookingsResponse = await fetch(
  `${SUPABASE_URL}/rest/v1/ride_bookings?ride_id=eq.${ride.id}&select=id,seats_booked,passenger_id,is_cancelled,cancelled_at,medium_luggage,passenger_pin,pickup_verified`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        let bookings = [];
        if (bookingsResponse.ok) {
          bookings = await bookingsResponse.json();
          console.log(`Bookings for ride ${ride.id}:`, bookings.length, 'bookings found');
        } else {
          console.error(`Failed to fetch bookings for ride ${ride.id}:`, await bookingsResponse.text());
        }

        // Get passenger details for each active booking
    const passengers = await Promise.all(
  bookings
    .filter((b) => !b.is_cancelled)
    .map(async (booking) => {
      try {
        const passengerResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${booking.passenger_id}&select=first_name,last_name,avatar_url,rating`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (passengerResponse.ok) {
          const passengerData = await passengerResponse.json();
          const passenger = passengerData[0];

          return {
             booking_id: booking.id,  
            name: `${passenger?.first_name ?? ''} ${passenger?.last_name ?? ''}`.trim() || 'Unknown Passenger',
            avatar: passenger?.avatar_url || null,
            seatsBooked: booking.seats_booked,
            rating: passenger?.rating ? parseFloat(passenger.rating).toFixed(1) : '4.8',
            carColor: booking.rides?.profiles?.car_color || 'Unknown',
            licensePlate: booking.rides?.profiles?.license_plate || 'Unknown',
            medium_luggage: booking.medium_luggage ?? 0,
            passenger_pin: booking.passenger_pin, // <-- ADD THIS LINE
          pickup_verified: booking.pickup_verified, // <-- add this

          };
        }
      } catch (err) {
        // ...existing error handling...
      }

      return {
        name: 'Unknown Passenger',
        avatar: null,
        seatsBooked: booking.seats_booked,
        rating: '4.8',
        carColor: 'Unknown',
        licensePlate: 'Unknown',
        medium_luggage: booking.medium_luggage ?? 0,
      };
    })
);

        // Calculate seats booked (only from active bookings)
        const totalSeatsBooked = bookings
          .filter(booking => !booking.is_cancelled)
          .reduce((sum, booking) => sum + booking.seats_booked, 0);

        // Determine status
        let status = 'active';
        if (ride.cancelled_at) {
          status = 'cancelled';
        } else if (!ride.is_active) {
          status = 'completed';
        }

        const rideResult = {
          ...ride,
          seatsBooked: totalSeatsBooked,
          passengers,
          status,
          // Ensure pickup/dropoff location data is included
          pickup_location: ride.pickup_location || null,
          dropoff_location: ride.dropoff_location || null,
        };

        return rideResult;
      })
    );

    return { data: ridesWithBookings, error: null };
  } catch (error) {
    console.error('getPostedRides error:', error);
    return { data: [], error: error.message };
  }
},
getActiveRides: async () => {
  try {
    const { session } = await authApi.getSession();

    if (!session) {
      console.log('getActiveRides: No authenticated session');
      return { data: [], error: 'Not authenticated' };
    }

    console.log('Fetching active rides (excluding cancelled, past, and booked rides)');

    // Enhanced query to explicitly exclude cancelled rides AND booked rides
const response = await fetch(`${SUPABASE_URL}/rest/v1/rides?select=id,total_seats,departure_date,departure_time,available_luggage,medium_luggage,available_seats,price,is_active,cancelled_at,is_booked,pickup_location_id,dropoff_location_id,extra_miles_willing,from_city:cities!from_city_id(name),to_city:cities!to_city_id(name),pickup_location:city_points!pickup_location_id(id,name,address),dropoff_location:city_points!dropoff_location_id(id,name,address),profiles!driver_id(user_id,first_name,last_name,email,rating,avatar_url)&is_active=eq.true&cancelled_at=is.null&is_booked=eq.false&available_seats=gt.0&order=departure_date.asc,departure_time.asc`, {

      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rides fetch failed:', response.status, errorText);
      return { data: [], error: `HTTP error ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    
    // Additional client-side filtering to be extra sure and add time filtering
    const now = new Date();
    const currentTime = now.getTime();
    
    const filteredData = data.filter(ride => {
      // Basic filters (already handled by query but double-checking)
      if (!ride.is_active || ride.cancelled_at !== null || ride.available_seats <= 0 || ride.is_booked) {
        if (ride.is_booked) {
          console.log(`Filtering out booked ride: ${ride.id}`);
        }
        return false;
      }
      
      // Time-based filtering
      const rideDate = new Date(ride.departure_date);
      const [hours, minutes] = ride.departure_time.split(':').map(Number);
      
      // Set the ride datetime
      const rideDateTime = new Date(rideDate);
      rideDateTime.setHours(hours, minutes, 0, 0);
      
      // Get today's date for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const rideDay = new Date(rideDate);
      rideDay.setHours(0, 0, 0, 0);
      
      // If ride is before today, exclude it
      if (rideDay.getTime() < today.getTime()) {
        console.log(`Filtering out past ride: ${ride.departure_date} ${ride.departure_time}`);
        return false;
      }
      
      // If ride is today, check if it's at least 15 minutes in the future
      if (rideDay.getTime() === today.getTime()) {
        const timeDifferenceMs = rideDateTime.getTime() - currentTime;
        const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
        
        if (timeDifferenceMinutes < 15) {
          console.log(`Filtering out ride starting too soon: ${ride.departure_date} ${ride.departure_time} (${Math.round(timeDifferenceMinutes)} minutes from now)`);
          return false;
        }
      }
      
      // If ride is in the future (tomorrow or later), include it
      return true;
    });
    
    console.log('Rides data retrieved:', filteredData.length, 'active rides');
    console.log('Filtered out:', data.length - filteredData.length, 'inactive/cancelled/past/booked rides');
    
    return { data: filteredData, error: null };
  } catch (error) {
    console.error('Get rides error:', error);
    return { data: [], error: error.message };
  }
},

// Cancel a booking (passenger canceling their booking)
cancelBooking: async (bookingId, reason = 'Cancelled by passenger') => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    console.log('Canceling booking:', bookingId);

    // First, get the booking details to know how many seats and luggage to add back
    const bookingResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/ride_bookings?id=eq.${bookingId}&select=ride_id,seats_booked,medium_luggage,is_cancelled`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error('Failed to fetch booking details:', errorText);
      return { data: null, error: errorText };
    }

    const bookingData = await bookingResponse.json();
    if (!bookingData || bookingData.length === 0) {
      return { data: null, error: 'Booking not found' };
    }

    const booking = bookingData[0];
    const { ride_id, seats_booked, medium_luggage = 0, is_cancelled } = booking;

    // Check if already cancelled
    if (is_cancelled) {
      return { data: null, error: 'Booking is already cancelled' };
    }

    // Mark booking as cancelled instead of deleting
    const updateBookingResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/ride_bookings?id=eq.${bookingId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          is_cancelled: true,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason
        }),
      }
    );

    if (!updateBookingResponse.ok) {
      const errorText = await updateBookingResponse.text();
      console.error('Failed to cancel booking:', errorText);
      return { data: null, error: errorText };
    }

    // Update available seats and luggage in the ride
    const rideResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rides?id=eq.${ride_id}&select=available_seats,available_luggage`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!rideResponse.ok) {
      console.error('Failed to fetch ride details for seat/luggage update');
      return { data: { message: 'Booking cancelled but seats/luggage may not be updated' }, error: null };
    }

    const rideData = await rideResponse.json();
    if (rideData && rideData.length > 0) {
      const currentAvailableSeats = rideData[0].available_seats;
      const currentAvailableLuggage = rideData[0].available_luggage ?? 0;
      const newAvailableSeats = currentAvailableSeats + seats_booked;
      const newAvailableLuggage = currentAvailableLuggage + (medium_luggage ?? 0);

      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/rides?id=eq.${ride_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            available_seats: newAvailableSeats,
            available_luggage: newAvailableLuggage
          }),
        }
      );

      if (!updateResponse.ok) {
        console.error('Failed to update available seats/luggage');
      }
    }

    console.log('Booking cancelled successfully');
    return { data: { message: 'Booking cancelled successfully' }, error: null };
  } catch (error) {
    console.error('cancelBooking error:', error);
    return { data: null, error: error.message };
  }
},

// Cancel a posted ride (driver canceling their ride)
cancelRide: async (rideId, reason = 'Cancelled by driver') => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    const userId = session.user.id;
    console.log('Canceling ride:', rideId, 'for user:', userId);

    // First verify the user owns this ride and it's not already cancelled
    const rideResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rides?id=eq.${rideId}&driver_id=eq.${userId}&select=id,is_active,cancelled_at`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!rideResponse.ok) {
      const errorText = await rideResponse.text();
      console.error('Failed to verify ride ownership:', errorText);
      return { data: null, error: 'Failed to verify ride ownership' };
    }

    const rideData = await rideResponse.json();
    if (!rideData || rideData.length === 0) {
      return { data: null, error: 'Ride not found or you do not have permission to cancel it' };
    }

    const ride = rideData[0];
    if (!ride.is_active || ride.cancelled_at) {
      return { data: null, error: 'Ride is already cancelled or inactive' };
    }

    // Get all active bookings for this ride first
    const getBookingsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/ride_bookings?ride_id=eq.${rideId}&is_cancelled=eq.false&select=id,passenger_id,seats_booked`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!getBookingsResponse.ok) {
      const errorText = await getBookingsResponse.text();
      console.error('Failed to fetch active bookings:', errorText);
      return { data: null, error: 'Failed to fetch bookings for cancellation' };
    }

    const bookings = await getBookingsResponse.json();
    console.log('Found', bookings.length, 'active bookings to cancel for ride', rideId);

    // Cancel each booking individually to ensure proper RLS handling
    const cancelPromises = bookings.map(async (booking) => {
      console.log('Canceling booking', booking.id, 'for passenger', booking.passenger_id);
      
      const cancelBookingResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/ride_bookings?id=eq.${booking.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            is_cancelled: true,
            cancelled_at: new Date().toISOString(),
            cancellation_reason: 'Ride cancelled by driver'
          }),
        }
      );

      if (!cancelBookingResponse.ok) {
        const errorText = await cancelBookingResponse.text();
        console.error(`Failed to cancel booking ${booking.id}:`, errorText);
        return { success: false, bookingId: booking.id, error: errorText };
      }

      console.log(`Successfully cancelled booking ${booking.id}`);
      return { success: true, bookingId: booking.id };
    });

    // Wait for all booking cancellations to complete
    const cancelResults = await Promise.all(cancelPromises);
    
    // Check if any cancellations failed
    const failedCancellations = cancelResults.filter(result => !result.success);
    if (failedCancellations.length > 0) {
      console.error('Failed to cancel some bookings:', failedCancellations);
      return { 
        data: null, 
        error: `Failed to cancel ${failedCancellations.length} out of ${bookings.length} bookings. This may be due to permission issues.` 
      };
    }

    console.log(`Successfully cancelled all ${bookings.length} bookings`);

    // Now set the ride as inactive and mark as cancelled
    const updateRideResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rides?id=eq.${rideId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          is_active: false,
          available_seats: 0,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason
        }),
      }
    );

    if (!updateRideResponse.ok) {
      const errorText = await updateRideResponse.text();
      console.error('Failed to cancel ride:', errorText);
      return { data: null, error: errorText };
    }

    console.log('Ride cancelled successfully with all bookings updated');
    return { 
      data: { 
        message: 'Ride cancelled successfully',
        cancelledBookings: bookings.length 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('cancelRide error:', error);
    return { data: null, error: error.message };
  }
},
hideBookedRide: async (bookingId) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    console.log('Hiding booked ride with booking ID:', bookingId);

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/ride_bookings?id=eq.${bookingId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          hidden_by_passenger: true
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to hide booked ride:', errorText);
      
      // If the column doesn't exist, provide a helpful error message
      if (errorText.includes('column') && errorText.includes('does not exist')) {
        return { data: null, error: 'Database not updated. Please run: ALTER TABLE ride_bookings ADD COLUMN hidden_by_passenger BOOLEAN DEFAULT FALSE;' };
      }
      
      return { data: null, error: errorText };
    }

    console.log('Successfully hid booked ride from view');
    return { data: { message: 'Ride hidden from view' }, error: null };
  } catch (error) {
    console.error('hideBookedRide error:', error);
    return { data: null, error: error.message };
  }
},

hidePostedRide: async (rideId) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      return { data: null, error: 'Not authenticated' };
    }

    const userId = session.user.id;
    console.log('Hiding posted ride:', rideId, 'for user:', userId);

    // Verify the user owns this ride
    const verifyResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/rides?id=eq.${rideId}&driver_id=eq.${userId}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    );

    if (!verifyResponse.ok) {
      return { data: null, error: 'Failed to verify ride ownership' };
    }

    const verifyData = await verifyResponse.json();
    if (!verifyData || verifyData.length === 0) {
      return { data: null, error: 'Ride not found or you do not have permission to hide it' };
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rides?id=eq.${rideId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          hidden_by_driver: true
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to hide posted ride:', errorText);
      
      // If the column doesn't exist, provide a helpful error message
      if (errorText.includes('column') && errorText.includes('does not exist')) {
        return { data: null, error: 'Database not updated. Please run: ALTER TABLE rides ADD COLUMN hidden_by_driver BOOLEAN DEFAULT FALSE;' };
      }
      
      return { data: null, error: errorText };
    }

    console.log('Successfully hid posted ride from view');
    return { data: { message: 'Ride hidden from view' }, error: null };
  } catch (error) {
    console.error('hidePostedRide error:', error);
    return { data: null, error: error.message };
  }
},
  
};

export const markPickupVerified = async (bookingId) => {
  try {
    const { session } = await authApi.getSession();
    if (!session) {
      console.log('markPickupVerified: No authenticated session');
      return { data: null, error: 'Not authenticated' };
    }

    console.log('markPickupVerified called with bookingId:', bookingId);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/ride_bookings?id=eq.${bookingId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation', // to get updated row back
      },
      body: JSON.stringify({ pickup_verified: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update pickup_verified:', errorText);
      return { data: null, error: errorText };
    }

    const data = await response.json();
    console.log('markPickupVerified update response:', data);
    return { data, error: null };
  } catch (error) {
    console.error('markPickupVerified error:', error);
    return { data: null, error };
  }
};


// Cities API
export const citiesApi = {
  // Get all cities - simplified for read-only access
  getAllCities: async () => {
    try {
      // Get session
      const { session } = await authApi.getSession();
      
      if (!session) {
        console.log('getAllCities: No authenticated session');
        return { data: [], error: 'Not authenticated' };
      }
      
      console.log('Fetching all cities');
      
      // Get cities data
      const response = await fetch(`${SUPABASE_URL}/rest/v1/cities?select=*&order=name.asc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      
      if (!response.ok) {
        console.error('Cities fetch failed:', response.status);
        return { data: [], error: `HTTP error ${response.status}` };
      }
      
      const data = await response.json();
      console.log('Cities data retrieved:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Get cities error:', error);
      // Return empty array on error
      return { data: [], error };
    }
  }
};
// Pickup/Dropoff Locations API
export const locationsApi = {
  // Get all pickup/dropoff locations by city
  getLocationsByCity: async (cityId) => {
    try {
      const { session } = await authApi.getSession();
      
      if (!session) {
        console.log('getLocationsByCity: No authenticated session');
        return { data: [], error: 'Not authenticated' };
      }
      
      console.log('Fetching locations for city:', cityId);
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/city_points?city_id=eq.${cityId}&is_active=eq.true&select=*&order=name.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );
      
      if (!response.ok) {
        console.error('Locations fetch failed:', response.status);
        return { data: [], error: `HTTP error ${response.status}` };
      }
      
      const data = await response.json();
      console.log('Locations data retrieved:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Get locations error:', error);
      return { data: [], error };
    }
  },

  // Get all active pickup/dropoff locations with city information
  getAllLocationsWithCities: async () => {
    try {
      const { session } = await authApi.getSession();
      
      if (!session) {
        console.log('getAllLocationsWithCities: No authenticated session');
        return { data: [], error: 'Not authenticated' };
      }
      
      console.log('Fetching all locations with city data');
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/city_points?is_active=eq.true&select=*,cities(id,name,state)&order=cities(name),name.asc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );
      
      if (!response.ok) {
        console.error('Locations with cities fetch failed:', response.status);
        return { data: [], error: `HTTP error ${response.status}` };
      }
      
      const data = await response.json();
      console.log('Locations with cities data retrieved:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Get locations with cities error:', error);
      return { data: [], error };
    }
  }
};



// Live Tracking API - Add these functions to the end of lib/api.js

export const trackingApi = {
  // Start a new tracking session
  startTrackingSession: async (rideId) => {
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        return { data: null, error: 'Not authenticated' };
      }

      // Generate unique session token
      const sessionToken = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set expiration to 12 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 12);

      const sessionData = {
        ride_id: rideId,
        user_id: session.user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Creating tracking session:', sessionData);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/live_tracking_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create tracking session:', errorText);
        return { data: null, error: errorText };
      }

      const data = await response.json();
      console.log('Tracking session created:', data[0]);
      return { data: data[0], error: null };
    } catch (error) {
      console.error('startTrackingSession error:', error);
      return { data: null, error: error.message };
    }
  },

  // Stop an active tracking session
  stopTrackingSession: async (sessionId) => {
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        return { data: null, error: 'Not authenticated' };
      }

      console.log('Stopping tracking session:', sessionId);

      const response = await fetch(`${SUPABASE_URL}/rest/v1/live_tracking_sessions?id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          is_active: false,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to stop tracking session:', errorText);
        return { data: null, error: errorText };
      }

      console.log('Tracking session stopped successfully');
      return { data: { message: 'Tracking session stopped' }, error: null };
    } catch (error) {
      console.error('stopTrackingSession error:', error);
      return { data: null, error: error.message };
    }
  },

  // Get tracking session by token (for public sharing)
  getTrackingSessionByToken: async (sessionToken) => {
    try {
      console.log('Getting tracking session by token:', sessionToken);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/live_tracking_sessions?session_token=eq.${sessionToken}&is_active=eq.true&select=*,rides(id,from_city:cities!from_city_id(name),to_city:cities!to_city_id(name),pickup_location:city_points!pickup_location_id(name,address),dropoff_location:city_points!dropoff_location_id(name,address))`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get tracking session:', errorText);
        return { data: null, error: errorText };
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return { data: null, error: 'Tracking session not found or expired' };
      }

      // Check if session is still valid
      const session = data[0];
      const now = new Date();
      const expiresAt = new Date(session.expires_at);
      
      if (now > expiresAt) {
        return { data: null, error: 'Tracking session has expired' };
      }

      console.log('Tracking session found:', session);
      return { data: session, error: null };
    } catch (error) {
      console.error('getTrackingSessionByToken error:', error);
      return { data: null, error: error.message };
    }
  },

  // Add location coordinate to tracking session
addLocationUpdate: async (sessionId, latitude, longitude) => {
  try {
    console.log('📤 addLocationUpdate called with:', {
      sessionId,
      latitude,
      longitude,
      latType: typeof latitude,
      lngType: typeof longitude
    });

    // Get authentication session
    const { session } = await authApi.getSession();
    console.log('🔐 Auth session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      hasAccessToken: !!session?.access_token
    });

    if (!session) {
      console.error('❌ No authenticated session');
      return { data: null, error: 'Not authenticated - please sign in again' };
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ Invalid coordinates:', { latitude, longitude, lat, lng });
      return { data: null, error: 'Invalid coordinates provided' };
    }

    // Validate session ID
    if (!sessionId) {
      console.error('❌ No session ID provided');
      return { data: null, error: 'No session ID provided' };
    }

    const coordinateData = {
      session_id: sessionId,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    console.log('📡 Sending to Supabase:', {
      url: `${SUPABASE_URL}/rest/v1/tracking_coordinates`,
      data: coordinateData
    });

    const response = await fetch(`${SUPABASE_URL}/rest/v1/tracking_coordinates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(coordinateData),
    });

    console.log('📊 Supabase response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Supabase error response:', errorText);
      return { 
        data: null, 
        error: `Database error (${response.status}): ${errorText}` 
      };
    }

    const responseData = await response.json();
    console.log('✅ Successfully saved coordinate:', responseData);
    
    return { data: responseData[0] || responseData, error: null };
    
  } catch (error) {
    console.error('💥 addLocationUpdate error:', error);
    return { 
      data: null, 
      error: `Network error: ${error.message}` 
    };
  }
},

  // Get latest coordinates for a tracking session
  getLatestCoordinates: async (sessionId, limit = 1) => {
    try {
      console.log('Getting latest coordinates for session:', sessionId);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/tracking_coordinates?session_id=eq.${sessionId}&order=timestamp.desc&limit=${limit}`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get coordinates:', errorText);
        return { data: [], error: errorText };
      }

      const data = await response.json();
      console.log('Latest coordinates retrieved:', data.length, 'points');
      return { data, error: null };
    } catch (error) {
      console.error('getLatestCoordinates error:', error);
      return { data: [], error: error.message };
    }
  },

  // Get user's active tracking sessions
  getUserActiveSession: async (rideId) => {
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        return { data: null, error: 'Not authenticated' };
      }

      console.log('Getting user active tracking session for ride:', rideId);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/live_tracking_sessions?user_id=eq.${session.user.id}&ride_id=eq.${rideId}&is_active=eq.true&select=*`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get active session:', errorText);
        return { data: null, error: errorText };
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return { data: null, error: null }; // No active session found
      }

      const activeSession = data[0];
      
      // Check if session is still valid
      const now = new Date();
      const expiresAt = new Date(activeSession.expires_at);
      
      if (now > expiresAt) {
        // Auto-deactivate expired session
        await trackingApi.stopTrackingSession(activeSession.id);
        return { data: null, error: null };
      }

      console.log('Active tracking session found:', activeSession);
      return { data: activeSession, error: null };
    } catch (error) {
      console.error('getUserActiveSession error:', error);
      return { data: null, error: error.message };
    }
  },

  // Generate shareable URL for tracking session
  generateShareableUrl: (sessionToken) => {
    return `ribit.tech/live-tracking/${sessionToken}`;
  },

  // Clean up expired sessions (utility function)
  cleanupExpiredSessions: async () => {
    try {
      const { session } = await authApi.getSession();
      if (!session) {
        return { data: null, error: 'Not authenticated' };
      }

      console.log('Cleaning up expired tracking sessions');

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/live_tracking_sessions?expires_at=lt.${new Date().toISOString()}&is_active=eq.true`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            is_active: false,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to cleanup expired sessions:', errorText);
        return { data: null, error: errorText };
      }

      console.log('Expired sessions cleaned up');
      return { data: { message: 'Cleanup completed' }, error: null };
    } catch (error) {
      console.error('cleanupExpiredSessions error:', error);
      return { data: null, error: error.message };
    }
  },
};

