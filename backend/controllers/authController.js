const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpService = require('../services/otpService');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'stylelease_jwt_secret_key_college_project_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register (also supports POST /users for backwards compatibility)
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists! Please try a different email.',
      });
    }

    // Role assignment: if email contains 'admin', grant admin access
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      addresses: [],
      phone: '',
      isPhoneVerified: false,
    });

    if (user) {
      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone || '',
        isPhoneVerified: user.isPhoneVerified || false,
        addresses: user.addresses || [],
        token,
        message: 'Registration successful! Welcome to StyleLease.',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    console.error('[AuthController] Register error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const adminService = require('../services/adminService');

    let user = await User.findOne({ email: normalizedEmail });

    // Auto-provision primary administrators in DB if unseeded
    if (!user && (normalizedEmail === 'deep@stylelease.com' || normalizedEmail === 'tanvi@stylelease.com')) {
      if (password === 'password123') {
        user = await User.create({
          name: normalizedEmail.startsWith('deep') ? 'Deep Gandhi (Admin)' : 'Tanvi (Admin)',
          email: normalizedEmail,
          password: 'password123',
          role: 'admin',
          phone: normalizedEmail.startsWith('deep') ? '+91 9876543210' : '+91 9876543211',
          isPhoneVerified: true,
        });
      }
    }

    if (user && (await user.matchPassword(password))) {
      // Sync admin role if in whitelist
      if (adminService.isEmailAdmin(user.email) && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin' || adminService.isEmailAdmin(user.email),
        avatar: user.avatar,
        phone: user.phone || '',
        isPhoneVerified: user.isPhoneVerified || false,
        addresses: user.addresses || [],
        token,
        message: 'Login successful!',
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }
  } catch (error) {
    console.error('[AuthController] Login error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private / Protected
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json({
        success: true,
        user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update current user profile (name, phone)
// @route   PUT /api/auth/profile
// @access  Private / Protected
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name.trim();
    if (req.body.phone !== undefined) {
      const newPhone = req.body.phone.trim();
      if (user.phone !== newPhone) {
        user.phone = newPhone;
        // Phone changed, reset verified status unless verified via OTP
        if (req.body.isPhoneVerified !== undefined) {
          user.isPhoneVerified = req.body.isPhoneVerified;
        }
      }
    }
    if (req.body.isPhoneVerified !== undefined) {
      user.isPhoneVerified = req.body.isPhoneVerified;
    }

    const updatedUser = await user.save();
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isPhoneVerified: updatedUser.isPhoneVerified,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new delivery address
// @route   POST /api/auth/address
// @access  Private / Protected
const addAddress = async (req, res) => {
  try {
    const {
      recipientName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      phone,
      tag,
      isDefault,
    } = req.body;

    if (!addressLine1 || !city || !state || !postalCode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields: address line 1, city, state, postal code, phone',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If marked as default or first address, set others as not default
    const shouldBeDefault = isDefault || user.addresses.length === 0;
    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      recipientName: recipientName || user.name,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      postalCode,
      phone,
      tag: tag || 'Home',
      isDefault: shouldBeDefault,
    };

    user.addresses.push(newAddress);

    // Also update primary phone if not set
    if (!user.phone) {
      user.phone = phone;
    }

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/auth/address/:addressId
// @access  Private / Protected
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    // If deleted address was default and addresses remain, make the first one default
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.json({
      success: true,
      message: 'Address removed successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set default address
// @route   PUT /api/auth/address/:addressId/default
// @access  Private / Protected
const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();
    return res.json({
      success: true,
      message: 'Default address updated',
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to phone or email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtpHandler = async (req, res) => {
  try {
    const { recipient, purpose } = req.body;

    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: 'Recipient phone number or email is required',
      });
    }

    const result = await otpService.sendOTP(recipient, purpose || 'verification');
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify entered OTP
// @route   POST /api/auth/verify-otp
// @access  Public / Optional Auth
const verifyOtpHandler = async (req, res) => {
  try {
    const { recipient, otp } = req.body;

    if (!recipient || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Both recipient and OTP are required',
      });
    }

    const validation = otpService.verifyOTP(recipient, otp);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    // If user is authenticated, mark their phone as verified and store verified number
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.isPhoneVerified = true;
        user.phone = recipient;
        await user.save();
      }
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully!',
      isVerified: true,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (for backwards-compatibility / admin)
// @route   GET /api/auth/users
// @access  Public / Protected
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Authenticate with Google OAuth (Dormant hook for future phase)
// @route   POST /api/auth/google
// @access  Public
const googleAuthLogin = async (req, res) => {
  try {
    const { token: googleToken, email, name, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires email address',
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        password: `GOOGLE_AUTH_${Math.random().toString(36).slice(-8)}_${Date.now()}`,
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        avatar: avatar || 'images/img_avatar.png',
        isEmailVerified: true,
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone || '',
      isPhoneVerified: user.isPhoneVerified || false,
      addresses: user.addresses || [],
      token,
      message: 'Google Sign-In successful!',
    });
  } catch (error) {
    console.error('[AuthController] Google auth error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during Google authentication',
    });
  }
};

// @desc    Get whitelisted admin emails
// @route   GET /api/auth/admin-whitelist
// @access  Public / Admin
const getAdminWhitelist = async (req, res) => {
  try {
    const adminService = require('../services/adminService');
    const emails = adminService.getAdminEmails();
    return res.json({
      success: true,
      adminEmails: emails,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add email to admin whitelist
// @route   POST /api/auth/admin-whitelist
// @access  Admin / Protected
const addAdminWhitelist = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    const adminService = require('../services/adminService');
    const updated = await adminService.addAdminEmail(email);
    return res.json({
      success: true,
      message: `Admin access granted to ${email}`,
      adminEmails: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Remove email from admin whitelist
// @route   DELETE /api/auth/admin-whitelist/:email
// @access  Admin / Protected
const removeAdminWhitelist = async (req, res) => {
  try {
    const { email } = req.params;
    const adminService = require('../services/adminService');
    const updated = await adminService.removeAdminEmail(email);
    return res.json({
      success: true,
      message: `Admin access revoked for ${email}`,
      adminEmails: updated,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
