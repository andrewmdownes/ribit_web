// lib/stripeWrapper.web.js - Web fallback (no Stripe imports)
import React from 'react';

export const StripeProvider = ({ children }) => children;

export const CardField = null;

export const useConfirmPayment = () => ({ 
  confirmPayment: null, 
  loading: false 
});

// Digital wallet fallbacks for future use:
// export const useApplePay = () => null;
// export const useGooglePay = () => null;