const express = require('express');
const {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

router.post('/orders', createOrder);
router.get('/orders', getAllOrders);
router.get('/orders/:orderId', getOrder);
router.patch('/orders/:orderId/status', updateOrderStatus);

module.exports = router;