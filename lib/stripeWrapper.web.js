// lib/stripeWrapper.web.js - Web implementation using Stripe.js (FIXED)
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Stripe context for web
const StripeContext = createContext(null);

// Load Stripe.js dynamically
const loadStripe = async (publishableKey) => {
  if (window.Stripe) {
    return window.Stripe(publishableKey);
  }

  // Load Stripe.js from CDN
  return new Promise((resolve, reject) => {
    if (document.getElementById('stripe-js')) {
      resolve(window.Stripe(publishableKey));
      return;
    }

    const script = document.createElement('script');
    script.id = 'stripe-js';
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      if (window.Stripe) {
        resolve(window.Stripe(publishableKey));
      } else {
        reject(new Error('Stripe.js failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Stripe.js'));
    document.head.appendChild(script);
  });
};

// StripeProvider component for web
export const StripeProvider = ({ children, publishableKey }) => {
  const [stripe, setStripe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStripe = async () => {
      try {
        console.log('🔄 Initializing Stripe with key:', publishableKey?.substring(0, 20) + '...');
        const stripeInstance = await loadStripe(publishableKey);
        console.log('✅ Stripe initialized successfully');
        setStripe(stripeInstance);
      } catch (error) {
        console.error('❌ Failed to load Stripe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (publishableKey) {
      initStripe();
    } else {
      console.error('❌ No Stripe publishable key provided');
      setLoading(false);
    }
  }, [publishableKey]);

  return (
    <StripeContext.Provider value={{ stripe, loading }}>
      {children}
    </StripeContext.Provider>
  );
};

// CardField component for web
export const CardField = ({ 
  onCardChange, 
  style, 
  cardStyle,
  placeholder = {},
  postalCodeEnabled = true,
  ...props 
}) => {
  const { stripe, loading } = useContext(StripeContext);
  const cardElementRef = useRef(null);
  const [cardElement, setCardElement] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!stripe || !cardElementRef.current || loading || mountedRef.current) return;

    console.log('🎯 Mounting Stripe card element');
    
    const elements = stripe.elements();
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#333',
          fontFamily: 'Roboto, sans-serif, -apple-system, BlinkMacSystemFont',
          fontSmoothing: 'antialiased',
          '::placeholder': {
            color: '#999',
          },
        },
        invalid: {
          color: '#ff3b30',
          iconColor: '#ff3b30'
        }
      },
      hidePostalCode: !postalCodeEnabled,
    });

    card.mount(cardElementRef.current);
    setCardElement(card);
    mountedRef.current = true;

    const handleChange = (event) => {
      console.log('💳 Card change event:', {
        complete: event.complete,
        error: event.error?.message,
        elementType: event.elementType
      });
      
      setCardError(event.error);
      setCardComplete(event.complete);
      
      if (onCardChange) {
        onCardChange({
          complete: event.complete,
          error: event.error,
        });
      }
    };

    const handleReady = () => {
      console.log('✅ Card element is ready');
    };

    const handleFocus = () => {
      console.log('🎯 Card element focused');
    };

    card.addEventListener('change', handleChange);
    card.addEventListener('ready', handleReady);
    card.addEventListener('focus', handleFocus);

    return () => {
      console.log('🧹 Cleaning up card element');
      if (card) {
        card.removeEventListener('change', handleChange);
        card.removeEventListener('ready', handleReady);
        card.removeEventListener('focus', handleFocus);
        card.destroy();
      }
      mountedRef.current = false;
    };
  }, [stripe, loading, onCardChange, postalCodeEnabled]);

  if (loading) {
    return (
      <div 
        style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e1e1e1',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '14px',
          ...style
        }}
      >
        Loading payment form...
      </div>
    );
  }

  return (
    <div 
      ref={cardElementRef}
      style={{
        padding: '12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #e1e1e1',
        minHeight: '44px',
        ...style
      }}
    />
  );
};

// useConfirmPayment hook for web
export const useConfirmPayment = () => {
  const { stripe, loading } = useContext(StripeContext);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const confirmPayment = async (clientSecret, data) => {
    console.log('🔐 Starting payment confirmation...');
    console.log('📋 Client secret:', clientSecret?.substring(0, 20) + '...');
    
    if (loading) {
      console.error('❌ Stripe is still loading');
      return {
        error: { message: 'Stripe is still loading. Please wait.' },
        paymentIntent: null
      };
    }

    if (!stripe) {
      console.error('❌ Stripe not initialized');
      return {
        error: { message: 'Stripe not initialized' },
        paymentIntent: null
      };
    }

    if (!clientSecret) {
      console.error('❌ No client secret provided');
      return {
        error: { message: 'No client secret provided' },
        paymentIntent: null
      };
    }

    setConfirmLoading(true);

    try {
      // Get the card element from Stripe Elements
      const cardElement = stripe.elements().getElement('card');
      
      if (!cardElement) {
        console.error('❌ Card element not found');
        setConfirmLoading(false);
        return {
          error: { message: 'Card element not found. Please refresh and try again.' },
          paymentIntent: null
        };
      }

      console.log('✅ Card element found, confirming payment...');
      
      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: data.paymentMethodData?.billingDetails?.email || '',
            name: data.paymentMethodData?.billingDetails?.name || '',
          },
        }
      });

      console.log('💰 Payment confirmation result:', {
        hasError: !!result.error,
        errorType: result.error?.type,
        errorMessage: result.error?.message,
        paymentIntentStatus: result.paymentIntent?.status,
        paymentIntentId: result.paymentIntent?.id
      });

      setConfirmLoading(false);

      if (result.error) {
        console.error('❌ Payment confirmation failed:', result.error);
        return {
          error: result.error,
          paymentIntent: null
        };
      }

      if (result.paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded!');
        return {
          error: null,
          paymentIntent: result.paymentIntent
        };
      } else {
        console.error('❌ Payment not successful. Status:', result.paymentIntent.status);
        return {
          error: { message: `Payment ${result.paymentIntent.status}. Please try again.` },
          paymentIntent: result.paymentIntent
        };
      }

    } catch (err) {
      console.error('💥 Unexpected error during payment confirmation:', err);
      setConfirmLoading(false);
      return {
        error: { message: `Payment failed: ${err.message}` },
        paymentIntent: null
      };
    }
  };

  return {
    confirmPayment,
    loading: confirmLoading || loading
  };
};

// Digital wallet fallbacks for future use:
export const useApplePay = () => null;
export const useGooglePay = () => null;