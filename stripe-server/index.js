// index.js
import express from 'express';
import cors from 'cors';
import paymentRoutes from './payments.js';

const app = express();
const port = 3000; // Use port 3000

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Add a simple test route to verify server is working
app.get('/', (req, res) => {
  res.json({ message: 'Stripe server is running!', port: port });
});

// Routes
app.use('/', paymentRoutes);

// Listen on all interfaces so your phone can connect
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Stripe server running at http://0.0.0.0:${port}`);
  console.log(`💻 Local access: http://localhost:${port}`);
  console.log(`📱 Phone access: http://192.168.68.101:${port}`);
});