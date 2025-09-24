const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Order = require('../models/Order');

const mockExternalServices = require('../services/externalServices');

jest.mock('../services/externalServices');

describe('Order Service', () => {
  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27019/order_test_db';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/orders', () => {
    it('should create a successful order', async () => {
      const mockCustomer = {
        customerId: 'CUST-001',
        name: 'John Doe',
        email: 'john@test.com'
      };

      const mockProductAvailability = {
        productId: 'PROD-001',
        available: true,
        requestedQuantity: 1,
        availableStock: 10,
        price: 99.99
      };

      const mockPaymentResult = {
        paymentId: 'PAY-001',
        status: 'completed'
      };

      mockExternalServices.validateCustomer.mockResolvedValue(mockCustomer);
      mockExternalServices.validateProduct.mockResolvedValue(mockProductAvailability);
      mockExternalServices.processPayment.mockResolvedValue(mockPaymentResult);

      const orderData = {
        customerId: 'CUST-001',
        productId: 'PROD-001',
        quantity: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.customerId).toBe('CUST-001');
      expect(response.body.productId).toBe('PROD-001');
      expect(response.body.amount).toBe(99.99);
      expect(response.body.orderStatus).toBe('confirmed');
      expect(response.body.orderId).toMatch(/^ORDER-/);
    });

    it('should handle insufficient stock', async () => {
      const mockCustomer = {
        customerId: 'CUST-001',
        name: 'John Doe'
      };

      const mockProductAvailability = {
        productId: 'PROD-001',
        available: false,
        requestedQuantity: 5,
        availableStock: 2,
        price: 99.99
      };

      mockExternalServices.validateCustomer.mockResolvedValue(mockCustomer);
      mockExternalServices.validateProduct.mockResolvedValue(mockProductAvailability);

      const orderData = {
        customerId: 'CUST-001',
        productId: 'PROD-001',
        quantity: 5
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('Insufficient stock');
    });

    it('should handle payment failure', async () => {
      const mockCustomer = {
        customerId: 'CUST-001',
        name: 'John Doe'
      };

      const mockProductAvailability = {
        productId: 'PROD-001',
        available: true,
        requestedQuantity: 1,
        availableStock: 10,
        price: 99.99
      };

      mockExternalServices.validateCustomer.mockResolvedValue(mockCustomer);
      mockExternalServices.validateProduct.mockResolvedValue(mockProductAvailability);
      mockExternalServices.processPayment.mockRejectedValue(new Error('Payment failed'));

      const orderData = {
        customerId: 'CUST-001',
        productId: 'PROD-001',
        quantity: 1
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('payment failed');
      expect(response.body.orderStatus).toBe('cancelled');
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should get order by ID', async () => {
      const order = new Order({
        orderId: 'ORDER-TEST-001',
        customerId: 'CUST-001',
        productId: 'PROD-001',
        quantity: 1,
        amount: 99.99,
        orderStatus: 'confirmed'
      });
      await order.save();

      const response = await request(app)
        .get('/api/orders/ORDER-TEST-001')
        .expect(200);

      expect(response.body.orderId).toBe('ORDER-TEST-001');
      expect(response.body.orderStatus).toBe('confirmed');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/ORDER-NONEXISTENT')
        .expect(404);

      expect(response.body.error).toBe('Order not found');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('Order Service');
    });
  });
});