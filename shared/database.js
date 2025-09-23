const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const connectDB = async (uri, dbName) => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    });
    console.log(`Connected to ${dbName} database`);
  } catch (error) {
    console.error(`Database connection error for ${dbName}:`, error);
    process.exit(1);
  }
};

const connectOptimizedDB = async (serviceName) => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
    retryWrites: true,
    w: 'majority'
  };

  try {
    await mongoose.connect(mongoUri, options);
    console.log(`${serviceName} connected to MongoDB Atlas`);

    mongoose.connection.on('disconnected', () => {
      console.log(`${serviceName} disconnected from database`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`${serviceName} database error:`, err);
    });

  } catch (error) {
    console.error(`${serviceName} database connection error:`, error);
    process.exit(1);
  }
};

module.exports = { connectDB, connectOptimizedDB };