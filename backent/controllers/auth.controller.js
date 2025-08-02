const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { isFirebaseAvailable } = require('../services/firebase.service');

// JWT token yaratish
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register
exports.register = async (req, res) => {
  try {
    console.log('📝 Register request:', { email: req.body.email, name: req.body.name });
    
    const { email, password, name } = req.body;

    // Validatsiya
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email kiritish majburiy' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Ism kiritish majburiy' });
    }

    // Email formatini tekshirish
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Noto\'g\'ri email format' });
    }

    // Email mavjudligini tekshirish
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    // Yangi foydalanuvchi yaratish
    const user = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim()
    });

    await user.save();
    console.log('✅ User created:', user._id);

    // Token yaratish
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    
    // Mongoose validation xatolari
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validatsiya xatosi',
        errors: messages 
      });
    }
    
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }
    
    res.status(500).json({ 
      message: 'Server xatosi',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login request:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validatsiya
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email kiritish majburiy' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Parol kiritish majburiy' });
    }

    // Foydalanuvchini topish
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Noto\'g\'ri email yoki parol' });
    }

    // Firebase user bo'lsa, parol bilan kirish mumkin emas
    if (user.firebaseUid) {
      return res.status(401).json({ message: 'Bu hisob Google orqali yaratilgan. Google bilan kirishdan foydalaning.' });
    }

    // Parolni tekshirish
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Noto\'g\'ri email yoki parol' });
    }

    // Token yaratish
    const token = generateToken(user._id);
    console.log('✅ Login successful:', user._id);

    res.json({
      message: 'Muvaffaqiyatli kirish',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Server xatosi',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Google Auth
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token kerak' });
    }

    // Firebase mavjudligini tekshirish
    if (!isFirebaseAvailable()) {
      return res.status(500).json({ message: 'Firebase sozlanmagan. Iltimos, Firebase Admin SDK ni o\'rnating.' });
    }

    // Firebase tokenini tekshirish
    let decodedToken;
    try {
      const admin = require('firebase-admin');
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (firebaseError) {
      console.error('Firebase token verification error:', firebaseError);
      return res.status(401).json({ message: 'Noto\'g\'ri Firebase token' });
    }

    const { uid, email, name } = decodedToken;

    // Foydalanuvchini topish yoki yaratish
    let user = await User.findOne({ 
      $or: [
        { firebaseUid: uid },
        { email: email.toLowerCase() }
      ]
    });

    if (!user) {
      // Yangi foydalanuvchi yaratish
      user = new User({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        firebaseUid: uid
        // Password yo'q chunki Firebase user
      });
      await user.save();
      console.log('✅ Google user created:', user._id);
    } else if (!user.firebaseUid) {
      // Mavjud email user ga Firebase UID qo'shish
      user.firebaseUid = uid;
      await user.save();
      console.log('✅ Firebase UID added to existing user:', user._id);
    }

    // Token yaratish
    const token = generateToken(user._id);

    res.json({
      message: 'Google orqali muvaffaqiyatli kirish',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ 
      message: 'Google autentifikatsiya xatosi',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }
    res.json({ user });
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({ 
      message: 'Server xatosi',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 