// lib/distances.js - Route distance mappings and pricing utilities

// Distance mapping between cities (in miles)
const CITY_DISTANCES = {
  'Gainesville-Orlando': 119,
  'Orlando-Gainesville': 119,
  'Gainesville-Tampa': 131,
  'Tampa-Gainesville': 131,
  'Gainesville-Miami': 338,
  'Miami-Gainesville': 338,
  'Orlando-Tampa': 85,
  'Tampa-Orlando': 85,
  'Orlando-Miami': 230,
  'Miami-Orlando': 230,
  'Tampa-Miami': 280,
  'Miami-Tampa': 280,
};

// Pricing constants
const MAX_RATE_PER_MILE = 0.70;

// Passenger pricing tiers (as percentage of driver's price)
const PASSENGER_PRICING_TIERS = {
  1: 0.70, // 70% for 1 seat
  2: 0.90, // 90% for 2 seats
  3: 1.00, // 100% for 3+ seats
};

/**
 * Get distance between two cities
 * @param {string} fromCity - Origin city name
 * @param {string} toCity - Destination city name
 * @returns {number} Distance in miles, or null if route not found
 */
export const getDistanceBetweenCities = (fromCity, toCity) => {
  const routeKey = `${fromCity}-${toCity}`;
  return CITY_DISTANCES[routeKey] || null;
};

/**
 * Calculate maximum price a driver can charge for a route
 * @param {string} fromCity - Origin city name
 * @param {string} toCity - Destination city name
 * @returns {number} Maximum price in dollars, or null if route not found
 */
export const calculateMaxDriverPrice = (fromCity, toCity) => {
  const distance = getDistanceBetweenCities(fromCity, toCity);
  if (!distance) return null;
  
  return Math.round((distance * MAX_RATE_PER_MILE) * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate passenger's total cost based on number of seats
 * @param {number} driverPrice - Driver's asking price
 * @param {number} seats - Number of seats booked
 * @returns {number} Total cost for passenger
 */
export const calculatePassengerCost = (driverPrice, seats) => {
  const tierKey = Math.min(seats, 3); // 3+ seats use the same tier
  const multiplier = PASSENGER_PRICING_TIERS[tierKey];
  
  return Math.round((driverPrice * multiplier) * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate per-seat cost for display purposes
 * @param {number} totalCost - Total cost for all seats
 * @param {number} seats - Number of seats
 * @returns {number} Cost per seat
 */
export const calculatePricePerSeat = (totalCost, seats) => {
  return Math.round((totalCost / seats) * 100) / 100; // Round to 2 decimal places
};

/**
 * Get pricing breakdown for passenger booking
 * @param {number} driverPrice - Driver's asking price
 * @param {number} seats - Number of seats booked
 * @returns {object} Pricing breakdown
 */
export const getPassengerPricingBreakdown = (driverPrice, seats) => {
  const totalCost = calculatePassengerCost(driverPrice, seats);
  const pricePerSeat = calculatePricePerSeat(totalCost, seats);
  const tierKey = Math.min(seats, 3);
  const discountPercentage = PASSENGER_PRICING_TIERS[tierKey];
  
  return {
    totalCost,
    pricePerSeat,
    discountPercentage,
    savings: Math.round((driverPrice - totalCost) * 100) / 100,
  };
};

/**
 * Validate driver's price against maximum allowed
 * @param {number} price - Driver's proposed price
 * @param {string} fromCity - Origin city
 * @param {string} toCity - Destination city
 * @returns {object} Validation result
 */
export const validateDriverPrice = (price, fromCity, toCity) => {
  const maxPrice = calculateMaxDriverPrice(fromCity, toCity);
  
  if (maxPrice === null) {
    return {
      isValid: false,
      error: 'Route not supported',
      maxPrice: null,
    };
  }
  
  if (price > maxPrice) {
    return {
      isValid: false,
      error: `Price cannot exceed $${maxPrice.toFixed(2)} for this route`,
      maxPrice,
    };
  }
  
  return {
    isValid: true,
    error: null,
    maxPrice,
  };
};

/**
 * Get pricing breakdown for driver (what passengers will pay)
 * @param {number} driverPrice - Driver's asking price
 * @returns {object} Breakdown of what passengers pay for different seat counts
 */
export const getDriverPricingBreakdown = (driverPrice) => {
  return {
    oneSeat: calculatePassengerCost(driverPrice, 1),
    twoSeats: calculatePassengerCost(driverPrice, 2),
    threeSeats: calculatePassengerCost(driverPrice, 3),
    onePassengerPercentage: PASSENGER_PRICING_TIERS[1],
    twoPassengerPercentage: PASSENGER_PRICING_TIERS[2],
    threePassengerPercentage: PASSENGER_PRICING_TIERS[3],
  };
};

/**
 * Get platform fee information
 * @param {number} driverPrice - Driver's asking price
 * @returns {object} Fee breakdown
 */
export const getPlatformFees = (driverPrice) => {
  // Platform takes the difference between driver price and passenger payment
  const oneSeatFee = driverPrice - calculatePassengerCost(driverPrice, 1);
  const twoSeatFee = driverPrice - calculatePassengerCost(driverPrice, 2);
  const threeSeatFee = driverPrice - calculatePassengerCost(driverPrice, 3);
  
  return {
    oneSeatFee,
    twoSeatFee,
    threeSeatFee,
    driverReceives: driverPrice, // Driver gets their full asking price
  };
};

// Export constants for use in components
export { MAX_RATE_PER_MILE, PASSENGER_PRICING_TIERS };