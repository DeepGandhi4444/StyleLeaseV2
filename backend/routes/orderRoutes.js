const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  processOrderReturn,
  getMisReport,
} = require('../controllers/orderController');
const { optionalAuth } = require('../middleware/authMiddleware');

// Order collection routes
router.route('/').post(optionalAuth, createOrder).get(getAllOrders);

// User specific orders
router.route('/myorders').get(optionalAuth, getMyOrders);

// Admin MIS report (must precede :id param)
router.route('/mis-report').get(getMisReport);

// Single order routes
router.route('/:id').get(getOrderById);
router.route('/:id/status').put(updateOrderStatus);
router.route('/:id/return').put(processOrderReturn);

module.exports = router;
