const mongoose = require('mongoose');
const Customer = require('../models/Customer');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_db';

const sampleCustomers = [
  {
    customerId: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    customerId: 'CUST-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1987654321',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }
  }
];

const seedCustomers = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to Customer database');

    await Customer.deleteMany({});
    console.log('Cleared existing customers');

    await Customer.insertMany(sampleCustomers);
    console.log('Sample customers seeded successfully');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding customers:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedCustomers();
}

module.exports = { seedCustomers, sampleCustomers };