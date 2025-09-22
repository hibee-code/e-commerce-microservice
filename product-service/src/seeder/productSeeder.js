const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/product_db';

const sampleProducts = [
  {
    productId: 'PROD-001',
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life',
    price: 199.99,
    category: 'Electronics',
    stock: 50,
    isActive: true
  },
  {
    productId: 'PROD-002',
    name: 'Smartphone Case',
    description: 'Durable protective case for smartphones with shock absorption',
    price: 29.99,
    category: 'Accessories',
    stock: 100,
    isActive: true
  },
  {
    productId: 'PROD-003',
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RTX graphics and 16GB RAM',
    price: 1299.99,
    category: 'Electronics',
    stock: 15,
    isActive: true
  },
  {
    productId: 'PROD-004',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 49.99,
    category: 'Accessories',
    stock: 75,
    isActive: true
  },
  {
    productId: 'PROD-005',
    name: 'USB-C Hub',
    description: 'Multi-port USB-C hub with HDMI, USB 3.0, and power delivery',
    price: 79.99,
    category: 'Accessories',
    stock: 40,
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to Product database');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(sampleProducts);
    console.log('Sample products seeded successfully');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, sampleProducts };