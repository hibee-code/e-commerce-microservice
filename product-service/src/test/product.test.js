const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Product = require('../models/Product');

describe('Product Service', () => {
  beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/product_test_db';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'This is a test product for testing purposes',
        price: 99.99,
        category: 'Electronics',
        stock: 100
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price);
      expect(response.body.productId).toMatch(/^PROD-/);
    });

    it('should return error for negative price', async () => {
      const productData = {
        name: 'Test Product',
        description: 'This is a test product',
        price: -10,
        category: 'Electronics',
        stock: 100
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(400);

      expect(response.body.error).toContain('positive');
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should get product by ID', async () => {
      const product = new Product({
        productId: 'PROD-TEST-001',
        name: 'Test Product',
        description: 'Test description',
        price: 50.00,
        category: 'Test',
        stock: 10,
        isActive: true
      });
      await product.save();

      const response = await request(app)
        .get('/api/products/PROD-TEST-001')
        .expect(200);

      expect(response.body.productId).toBe('PROD-TEST-001');
      expect(response.body.name).toBe('Test Product');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/PROD-NONEXISTENT')
        .expect(404);

      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('GET /api/products/:productId/availability', () => {
    it('should check product availability', async () => {
      const product = new Product({
        productId: 'PROD-TEST-002',
        name: 'Available Product',
        description: 'Test description',
        price: 25.00,
        category: 'Test',
        stock: 5,
        isActive: true
      });
      await product.save();

      const response = await request(app)
        .get('/api/products/PROD-TEST-002/availability?quantity=3')
        .expect(200);

      expect(response.body.available).toBe(true);
      expect(response.body.requestedQuantity).toBe(3);
      expect(response.body.availableStock).toBe(5);
    });

    it('should return false for insufficient stock', async () => {
      const product = new Product({
        productId: 'PROD-TEST-003',
        name: 'Limited Product',
        description: 'Test description',
        price: 25.00,
        category: 'Test',
        stock: 2,
        isActive: true
      });
      await product.save();

      const response = await request(app)
        .get('/api/products/PROD-TEST-003/availability?quantity=5')
        .expect(200);

      expect(response.body.available).toBe(false);
      expect(response.body.requestedQuantity).toBe(5);
      expect(response.body.availableStock).toBe(2);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('Product Service');
    });
  });
});