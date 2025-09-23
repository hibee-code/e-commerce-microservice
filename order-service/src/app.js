const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { connectOptimizedDB } = require('../shared/database');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Order Service' });
});


if (require.main === module) {
  connectOptimizedDB('Order Service').then(() => {
    app.listen(PORT, () => {
      console.log(`Order service running on port ${PORT}`);
    });
  });
}

module.exports = app;