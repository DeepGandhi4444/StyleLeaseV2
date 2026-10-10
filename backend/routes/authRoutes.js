const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuthLogin,
  getUserProfile,
  updateUserProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  sendOtpHandler,
  verifyOtpHandler,
  getAllUsers,
  getAdminWhitelist,
  addAdminWhitelist,
  removeAdminWhitelist,
} = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuthLogin);

// Profile & address endpoints
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.put('/address/:addressId/default', protect, setDefaultAddress);

// OTP validation endpoints
router.post('/send-otp', sendOtpHandler);
router.post('/verify-otp', optionalAuth, verifyOtpHandler);

// Admin Whitelist management endpoints
router.get('/admin-whitelist', getAdminWhitelist);
router.post('/admin-whitelist', addAdminWhitelist);
router.delete('/admin-whitelist/:email', removeAdminWhitelist);

// Admin / Users
router.get('/users', getAllUsers);

module.exports = router;
