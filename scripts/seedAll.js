const { seedCustomers } = require('../customer-service/src/seeders/customerSeeder');
const { seedProducts } = require('../product-service/src/seeders/productSeeder');

const seedAllData = async () => {
  try {
    console.log('Starting data seeding process...');

    console.log('\n=== Seeding Customers ===');
    await seedCustomers();

    console.log('\n=== Seeding Products ===');
    await seedProducts();

    console.log('\n=== Data seeding completed successfully ===');
  } catch (error) {
    console.error('Error during data seeding:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAllData();
}