const express = require('express');
const {
  createCustomer,
  getCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();

router.post('/customers', createCustomer);
router.get('/customers', getAllCustomers);
router.get('/customers/:customerId', getCustomer);
router.put('/customers/:customerId', updateCustomer);
router.delete('/customers/:customerId', deleteCustomer);

module.exports = router;