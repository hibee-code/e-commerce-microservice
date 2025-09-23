const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { connectOptimizedDB } = require('../shared/database');
const paymentRoutes = require('./routes/paymentRoutes');
const { connectRabbitMQ } = require('./services/rabbitmqService');

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Payment Service' });
});

const initializeServices = async () => {
  try {
    await connectOptimizedDB('Payment Service');
    await connectRabbitMQ();
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  initializeServices().then(() => {
    app.listen(PORT, () => {
      console.log(`Payment service running on port ${PORT}`);
    });
  });
}

module.exports = app;