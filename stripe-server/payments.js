// payment.js
import express from 'express';
import stripe from './config/stripe.js';

const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount = 1099, currency = 'usd', email, rideId, seats } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
      metadata: {
        email: email || '',
        rideId: rideId || '',
        seats: seats?.toString() || '',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
