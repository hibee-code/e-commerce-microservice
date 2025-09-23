const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { consumeFromQueue, closeConnection } = require('../services/rabbitmqService');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27020/payment_db';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Transaction Worker: Connected to Payment database');
  } catch (error) {
    console.error('Transaction Worker: Database connection error:', error);
    process.exit(1);
  }
};

const processTransaction = async (data) => {
  try {
    const { paymentId, customerId, orderId, productId, amount, timestamp } = data;

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const transaction = new Transaction({
      transactionId,
      paymentId,
      customerId,
      orderId,
      productId,
      amount,
      status: 'completed',
      processedAt: new Date()
    });

    await transaction.save();

    console.log(`Transaction saved: ${transactionId} for payment: ${paymentId}`);
    console.log(`Transaction details: Customer ${customerId}, Order ${orderId}, Product ${productId}, Amount $${amount}`);

  } catch (error) {
    console.error('Error processing transaction:', error);
    throw error;
  }
};

const startWorker = async () => {
  try {
    await connectDB();
    console.log('Transaction Worker: Starting to consume messages...');

    await consumeFromQueue(processTransaction);

    console.log('Transaction Worker: Ready to process transactions');

  } catch (error) {
    console.error('Transaction Worker: Failed to start:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('Transaction Worker: Shutting down gracefully...');
  await closeConnection();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Transaction Worker: Shutting down gracefully...');
  await closeConnection();
  await mongoose.connection.close();
  process.exit(0);
});

if (require.main === module) {
  startWorker();
}

module.exports = { startWorker, processTransaction };