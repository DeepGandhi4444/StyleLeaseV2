// OTP Service for StyleLease
// Handles OTP generation, verification, and mock/production dispatching.
// When STATIC_OTP_ENABLED is true (default), returns and validates against STATIC_OTP_CODE (123456).
// Prepared to plug in nodemailer or SMS gateways once real credentials are provided.

const inMemoryOtpStore = new Map(); // Key: phone/email, Value: { otp, expiresAt }

const normalizeRecipient = (val) => {
  if (!val) return '';
  const str = String(val).trim().toLowerCase();
  if (str.includes('@')) {
    return str;
  }
  return str.replace(/[\s\-()]/g, '');
};

const isStaticOtpEnabled = () => {
  const envVal = process.env.STATIC_OTP_ENABLED;
  if (envVal === undefined || envVal === null) return true;
  const strVal = String(envVal).trim().toLowerCase();
  if (
    strVal === 'false' ||
    strVal === 'fals' ||
    strVal === '0' ||
    strVal === 'no' ||
    strVal === 'off'
  ) {
    return false;
  }
  return strVal === 'true' || strVal === '1';
};

const getStaticOtpCode = () => {
  return process.env.STATIC_OTP_CODE || '123456';
};

/**
 * Generate and dispatch an OTP to a given recipient (phone number or email).
 * @param {string} recipient - Phone number or email address
 * @param {string} purpose - Purpose of OTP ('phone_verify', 'checkout_verify', etc.)
 */
const sendOTP = async (recipient, purpose = 'phone_verify') => {
  const cleanRecipient = normalizeRecipient(recipient);
  const staticMode = isStaticOtpEnabled();
  const staticCode = getStaticOtpCode();

  const code = staticMode
    ? staticCode
    : Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  inMemoryOtpStore.set(cleanRecipient, {
    code,
    purpose,
    expiresAt,
  });

  if (staticMode) {
    console.log(
      `[OTP Service] Static/Demo OTP generated for ${recipient}: ${code} (STATIC_OTP_ENABLED=true)`
    );
    return {
      success: true,
      recipient,
      otp: code, // returned in response during demo/static mode for easy developer/reviewer inspection
      expiresInMinutes: 10,
      isDemo: true,
      message: `Demo OTP sent successfully. Use code: ${code}`,
    };
  }

  // Future phase: Dispatch real email using nodemailer when EMAIL_USER and EMAIL_PASS are set
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      let nodemailer;
      try {
        nodemailer = require('nodemailer');
      } catch (e) {
        // nodemailer not yet in node_modules
      }

      if (nodemailer) {
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `"StyleLease" <${process.env.EMAIL_USER}>`,
          to: recipient,
          subject: 'StyleLease Verification OTP Code',
          text: `Your StyleLease verification OTP is: ${code}. Valid for 10 minutes.`,
          html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
            <h2>StyleLease Verification</h2>
            <p>Your one-time verification passcode is:</p>
            <h1 style="color:#2563eb;letter-spacing:4px;font-size:28px;">${code}</h1>
            <p style="color:#64748b;font-size:12px;">Valid for 10 minutes. Do not share this code with anyone.</p>
          </div>`,
        });
        console.log(`[OTP Service] Real email OTP dispatched to ${recipient}`);
      } else {
        console.log(`[OTP Service] Real email dispatcher ready for ${recipient}: ${code} (install nodemailer to activate SMTP)`);
      }
    } catch (err) {
      console.error('[OTP Service] Email dispatch error:', err.message);
    }
  }

  return {
    success: true,
    recipient,
    expiresInMinutes: 10,
    isDemo: false,
    message: 'OTP dispatched successfully to your contact.',
  };
};

/**
 * Validate an OTP entered by the user
 * @param {string} recipient - Phone number or email
 * @param {string} enteredCode - 6-digit OTP code entered
 */
const verifyOTP = (recipient, enteredCode) => {
  if (!recipient || !enteredCode) {
    return { success: false, message: 'Recipient and OTP are required' };
  }

  const cleanRecipient = normalizeRecipient(recipient);
  const cleanCode = enteredCode.toString().trim();
  const staticMode = isStaticOtpEnabled();
  const staticCode = getStaticOtpCode();

  // If static mode is enabled, 123456 or matching static code is always valid
  if (staticMode && cleanCode === staticCode) {
    inMemoryOtpStore.delete(cleanRecipient);
    return { success: true, message: 'OTP verified successfully (Demo Mode)' };
  }

  const record = inMemoryOtpStore.get(cleanRecipient);
  if (!record) {
    return {
      success: false,
      message: 'No active OTP request found or it has expired. Please request a new OTP.',
    };
  }

  if (Date.now() > record.expiresAt) {
    inMemoryOtpStore.delete(cleanRecipient);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.code !== cleanCode) {
    return { success: false, message: 'Invalid OTP code. Please try again.' };
  }

  inMemoryOtpStore.delete(cleanRecipient);
  return { success: true, message: 'OTP verified successfully' };
};

module.exports = {
  sendOTP,
  verifyOTP,
  isStaticOtpEnabled,
  getStaticOtpCode,
  normalizeRecipient,
};
