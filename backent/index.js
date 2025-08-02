const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Firebase service
const { initializeFirebase } = require('./services/firebase.service');

// Routes
const authRoutes = require('./routes/auth.route');
const productRoutes = require('./routes/product.route');
const cartRoutes = require('./routes/cart.route');

dotenv.config();

// Initialize Firebase
initializeFirebase();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Base64 rasm uchun limit oshirish
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-store';
    
    console.log('🔗 MongoDB ga ulanish...');
    console.log('📡 URI:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('\n💡 MongoDB ishlayotganini tekshiring:');
    console.log('   1. MongoDB o\'rnatilganini tekshiring:');
    console.log('      - Windows: https://www.mongodb.com/try/download/community');
    console.log('      - Yoki MongoDB Atlas ishlating: https://www.mongodb.com/atlas');
    console.log('   2. MongoDB servisini ishga tushiring:');
    console.log('      - Windows: net start MongoDB');
    console.log('      - Yoki: mongod');
    console.log('   3. Yoki config.env faylida MongoDB Atlas URI ni ishlating');
    
    // Server ishlashini davom ettirish (MongoDB siz ham)
    console.log('\n⚠️  Server MongoDB siz ishlayapti...');
    console.log('⚠️  Ba\'zi funksiyalar ishlamasligi mumkin');
  }
};

// Connect to MongoDB
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    message: 'Server xatosi',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Online Store API is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    firebase: 'initialized',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API ishlayapti',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});