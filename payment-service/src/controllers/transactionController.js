const Transaction = require('../models/transaction');

const getAllTransactions = async (req, res) => {
  try {
    const { customerId, orderId, paymentId, status } = req.query;
    const filter = {};

    if (customerId) filter.customerId = customerId;
    if (orderId) filter.orderId = orderId;
    if (paymentId) filter.paymentId = paymentId;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findOne({ transactionId });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllTransactions,
  getTransaction
};