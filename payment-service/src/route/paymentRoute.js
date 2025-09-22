const express = require('express');
const {
  processPayment,
  getPayment,
  getAllPayments
} = require('../controllers/paymentController');
const {
  getAllTransactions,
  getTransaction
} = require('../controllers/transactionController');

const router = express.Router();

router.post('/payments/process', processPayment);
router.get('/payments', getAllPayments);
router.get('/payments/:paymentId', getPayment);

router.get('/transactions', getAllTransactions);
router.get('/transactions/:transactionId', getTransaction);

module.exports = router;