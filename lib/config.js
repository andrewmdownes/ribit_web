// lib/config.js
import { Platform } from 'react-native';

// Configuration for different environments
const config = {
  development: {
    // For local development, you can use either:
    // 1. Local Vercel dev server: http://localhost:3000
    // 2. Local Express server: http://192.168.86.78:3000 (your current setup)
    // 3. Vercel preview URL for testing
    STRIPE_API_URL: __DEV__ 
      ? 'http://localhost:3000' // Local Vercel dev server
      : 'https://api.stripe.ribit.tech', // Your custom domain
  },
  production: {
    // Your production Vercel URL
    STRIPE_API_URL: 'https://api.stripe.ribit.tech', // Your custom domain
  }
};

// Determine current environment
const getCurrentEnvironment = () => {
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

// Get current configuration
const currentConfig = config[getCurrentEnvironment()];

// API endpoints
export const API_ENDPOINTS = {
  CREATE_PAYMENT_INTENT: `${currentConfig.STRIPE_API_URL}/api/create-payment-intent`,
  HEALTH_CHECK: `${currentConfig.STRIPE_API_URL}/api/health`,
};

// Helper function to test API connectivity
export const testAPIConnection = async () => {
  try {
    console.log('Testing API connection to:', API_ENDPOINTS.HEALTH_CHECK);
    
    const response = await fetch(API_ENDPOINTS.HEALTH_CHECK, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API connection successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('API connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Export the current configuration
export default currentConfig;