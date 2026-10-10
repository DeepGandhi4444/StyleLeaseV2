const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] Cleared previous database collections...');

    // 1. Create Users with hashed passwords
    const usersToCreate = [
      {
        name: 'Deep Gandhi (Admin)',
        email: 'deep@stylelease.com',
        password: 'password123',
        role: 'admin',
        phone: '+91 9876543210',
        isPhoneVerified: true,
        addresses: [
          {
            tag: 'Work',
            recipientName: 'Deep Gandhi',
            addressLine1: 'StyleLease HQ, 4th Floor, Tech Hub Tower',
            addressLine2: 'SG Highway',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380054',
            phone: '+91 9876543210',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Tanvi (Admin)',
        email: 'tanvi@stylelease.com',
        password: 'password123',
        role: 'admin',
        phone: '+91 9876543211',
        isPhoneVerified: true,
        addresses: [
          {
            tag: 'Work',
            recipientName: 'Tanvi',
            addressLine1: 'StyleLease Operations Center',
            addressLine2: 'Corporate Road, Prahlad Nagar',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380015',
            phone: '+91 9876543211',
            isDefault: true,
          },
        ],
      },
      {
        name: 'StyleLease Admin',
        email: 'admin@stylelease.com',
        password: 'password123',
        role: 'admin',
        phone: '+91 9876543210',
        isPhoneVerified: true,
        addresses: [],
      },
      {
        name: 'Deep Gandhi',
        email: 'deep@example.com',
        password: 'password123',
        role: 'user',
        phone: '+91 9123456789',
        isPhoneVerified: true,
        addresses: [
          {
            tag: 'Home',
            recipientName: 'Deep Gandhi',
            addressLine1: 'Apartment 402, Shivalik Residences',
            addressLine2: 'Bodakdev',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380054',
            phone: '+91 9123456789',
            isDefault: true,
          },
          {
            tag: 'Work',
            recipientName: 'Deep Gandhi (College Dept)',
            addressLine1: 'Computer Engineering Department, Block A',
            addressLine2: 'University Campus Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            postalCode: '380015',
            phone: '+91 9123456789',
            isDefault: false,
          },
        ],
      },
      {
        name: 'Rohan Sharma',
        email: 'rohan@example.com',
        password: 'password123',
        role: 'user',
        phone: '+91 9822233344',
        isPhoneVerified: true,
        addresses: [
          {
            tag: 'Home',
            recipientName: 'Rohan Sharma',
            addressLine1: 'B-12, Green Glen Layout',
            addressLine2: 'Bellandur',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560103',
            phone: '+91 9822233344',
            isDefault: true,
          },
        ],
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'password123',
        role: 'user',
        phone: '+91 9911122233',
        isPhoneVerified: false,
        addresses: [],
      },
    ];

    const createdUsers = [];
    for (const u of usersToCreate) {
      const userDoc = await User.create(u);
      createdUsers.push(userDoc);
    }
    console.log(`[Seeder] Created ${createdUsers.length} users (including admin@stylelease.com).`);

    // 2. Demo Products Catalog in INR (₹)
    const productsData = [
      {
        name: 'Nike Roshe Run Midnight',
        brandName: 'Nike',
        brandSrc: 'images/b1.jpg',
        imgSrc: 'images/p1.jpg',
        galleryImages: [
          'images/product-slide/image1_thumb.jpg',
          'images/product-slide/image2_thumb.jpg',
          'images/product-slide/image3_thumb.jpg',
        ],
        price: 899,
        category: "Men's Footwear",
        description: 'Lightweight and breathable, the Nike Roshe Run delivers minimalist styling with plush cushioning for everyday all-day wear.',
        rating: 4.8,
        reviewsCount: 34,
        sizes: ['7', '8', '9', '10', '11'],
        countInStock: 15,
        itemAge: 'Brand New (Mint Condition)',
        dailyLatePenalty: 150,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Line Link 67009 Velvet Edition',
        brandName: 'Line Link',
        brandSrc: 'images/b2.jpg',
        imgSrc: 'images/p2.jpg',
        galleryImages: [
          'images/product-slide/image2_thumb.jpg',
          'images/product-slide/image3_thumb.jpg',
          'images/product-slide/image4_thumb.jpg',
        ],
        price: 1199,
        category: "Women's Footwear",
        description: 'Contemporary athletic trainers featuring responsive sole support and premium stitched velvety textiles.',
        rating: 4.7,
        reviewsCount: 28,
        sizes: ['6', '7', '8', '9'],
        countInStock: 12,
        itemAge: 'Season 1 - Like New',
        dailyLatePenalty: 150,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'New Balance Minimus Zero',
        brandName: 'New Balance',
        brandSrc: 'images/b3.jpg',
        imgSrc: 'images/p3.jpg',
        galleryImages: [
          'images/product-slide/image3_thumb.jpg',
          'images/product-slide/image4_thumb.jpg',
          'images/product-slide/image5_thumb.jpg',
        ],
        price: 749,
        category: "Men's Footwear",
        description: 'Barefoot-inspired running shoe engineered for natural motion, zero drop flexibility and supreme road feel.',
        rating: 4.3,
        reviewsCount: 19,
        sizes: ['8', '9', '10', '11', '12'],
        countInStock: 18,
        itemAge: 'Gently Used (Grade A)',
        dailyLatePenalty: 120,
        isSpecial: true,
        isLatest: false,
      },
      {
        name: 'Puma Performance Pro Athletic',
        brandName: 'Puma',
        brandSrc: 'images/b4.jpg',
        imgSrc: 'images/p4.jpg',
        galleryImages: [
          'images/product-slide/image4_thumb.jpg',
          'images/product-slide/image5_thumb.jpg',
          'images/product-slide/image6_thumb.jpg',
        ],
        price: 949,
        category: "Men's Footwear",
        description: 'High-performance athletic footwear designed for maximum training output, shock absorption, and durability.',
        rating: 4.6,
        reviewsCount: 42,
        sizes: ['7', '8', '9', '10'],
        countInStock: 20,
        itemAge: 'Brand New (Mint Condition)',
        dailyLatePenalty: 150,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Adidas Veronique Court Classic',
        brandName: 'Adidas',
        brandSrc: 'images/b5.jpg',
        imgSrc: 'images/p5.jpg',
        galleryImages: [
          'images/product-slide/image5_thumb.jpg',
          'images/product-slide/image6_thumb.jpg',
          'images/product-slide/image7_thumb.jpg',
        ],
        price: 1399,
        category: "Women's Footwear",
        description: 'Elegant fashion sneaker blending couture aesthetics with comfortable daily cushioning.',
        rating: 4.9,
        reviewsCount: 51,
        sizes: ['6', '7', '8', '9'],
        countInStock: 14,
        itemAge: 'Brand New (Mint Condition)',
        dailyLatePenalty: 175,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Timberland Premium Suede Boots',
        brandName: 'Timberland',
        brandSrc: 'images/b6.jpg',
        imgSrc: 'images/p6.jpg',
        galleryImages: [
          'images/product-slide/image6_thumb.jpg',
          'images/product-slide/image7_thumb.jpg',
          'images/product-slide/image1_thumb.jpg',
        ],
        price: 1699,
        category: "Men's Footwear",
        description: 'Premium waterproof nubuck leather lace-up boots built for rugged outdoor durability and commanding urban style.',
        rating: 4.9,
        reviewsCount: 65,
        sizes: ['8', '9', '10', '11'],
        countInStock: 8,
        itemAge: 'Season 1 - Pristine',
        dailyLatePenalty: 200,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Reebok Barricade 6.0 Agility',
        brandName: 'Reebok',
        brandSrc: 'images/b7.jpg',
        imgSrc: 'images/p7.jpg',
        galleryImages: [
          'images/product-slide/image7_thumb.jpg',
          'images/product-slide/image1_thumb.jpg',
          'images/product-slide/image2_thumb.jpg',
        ],
        price: 849,
        category: "Kid's Footwear",
        description: 'Sturdy court stability and reinforced lateral support for high-impact agility and athletic play.',
        rating: 4.4,
        reviewsCount: 22,
        sizes: ['4', '5', '6', '7'],
        countInStock: 16,
        itemAge: 'Gently Used (Grade A)',
        dailyLatePenalty: 100,
        isSpecial: true,
        isLatest: false,
      },
      {
        name: 'Superga Cotu Classic Canvas',
        brandName: 'Superga',
        brandSrc: 'images/b8.jpg',
        imgSrc: 'images/p8.jpg',
        galleryImages: [
          'images/product-slide/image1_thumb.jpg',
          'images/product-slide/image2_thumb.jpg',
          'images/product-slide/image3_thumb.jpg',
        ],
        price: 649,
        category: "Unisex Footwear",
        description: 'Timeless canvas low-top trainer with vulcanized natural rubber sole. A true wardrobe staple.',
        rating: 4.5,
        reviewsCount: 39,
        sizes: ['6', '7', '8', '9', '10', '11'],
        countInStock: 25,
        itemAge: 'Brand New (Mint Condition)',
        dailyLatePenalty: 100,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Royal Heritage Embroidered Sherwani',
        brandName: 'Manyavar Luxe',
        brandSrc: 'images/b1.jpg',
        imgSrc: 'images/p1.jpg',
        galleryImages: ['images/p1.jpg', 'images/p2.jpg'],
        price: 3499,
        category: 'Ethnic & Wedding Wear',
        description: 'Bespoke silk brocade sherwani embellished with intricate zardozi embroidery, tailored for grooms and grand festivities.',
        rating: 4.9,
        reviewsCount: 47,
        sizes: ['38', '40', '42', '44'],
        countInStock: 6,
        itemAge: 'Dry Cleaned - Like New',
        dailyLatePenalty: 350,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Midnight Black Italian Tuxedo',
        brandName: 'Raymond Made-to-Measure',
        brandSrc: 'images/b2.jpg',
        imgSrc: 'images/p2.jpg',
        galleryImages: ['images/p2.jpg', 'images/p3.jpg'],
        price: 2799,
        category: 'Formal & Suits',
        description: 'Sharp tailored 2-piece satin shawl lapel tuxedo cut from super 130s wool blend. Includes matching trousers.',
        rating: 4.8,
        reviewsCount: 53,
        sizes: ['38', '40', '42', '44'],
        countInStock: 9,
        itemAge: 'Pristine Condition',
        dailyLatePenalty: 250,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Crimson Silk Designer Bridal Lehenga',
        brandName: 'Sabyasachi Heritage',
        brandSrc: 'images/b5.jpg',
        imgSrc: 'images/p5.jpg',
        galleryImages: ['images/p5.jpg', 'images/p6.jpg'],
        price: 4999,
        category: 'Ethnic & Wedding Wear',
        description: 'Opulent raw silk lehenga set intricately hand-embroidered with gota patti and antique sequins.',
        rating: 5.0,
        reviewsCount: 78,
        sizes: ['S', 'M', 'L'],
        countInStock: 4,
        itemAge: 'Pristine Condition',
        dailyLatePenalty: 500,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Emerald Green Velvet Evening Gown',
        brandName: 'Gauri & Nainika',
        brandSrc: 'images/b6.jpg',
        imgSrc: 'images/p6.jpg',
        galleryImages: ['images/p6.jpg', 'images/p7.jpg'],
        price: 2299,
        category: 'Party & Evening Wear',
        description: 'Sculpted floor-length stretch velvet evening gown featuring an off-shoulder corset neckline and tasteful slit.',
        rating: 4.7,
        reviewsCount: 31,
        sizes: ['XS', 'S', 'M', 'L'],
        countInStock: 8,
        itemAge: 'Season 1 - Like New',
        dailyLatePenalty: 200,
        isSpecial: true,
        isLatest: true,
      },
      {
        name: 'Oxford Brogue Handcrafted Leather Shoes',
        brandName: 'Clarks Artisan',
        brandSrc: 'images/b4.jpg',
        imgSrc: 'images/p4.jpg',
        galleryImages: ['images/p4.jpg', 'images/p3.jpg'],
        price: 1099,
        category: "Men's Footwear",
        description: 'Full-grain burnished calfskin leather wingtip brogues with Goodyear welted leather sole and memory foam footbed.',
        rating: 4.7,
        reviewsCount: 40,
        sizes: ['7', '8', '9', '10', '11'],
        countInStock: 15,
        itemAge: 'Brand New (Mint Condition)',
        dailyLatePenalty: 150,
        isSpecial: false,
        isLatest: true,
      },
      {
        name: 'Rose Gold Crystal Embellished Stilettos',
        brandName: 'Jimmy Choo Style',
        brandSrc: 'images/b5.jpg',
        imgSrc: 'images/p5.jpg',
        galleryImages: ['images/p5.jpg', 'images/p1.jpg'],
        price: 1899,
        category: "Women's Footwear",
        description: 'Dazzling metallic stiletto pumps encrusted with Swarovski-inspired crystals for galas and wedding receptions.',
        rating: 4.9,
        reviewsCount: 62,
        sizes: ['5', '6', '7', '8'],
        countInStock: 10,
        itemAge: 'Pristine Condition',
        dailyLatePenalty: 200,
        isSpecial: true,
        isLatest: true,
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`[Seeder] Seeded ${insertedProducts.length} demo products with INR pricing.`);

    // 3. Seed Realistic Rental Orders for MIS Report & Order Management Testing
    const deepUser = createdUsers[1];
    const rohanUser = createdUsers[2];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const demoOrders = [
      // Order 1: Confirmed Active Rental (Deep)
      {
        user: deepUser._id,
        customerName: deepUser.name,
        customerEmail: deepUser.email,
        contactPhone: '+91 9123456789',
        deliveryAddress: deepUser.addresses[0],
        orderItems: [
          {
            product: insertedProducts[0]._id,
            name: insertedProducts[0].name,
            imgSrc: insertedProducts[0].imgSrc,
            price: insertedProducts[0].price,
            qty: 1,
            size: '9',
            category: insertedProducts[0].category,
          },
        ],
        totalAmount: insertedProducts[0].price,
        paymentMethod: 'UPI (Google Pay)',
        paymentStatus: 'Paid',
        status: 'Confirmed',
        rentalDuration: 4,
        rentalStartDate: new Date(now - 1 * dayMs),
        expectedReturnDate: new Date(now + 3 * dayMs),
        productAge: 'Brand New (Mint Condition)',
        penaltyAmount: 0,
      },
      // Order 2: Delivered Active Rental (Deep)
      {
        user: deepUser._id,
        customerName: deepUser.name,
        customerEmail: deepUser.email,
        contactPhone: '+91 9123456789',
        deliveryAddress: deepUser.addresses[0],
        orderItems: [
          {
            product: insertedProducts[8]._id, // Royal Heritage Sherwani
            name: insertedProducts[8].name,
            imgSrc: insertedProducts[8].imgSrc,
            price: insertedProducts[8].price,
            qty: 1,
            size: '40',
            category: insertedProducts[8].category,
          },
        ],
        totalAmount: insertedProducts[8].price,
        paymentMethod: 'Credit Card (Visa)',
        paymentStatus: 'Paid',
        status: 'Delivered',
        rentalDuration: 5,
        rentalStartDate: new Date(now - 2 * dayMs),
        expectedReturnDate: new Date(now + 3 * dayMs),
        productAge: 'Dry Cleaned - Like New',
        penaltyAmount: 0,
      },
      // Order 3: Returned on time with zero penalty (Rohan)
      {
        user: rohanUser._id,
        customerName: rohanUser.name,
        customerEmail: rohanUser.email,
        contactPhone: '+91 9822233344',
        deliveryAddress: rohanUser.addresses[0],
        orderItems: [
          {
            product: insertedProducts[9]._id, // Tuxedo
            name: insertedProducts[9].name,
            imgSrc: insertedProducts[9].imgSrc,
            price: insertedProducts[9].price,
            qty: 1,
            size: '42',
            category: insertedProducts[9].category,
          },
        ],
        totalAmount: insertedProducts[9].price,
        paymentMethod: 'Net Banking (HDFC Bank)',
        paymentStatus: 'Paid',
        status: 'Returned',
        rentalDuration: 3,
        rentalStartDate: new Date(now - 10 * dayMs),
        expectedReturnDate: new Date(now - 7 * dayMs),
        actualReturnDate: new Date(now - 7 * dayMs),
        returnCondition: 'Good / Mint',
        penaltyAmount: 0,
        penaltyReason: 'Returned in good condition on time. Zero penalty.',
      },
      // Order 4: Returned late with penalty (Deep)
      {
        user: deepUser._id,
        customerName: deepUser.name,
        customerEmail: deepUser.email,
        contactPhone: '+91 9123456789',
        deliveryAddress: deepUser.addresses[0],
        orderItems: [
          {
            product: insertedProducts[5]._id, // Timberland Boots
            name: insertedProducts[5].name,
            imgSrc: insertedProducts[5].imgSrc,
            price: insertedProducts[5].price,
            qty: 1,
            size: '10',
            category: insertedProducts[5].category,
          },
        ],
        totalAmount: insertedProducts[5].price,
        paymentMethod: 'UPI (PhonePe)',
        paymentStatus: 'Paid',
        status: 'Returned',
        rentalDuration: 4,
        rentalStartDate: new Date(now - 14 * dayMs),
        expectedReturnDate: new Date(now - 10 * dayMs),
        actualReturnDate: new Date(now - 8 * dayMs), // 2 days late
        returnCondition: 'Late Return',
        dailyLatePenalty: 150,
        penaltyAmount: 300,
        penaltyReason: '2 day(s) late (@ ₹150/day) = ₹300',
      },
      // Order 5: Overdue active rental (Rohan)
      {
        user: rohanUser._id,
        customerName: rohanUser.name,
        customerEmail: rohanUser.email,
        contactPhone: '+91 9822233344',
        deliveryAddress: rohanUser.addresses[0],
        orderItems: [
          {
            product: insertedProducts[4]._id, // Veronique
            name: insertedProducts[4].name,
            imgSrc: insertedProducts[4].imgSrc,
            price: insertedProducts[4].price,
            qty: 1,
            size: '8',
            category: insertedProducts[4].category,
          },
        ],
        totalAmount: insertedProducts[4].price,
        paymentMethod: 'Debit Card',
        paymentStatus: 'Paid',
        status: 'Overdue',
        rentalDuration: 3,
        rentalStartDate: new Date(now - 5 * dayMs),
        expectedReturnDate: new Date(now - 2 * dayMs), // 2 days overdue
        dailyLatePenalty: 175,
        penaltyAmount: 350,
        penaltyReason: 'Item is currently overdue by 2 days. Calculated late fee ₹350.',
      },
    ];

    await Order.insertMany(demoOrders);
    console.log(`[Seeder] Seeded ${demoOrders.length} rental orders across various statuses.`);

    console.log('[Seeder] Database seeding finished successfully!');
    if (shouldExit) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error(`[Seeder] Error: ${error.message}`);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

const destroyData = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('[Seeder] Data destroyed successfully!');
    if (shouldExit) {
      process.exit(0);
    }
    return true;
  } catch (err) {
    console.error(err.message);
    if (shouldExit) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  if (process.argv[2] === '-d') {
    destroyData(true);
  } else {
    seedData(true);
  }
}

module.exports = { seedData, destroyData };
