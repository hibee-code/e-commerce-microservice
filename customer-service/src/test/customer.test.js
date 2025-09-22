const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Customer = require('../models/Customer');

describe('Customer Service', () => {
  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_test_db';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await Customer.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      expect(response.body.name).toBe(customerData.name);
      expect(response.body.email).toBe(customerData.email);
      expect(response.body.customerId).toMatch(/^CUST-/);
    });

    it('should return error for invalid email', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(400);

      expect(response.body.error).toContain('email');
    });
  });

  describe('GET /api/customers/:customerId', () => {
    it('should get customer by ID', async () => {
      const customer = new Customer({
        customerId: 'CUST-TEST-001',
        name: 'Jane Smith',
        email: 'jane.smith@test.com',
        phone: '+1987654321'
      });
      await customer.save();

      const response = await request(app)
        .get('/api/customers/CUST-TEST-001')
        .expect(200);

      expect(response.body.customerId).toBe('CUST-TEST-001');
      expect(response.body.name).toBe('Jane Smith');
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/CUST-NONEXISTENT')
        .expect(404);

      expect(response.body.error).toBe('Customer not found');
    });
  });

  describe('GET /api/customers', () => {
    it('should get all customers', async () => {
      const customers = [
        {
          customerId: 'CUST-TEST-001',
          name: 'Customer 1',
          email: 'customer1@test.com',
          phone: '+1111111111'
        },
        {
          customerId: 'CUST-TEST-002',
          name: 'Customer 2',
          email: 'customer2@test.com',
          phone: '+2222222222'
        }
      ];

      await Customer.insertMany(customers);

      const response = await request(app)
        .get('/api/customers')
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
      expect(response.body.service).toBe('Customer Service');
    });
  });
});