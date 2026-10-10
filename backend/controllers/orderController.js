const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public / Protected
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      totalAmount,
      customerName,
      customerEmail,
      paymentMethod,
      rentalDuration,
      rentalStartDate,
      expectedReturnDate,
      productAge,
      dailyLatePenalty,
      deliveryAddress,
      contactPhone,
      paymentStatus,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided',
      });
    }

    const durationInDays = Number(rentalDuration) || 4;
    const startDate = rentalStartDate ? new Date(rentalStartDate) : new Date();

    // Calculate expected return date if not provided
    const returnDate = expectedReturnDate
      ? new Date(expectedReturnDate)
      : new Date(startDate.getTime() + durationInDays * 24 * 60 * 60 * 1000);

    const order = new Order({
      user: req.user ? req.user._id : undefined,
      customerName:
        customerName || (req.user ? req.user.name : 'Valued Customer'),
      customerEmail:
        customerEmail || (req.user ? req.user.email : 'customer@stylelease.com'),
      orderItems: orderItems.map((item) => ({
        product: item.product,
        name: item.name,
        imgSrc: item.imgSrc,
        price: Number(item.price) || 899,
        qty: Number(item.qty) || 1,
        size: item.size || '9',
        category: item.category || 'General Footwear & Apparel',
      })),
      totalAmount:
        totalAmount !== undefined
          ? Number(totalAmount)
          : orderItems.reduce(
              (acc, item) =>
                acc + (Number(item.price) || 999) * (Number(item.qty) || 1),
              0
            ),
      paymentMethod: paymentMethod || 'Demo Online Payment (UPI / Cards)',
      paymentStatus: paymentStatus || 'Paid',
      status: 'Confirmed',
      rentalDuration: durationInDays,
      rentalStartDate: startDate,
      expectedReturnDate: returnDate,
      productAge: productAge || 'Mint Condition (Current Season)',
      dailyLatePenalty: dailyLatePenalty !== undefined ? Number(dailyLatePenalty) : 150,
      deliveryAddress: deliveryAddress || {},
      contactPhone:
        contactPhone || (deliveryAddress ? deliveryAddress.phone : ''),
    });

    const createdOrder = await order.save();
    return res.status(201).json({
      success: true,
      order: createdOrder,
      message: 'Rental booking confirmed successfully!',
    });
  } catch (error) {
    console.error('[OrderController] createOrder error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public / Protected
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Public / Protected (can check req.user or email query param)
const getMyOrders = async (req, res) => {
  try {
    let query = null;
    if (req.user) {
      query = { $or: [{ user: req.user._id }, { customerEmail: req.user.email.toLowerCase() }] };
    } else if (req.query.email) {
      query = { customerEmail: req.query.email.toLowerCase() };
    }

    if (!query) {
      return res.json({
        success: true,
        count: 0,
        orders: [],
      });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin / Public
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin / Protected
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) {
      order.status = status;
      if (status === 'Returned' && !order.actualReturnDate) {
        order.actualReturnDate = new Date();
      }
    }

    const updated = await order.save();
    return res.json({
      success: true,
      message: `Order status updated to '${updated.status}'`,
      order: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process item return and calculate penalty
// @route   PUT /api/orders/:id/return
// @access  Admin
const processOrderReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      actualReturnDate,
      returnCondition,
      damageFee,
      penaltyOverride,
      penaltyReason,
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const returnTimestamp = actualReturnDate
      ? new Date(actualReturnDate)
      : new Date();
    order.actualReturnDate = returnTimestamp;
    order.status = 'Returned';

    if (returnCondition) {
      order.returnCondition = returnCondition;
    }

    // Calculate late return days and penalty using calendar date difference
    const expected = order.expectedReturnDate
      ? new Date(order.expectedReturnDate)
      : new Date(order.createdAt.getTime() + (order.rentalDuration || 4) * 24 * 60 * 60 * 1000);

    const returnDateOnly = new Date(returnTimestamp.getFullYear(), returnTimestamp.getMonth(), returnTimestamp.getDate());
    const expectedDateOnly = new Date(expected.getFullYear(), expected.getMonth(), expected.getDate());
    const dayDiff = Math.round((returnDateOnly.getTime() - expectedDateOnly.getTime()) / (1000 * 60 * 60 * 24));
    const daysLate = Math.max(0, dayDiff);

    let latePenalty = daysLate * (order.dailyLatePenalty || 150);
    let damageCharge = Number(damageFee) || 0;

    let totalPenalty = latePenalty + damageCharge;
    let reasonParts = [];

    if (daysLate > 0) {
      reasonParts.push(`${daysLate} day(s) late (@ ₹${order.dailyLatePenalty || 150}/day) = ₹${latePenalty}`);
    }
    if (damageCharge > 0) {
      reasonParts.push(`Damage / Wear inspection charge = ₹${damageCharge}`);
    }

    if (penaltyOverride !== undefined && penaltyOverride !== null && penaltyOverride !== '') {
      totalPenalty = Number(penaltyOverride);
      order.penaltyAmount = totalPenalty;
      order.penaltyReason = penaltyReason || 'Admin manual assessment';
    } else {
      order.penaltyAmount = totalPenalty;
      const baseReason = reasonParts.length > 0 ? reasonParts.join(' | ') : 'Returned in good condition on time. Zero penalty.';
      order.penaltyReason = penaltyReason ? `${baseReason} (${penaltyReason})` : baseReason;
    }

    const updated = await order.save();

    return res.json({
      success: true,
      message: 'Return processed and penalty assessed successfully',
      daysLate,
      penaltyAmount: order.penaltyAmount,
      penaltyReason: order.penaltyReason,
      order: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate MIS Sales Growth & Rental Analytics Report
// @route   GET /api/orders/mis-report
// @access  Admin
const getMisReport = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    let totalRevenue = 0;
    let totalPenalties = 0;
    let activeRentals = 0;
    let completedReturns = 0;
    let pendingConfirmation = 0;
    let overdueRentals = 0;

    const now = new Date();
    const categoryRevenueMap = {};
    const timelineMap = {};

    orders.forEach((ord) => {
      const amount = Number(ord.totalAmount) || 0;
      const penalty = Number(ord.penaltyAmount) || 0;

      totalRevenue += amount;
      totalPenalties += penalty;

      if (ord.status === 'Returned') {
        completedReturns++;
      } else if (ord.status === 'Pending') {
        pendingConfirmation++;
      } else {
        activeRentals++;
        // Check if overdue
        if (ord.expectedReturnDate && new Date(ord.expectedReturnDate) < now) {
          overdueRentals++;
        }
      }

      // Group timeline by date (YYYY-MM-DD)
      const dateKey = new Date(ord.createdAt).toISOString().split('T')[0];
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey, revenue: 0, ordersCount: 0 };
      }
      timelineMap[dateKey].revenue += amount;
      timelineMap[dateKey].ordersCount += 1;

      // Group by item categories
      if (ord.orderItems && Array.isArray(ord.orderItems)) {
        ord.orderItems.forEach((item) => {
          let cat = item.category;
          if (!cat || cat === 'General Footwear & Apparel' || cat === 'Designer Wear') {
            const nameLower = (item.name || '').toLowerCase();
            if (nameLower.includes('sherwani') || nameLower.includes('lehenga') || nameLower.includes('brocade')) {
              cat = 'Ethnic & Wedding Wear';
            } else if (nameLower.includes('tuxedo') || nameLower.includes('suit')) {
              cat = 'Formal & Suits';
            } else if (nameLower.includes('gown') || nameLower.includes('evening')) {
              cat = 'Party & Evening Wear';
            } else if (nameLower.includes('heel') || nameLower.includes('stiletto') || nameLower.includes('veronique') || nameLower.includes('velvet edition')) {
              cat = "Women's Footwear";
            } else if (nameLower.includes('canvas') || nameLower.includes('superga')) {
              cat = 'Unisex Footwear';
            } else if (nameLower.includes('agility') || nameLower.includes('barricade')) {
              cat = "Kid's Footwear";
            } else {
              cat = "Men's Footwear";
            }
          }
          categoryRevenueMap[cat] =
            (categoryRevenueMap[cat] || 0) + (Number(item.price) || 0) * (Number(item.qty) || 1);
        });
      }
    });

    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const returnComplianceRate =
      completedReturns > 0
        ? Math.round(
            (orders.filter((o) => o.status === 'Returned' && (o.penaltyAmount || 0) === 0).length /
              completedReturns) *
              100
          )
        : 100;

    // Convert timeline to sorted array
    const salesGrowthTimeline = Object.values(timelineMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      kpis: {
        totalRevenue,
        totalOrders,
        activeRentals,
        completedReturns,
        overdueRentals,
        totalPenalties,
        averageOrderValue,
        returnComplianceRate,
      },
      categoryRevenue: categoryRevenueMap,
      salesGrowthTimeline,
    });
  } catch (error) {
    console.error('[OrderController] MIS Report error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  processOrderReturn,
  getMisReport,
};
