const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    brandName: {
      type: String,
      default: 'StyleLease Brand',
    },
    brandSrc: {
      type: String,
      default: 'images/b1.jpg',
    },
    imgSrc: {
      type: String,
      required: [true, 'Please provide primary product image'],
    },
    galleryImages: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      default: 899,
    },
    description: {
      type: String,
      default:
        'With its beautiful premium leather, lace-up oxford styling, recycled rubber outsoles and ergonomic design, this style is undeniably handsome. Crafted with high quality materials for long-lasting comfort.',
    },
    category: {
      type: String,
      default: "Men's Footwear",
    },
    sizes: {
      type: [String],
      default: ['7', '8', '9', '10', '11'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
    countInStock: {
      type: Number,
      default: 20,
    },
    isSpecial: {
      type: Boolean,
      default: true,
    },
    isLatest: {
      type: Boolean,
      default: true,
    },
    itemAge: {
      type: String,
      default: 'Brand New (Mint Condition)',
    },
    dailyLatePenalty: {
      type: Number,
      default: 150, // ₹150 / day late return penalty
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
