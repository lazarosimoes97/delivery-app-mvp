const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/auth.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', require('./src/routes/restaurant.routes'));
app.use('/api/orders', require('./src/routes/order.routes'));

app.get('/', (req, res) => {
    res.send('Delivery App API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
