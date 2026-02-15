const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Delivery App API is running');
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const orderRoutes = require('./routes/order.routes');

// Temporary seed endpoint for production (remove after first use)
app.get('/api/seed', async (req, res) => {
  try {
    const seed = require('../prisma/seed');
    await seed();
    res.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
