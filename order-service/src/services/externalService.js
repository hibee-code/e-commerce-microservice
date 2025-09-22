const axios = require('axios');

const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';

const validateCustomer = async (customerId) => {
  try {
    const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/${customerId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Customer not found');
    }
    throw new Error('Customer service unavailable');
  }
};

const validateProduct = async (productId, quantity = 1) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}/availability?quantity=${quantity}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error('Product service unavailable');
  }
};

const processPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/api/payments/process`, paymentData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Payment processing failed');
    }
    throw new Error('Payment service unavailable');
  }
};

module.exports = {
  validateCustomer,
  validateProduct,
  processPayment
};