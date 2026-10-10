const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerName: {
      type: String,
      default: 'Guest User',
    },
    customerEmail: {
      type: String,
      default: 'guest@example.com',
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: false,
        },
        name: { type: String, required: true },
        imgSrc: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, default: 1 },
        size: { type: String, default: '9' },
        category: { type: String, default: "Men's Footwear" },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery / Rental Pay',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Delivered',
        'Active Rental',
        'Return Requested',
        'Returned',
        'Overdue',
        'Cancelled',
      ],
      default: 'Confirmed',
    },
    rentalDuration: {
      type: Number,
      default: 4, // Duration in days
    },
    rentalStartDate: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
    },
    actualReturnDate: {
      type: Date,
    },
    productAge: {
      type: String,
      default: 'Mint Condition (Current Season)',
    },
    dailyLatePenalty: {
      type: Number,
      default: 150, // ₹150 / day late penalty
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
    penaltyReason: {
      type: String,
      default: '',
    },
    returnCondition: {
      type: String,
      enum: ['Pending Inspection', 'Good / Mint', 'Minor Wear', 'Damaged', 'Late Return'],
      default: 'Pending Inspection',
    },
    deliveryAddress: {
      recipientName: { type: String, default: '' },
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    contactPhone: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
      default: 'Paid',
    },
    paymentTransactionId: {
      type: String,
      default: () => `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
