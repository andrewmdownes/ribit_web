// lib/stripeWrapper.web.js - Web implementation using Stripe.js
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
        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (publishableKey) {
      initStripe();
    } else {
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

  useEffect(() => {
    if (!stripe || !cardElementRef.current || loading) return;

    const elements = stripe.elements();
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#333',
          fontFamily: 'Roboto, sans-serif',
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

    const handleChange = (event) => {
      setCardError(event.error);
      setCardComplete(event.complete);
      
      if (onCardChange) {
        onCardChange({
          complete: event.complete,
          error: event.error,
        });
      }
    };

    card.addEventListener('change', handleChange);

    return () => {
      card.removeEventListener('change', handleChange);
      card.destroy();
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
    if (loading) {
      return {
        error: { message: 'Stripe is still loading. Please wait.' },
        paymentIntent: null
      };
    }

    if (!stripe) {
      return {
        error: { message: 'Stripe not initialized' },
        paymentIntent: null
      };
    }

    setConfirmLoading(true);

    try {
      // Get the card element from Stripe Elements
      const cardElement = stripe.elements().getElement('card');
      
      if (!cardElement) {
        setConfirmLoading(false);
        return {
          error: { message: 'Card element not found' },
          paymentIntent: null
        };
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: data.paymentMethodData?.billingDetails || {},
        }
      });

      setConfirmLoading(false);

      return {
        error,
        paymentIntent
      };
    } catch (err) {
      setConfirmLoading(false);
      return {
        error: { message: err.message },
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