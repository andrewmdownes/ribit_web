// lib/directions.js - Google Directions API integration
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your Google Directions API key
const GOOGLE_DIRECTIONS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const DIRECTIONS_API_URL = process.env.EXPO_DIRECTIONS_API_URL

// Cache key format for coordinates: directions_cache_lat1_lng1_lat2_lng2
const getCacheKeyForCoordinates = (fromLat, fromLng, toLat, toLng) => 
  `directions_cache_${fromLat.toFixed(4)}_${fromLng.toFixed(4)}_${toLat.toFixed(4)}_${toLng.toFixed(4)}`;

// Cache key format for cities: directions_cache_{fromCity}_{toCity}
const getCacheKey = (fromCity, toCity) => `directions_cache_${fromCity}_${toCity}`;

/**
 * Get route directions between two coordinates
 * @param {number} fromLat - Origin latitude
 * @param {number} fromLng - Origin longitude
 * @param {number} toLat - Destination latitude
 * @param {number} toLng - Destination longitude
 * @returns {Promise<Object>} Route data with polyline coordinates
 */
export const getRouteDirectionsByCoordinates = async (fromLat, fromLng, toLat, toLng) => {
  try {
    // Check cache first
    const cacheKey = getCacheKeyForCoordinates(fromLat, fromLng, toLat, toLng);
    const cachedRoute = await getCachedRoute(cacheKey);
    
    if (cachedRoute) {
      console.log('Using cached route for coordinates:', fromLat, fromLng, '->', toLat, toLng);
      return cachedRoute;
    }

    console.log('Fetching new route for coordinates:', fromLat, fromLng, '->', toLat, toLng);

    // Make API request with coordinates
    const origin = `${fromLat},${fromLng}`;
    const destination = `${toLat},${toLng}`;
    
    const url = `${DIRECTIONS_API_URL}?origin=${origin}&destination=${destination}&key=${GOOGLE_DIRECTIONS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Directions API error: ${data.status}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Decode polyline to coordinates
    const polylineCoordinates = decodePolyline(route.overview_polyline.points);

    const routeData = {
      polylineCoordinates,
      distance: leg.distance.text,
      duration: leg.duration.text,
      startLocation: leg.start_location,
      endLocation: leg.end_location,
      bounds: {
        northeast: route.bounds.northeast,
        southwest: route.bounds.southwest,
      },
      fetched_at: new Date().toISOString(),
    };

    // Cache the result (valid for 24 hours)
    await cacheRoute(cacheKey, routeData);

    return routeData;
  } catch (error) {
    console.error('Error fetching route directions by coordinates:', error);
    throw error;
  }
};

/**
 * Get route directions between two cities (existing function)
 * @param {string} fromCity - Origin city name
 * @param {string} toCity - Destination city name
 * @returns {Promise<Object>} Route data with polyline coordinates
 */
export const getRouteDirections = async (fromCity, toCity) => {
  try {
    // Check cache first (directions don't change often)
    const cacheKey = getCacheKey(fromCity, toCity);
    const cachedRoute = await getCachedRoute(cacheKey);
    
    if (cachedRoute) {
      console.log('Using cached route for', fromCity, '->', toCity);
      return cachedRoute;
    }

    console.log('Fetching new route for', fromCity, '->', toCity);

    // Make API request
    const origin = encodeURIComponent(`${fromCity}, FL, USA`);
    const destination = encodeURIComponent(`${toCity}, FL, USA`);
    
    const url = `${DIRECTIONS_API_URL}?origin=${origin}&destination=${destination}&key=${GOOGLE_DIRECTIONS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Directions API error: ${data.status}`);
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Decode polyline to coordinates
    const polylineCoordinates = decodePolyline(route.overview_polyline.points);

    const routeData = {
      polylineCoordinates,
      distance: leg.distance.text,
      duration: leg.duration.text,
      startLocation: leg.start_location,
      endLocation: leg.end_location,
      bounds: {
        northeast: route.bounds.northeast,
        southwest: route.bounds.southwest,
      },
      fetched_at: new Date().toISOString(),
    };

    // Cache the result (valid for 24 hours)
    await cacheRoute(cacheKey, routeData);

    return routeData;
  } catch (error) {
    console.error('Error fetching route directions:', error);
    throw error;
  }
};

/**
 * Get cached route data
 * @param {string} cacheKey - Cache key
 * @returns {Promise<Object|null>} Cached route data or null
 */
const getCachedRoute = async (cacheKey) => {
  try {
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (!cachedData) return null;

    const route = JSON.parse(cachedData);
    
    // Check if cache is still valid (24 hours)
    const cacheAge = Date.now() - new Date(route.fetched_at).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (cacheAge > maxAge) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return route;
  } catch (error) {
    console.error('Error reading cached route:', error);
    return null;
  }
};

/**
 * Cache route data
 * @param {string} cacheKey - Cache key
 * @param {Object} routeData - Route data to cache
 */
const cacheRoute = async (cacheKey, routeData) => {
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(routeData));
  } catch (error) {
    console.error('Error caching route:', error);
  }
};

/**
 * Decode Google's encoded polyline format
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} Array of {latitude, longitude} coordinates
 */
const decodePolyline = (encoded) => {
  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let byte = 0;
    let shift = 0;
    let result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
};

/**
 * Calculate map region that fits the route
 * @param {Array} coordinates - Array of {latitude, longitude} coordinates
 * @param {number} padding - Padding factor (default 0.1)
 * @returns {Object} Map region object
 */
export const getRouteRegion = (coordinates, padding = 0.1) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  coordinates.forEach(coord => {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  });

  const latDelta = (maxLat - minLat) * (1 + padding);
  const lngDelta = (maxLng - minLng) * (1 + padding);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.01), // Minimum delta
    longitudeDelta: Math.max(lngDelta, 0.01), // Minimum delta
  };
};

/**
 * Clear all cached routes (useful for debugging)
 */
export const clearRouteCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('directions_cache_'));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`Cleared ${cacheKeys.length} cached routes`);
    }
  } catch (error) {
    console.error('Error clearing route cache:', error);
  }
};