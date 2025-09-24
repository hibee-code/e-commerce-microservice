const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Payment = require('../models/payment');
const Transaction = require('../models/transaction');

const mockRabbitMQService = require('../services/rabbitmqService');

jest.mock('../services/rabbitmqService');

describe('Payment Service', () => {
  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27020/payment_test_db';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await Payment.deleteMany({});
    await Transaction.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/payments/process', () => {
    it('should process payment successfully', async () => {
      mockRabbitMQService.publishToQueue.mockResolvedValue();

      const paymentData = {
        customerId: 'CUST-001',
        orderId: 'ORDER-001',
        productId: 'PROD-001',
        amount: 99.99
      };

      Math.random = jest.fn(() => 0.5);

      const response = await request(app)
        .post('/api/payments/process')
        .send(paymentData)
        .expect(200);

      expect(response.body.customerId).toBe('CUST-001');
      expect(response.body.orderId).toBe('ORDER-001');
      expect(response.body.amount).toBe(99.99);
      expect(response.body.status).toBe('completed');
      expect(response.body.paymentId).toMatch(/^PAY-/);

      expect(mockRabbitMQService.publishToQueue).toHaveBeenCalledWith({
        paymentId: expect.stringMatching(/^PAY-/),
        customerId: 'CUST-001',
        orderId: 'ORDER-001',
        productId: 'PROD-001',
        amount: 99.99,
        timestamp: expect.any(String)
      });
    });

    it('should handle payment failure', async () => {
      const paymentData = {
        customerId: 'CUST-001',
        orderId: 'ORDER-001',
        productId: 'PROD-001',
        amount: 99.99
      };

      Math.random = jest.fn(() => 0.05);

      const response = await request(app)
        .post('/api/payments/process')
        .send(paymentData)
        .expect(400);

      expect(response.body.status).toBe('failed');
      expect(response.body.error).toContain('Payment processing failed');
    });

    it('should return error for invalid payment data', async () => {
      const invalidPaymentData = {
        customerId: 'CUST-001',
        amount: -10
      };

      const response = await request(app)
        .post('/api/payments/process')
        .send(invalidPaymentData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/payments/:paymentId', () => {
    it('should get payment by ID', async () => {
      const payment = new Payment({
        paymentId: 'PAY-TEST-001',
        customerId: 'CUST-001',
        orderId: 'ORDER-001',
        productId: 'PROD-001',
        amount: 99.99,
        status: 'completed'
      });
      await payment.save();

      const response = await request(app)
        .get('/api/payments/PAY-TEST-001')
        .expect(200);

      expect(response.body.paymentId).toBe('PAY-TEST-001');
      expect(response.body.status).toBe('completed');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/PAY-NONEXISTENT')
        .expect(404);

      expect(response.body.error).toBe('Payment not found');
    });
  });

  describe('GET /api/transactions', () => {
    it('should get all transactions', async () => {
      const transactions = [
        {
          transactionId: 'TXN-001',
          paymentId: 'PAY-001',
          customerId: 'CUST-001',
          orderId: 'ORDER-001',
          productId: 'PROD-001',
          amount: 99.99,
          status: 'completed'
        },
        {
          transactionId: 'TXN-002',
          paymentId: 'PAY-002',
          customerId: 'CUST-002',
          orderId: 'ORDER-002',
          productId: 'PROD-002',
          amount: 49.99,
          status: 'completed'
        }
      ];

      await Transaction.insertMany(transactions);

      const response = await request(app)
        .get('/api/transactions')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('Payment Service');
    });
  });
});