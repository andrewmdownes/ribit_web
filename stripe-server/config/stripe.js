// config/stripe.js
import Stripe from 'stripe';

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = new Stripe(SECRET_KEY, {
  apiVersion: '2023-10-16', // or your preferred version
});

export default stripe;
