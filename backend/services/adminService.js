const User = require('../models/User');

// In-memory admin whitelist initialized with deep@stylelease.com and tanvi@stylelease.com
const adminWhitelist = new Set([
  'deep@stylelease.com',
  'tanvi@stylelease.com',
]);

// Initialize the default admin accounts in database
const initDefaultAdmins = async () => {
  try {
    const defaultAdmins = [
      {
        email: 'deep@stylelease.com',
        name: 'Deep Gandhi (Admin)',
        password: 'password123',
        role: 'admin',
        phone: '+91 9876543210',
        isPhoneVerified: true,
      },
      {
        email: 'tanvi@stylelease.com',
        name: 'Tanvi (Admin)',
        password: 'password123',
        role: 'admin',
        phone: '+91 9876543211',
        isPhoneVerified: true,
      },
    ];

    for (const adm of defaultAdmins) {
      let existing = await User.findOne({ email: adm.email });
      if (!existing) {
        await User.create(adm);
        console.log(`[AdminService] Created default admin account: ${adm.email}`);
      } else {
        if (existing.role !== 'admin') {
          existing.role = 'admin';
          await existing.save();
        }
      }
    }
  } catch (err) {
    console.error('[AdminService] Error initializing admins:', err.message);
  }
};

// Check if an email is an authorized admin
const isEmailAdmin = (email) => {
  if (!email) return false;
  return adminWhitelist.has(email.toLowerCase().trim());
};

// Get all whitelisted admin emails
const getAdminEmails = () => {
  return Array.from(adminWhitelist);
};

// Add an email to the admin whitelist
const addAdminEmail = async (email) => {
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address');
  }
  const normalized = email.toLowerCase().trim();
  adminWhitelist.add(normalized);

  // If user already exists in DB, promote to admin role
  try {
    let existing = await User.findOne({ email: normalized });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
    } else {
      // Auto-provision user account with default password123
      await User.create({
        name: normalized.split('@')[0],
        email: normalized,
        password: 'password123',
        role: 'admin',
        phone: '',
        isPhoneVerified: true,
      });
    }
  } catch (err) {
    console.error('[AdminService] Error updating user role:', err.message);
  }

  return Array.from(adminWhitelist);
};

// Remove an email from the admin whitelist
const removeAdminEmail = async (email) => {
  const normalized = email.toLowerCase().trim();
  if (normalized === 'deep@stylelease.com' || normalized === 'tanvi@stylelease.com') {
    throw new Error('Primary root administrators (deep@stylelease.com, tanvi@stylelease.com) cannot be removed');
  }
  adminWhitelist.delete(normalized);

  try {
    let existing = await User.findOne({ email: normalized });
    if (existing) {
      existing.role = 'user';
      await existing.save();
    }
  } catch (err) {
    console.error('[AdminService] Error demoting user:', err.message);
  }

  return Array.from(adminWhitelist);
};

module.exports = {
  adminWhitelist,
  initDefaultAdmins,
  isEmailAdmin,
  getAdminEmails,
  addAdminEmail,
  removeAdminEmail,
};
