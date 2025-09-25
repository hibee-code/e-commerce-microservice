require('dotenv').config();

const CUSTOMER_SERVICE_URL = `http://localhost:${process.env.CUSTOMER_SERVICE_PORT}`;
const PRODUCT_SERVICE_URL = `http://localhost:${process.env.PRODUCT_SERVICE_PORT}`;
const PAYMENT_SERVICE_URL = `http://localhost:${process.env.PAYMENT_SERVICE_PORT}`;

module.exports = {
  CUSTOMER_SERVICE_URL,
  PRODUCT_SERVICE_URL,
  PAYMENT_SERVICE_URL
};
