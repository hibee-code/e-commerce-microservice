const mongoose = require('mongoose');
require('dotenv').config();

const database = require('../../shared/config/database');
const Customer = require('../src/models/Customer');
const logger = require('../../shared/utils/logger');

const seedCustomers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+234-803-123-4567',
    address: {
      street: '123 Main Street',
      city: 'Lagos',
      state: 'Lagos State',
      zipCode: '100001',
      country: 'Nigeria'
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+234-803-234-5678',
    address: {
      street: '456 Oak Avenue',
      city: 'Abuja',
      state: 'FCT',
      zipCode: '900001',
      country: 'Nigeria'
    }
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '+234-803-345-6789',
    address: {
      street: '789 Pine Road',
      city: 'Port Harcourt',
      state: 'Rivers State',
      zipCode: '500001',
      country: 'Nigeria'
    }
  }
];

async function seedDatabase() {
  try {
    await database.connect();
    
    // Clear existing customers
    await Customer.deleteMany({});
    logger.info('Cleared existing customer data');
    
    // Insert seed data
    await Customer.insertMany(seedCustomers);
    logger.info(`Seeded ${seedCustomers.length} customers`);
    
    const customers = await Customer.find({});
    logger.info('Seed customers:');
    customers.forEach(customer => {
      logger.info(`- ${customer.fullName} (${customer.email}) - ID: ${customer._id}`);
    });
    
  } catch (error) {
    logger.error('Error seeding database:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedCustomers, seedDatabase };
  