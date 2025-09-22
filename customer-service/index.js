const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const { connectOptimizedDB } = require('../../shared/database');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.CUSTOMER_SERVICE_PORT || process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', customerRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Customer Service' });
});

// Legacy database connection (commented for reference)
// const mongoose = require('mongoose');
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_db';
// const connectDB = async () => {
//   try {
//     await mongoose.connect(MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log('Connected to Customer database');
//   } catch (error) {
//     console.error('Database connection error:', error);
//     process.exit(1);
//   }
// };

if (require.main === module) {
  connectOptimizedDB('Customer Service').then(() => {
    app.listen(PORT, () => {
      console.log(`Customer service running on port ${PORT}`);
    });
  });
}

module.exports = app;