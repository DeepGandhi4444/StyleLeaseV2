const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB and auto-seed if database is unpopulated
connectDB().then(async () => {
  try {
    const { initDefaultAdmins } = require('./services/adminService');
    await initDefaultAdmins();

    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[StyleLease] Empty catalog detected. Auto-seeding initial database demo dataset...');
      const { seedData } = require('./seeder');
      await seedData(false);
    }
  } catch (err) {
    console.warn('[StyleLease] Startup check notice:', err.message);
  }
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    service: 'StyleLease MERN API',
    database: 'Connected to MongoDB',
    timestamp: new Date().toISOString(),
  });
});

// Import route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { getAllUsers, registerUser } = require('./controllers/authController');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Backwards compatibility for legacy frontend endpoints
app.get('/users', getAllUsers);
app.post('/users', registerUser);

// Error Handling Middlewares
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `[StyleLease Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
