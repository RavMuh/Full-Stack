const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// JWT token tekshirish
exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token kerak' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Noto\'g\'ri token' });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Noto\'g\'ri token' });
  }
};

// Admin huquqini tekshirish
exports.requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Avtorizatsiya kerak' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin huquqi kerak' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server xatosi' });
  }
}; 