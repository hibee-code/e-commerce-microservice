const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { connectOptimizedDB } = require('../shared/database');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', productRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Product Service' });
});


if (require.main === module) {
  connectOptimizedDB('Product Service').then(() => {
    app.listen(PORT, () => {
      console.log(`Product service running on port ${PORT}`);
    });
  });
}

module.exports = app;