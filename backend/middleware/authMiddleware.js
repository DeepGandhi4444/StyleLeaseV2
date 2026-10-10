const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes: verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'stylelease_jwt_secret_key_college_project_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Optional auth: attach user if token present, but don't reject if not
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'stylelease_jwt_secret_key_college_project_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignored for optional
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
