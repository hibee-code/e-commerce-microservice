const Payment = require('../models/Payment');
const Joi = require('joi');
const { publishToQueue } = require('../services/rabbitmqService');

const paymentSchema = Joi.object({
  customerId: Joi.string().required(),
  orderId: Joi.string().required(),
  productId: Joi.string().required(),
  amount: Joi.number().positive().required()
});

const processPayment = async (req, res) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { customerId, orderId, productId, amount } = value;

    const paymentId = `PAY-${Date.now()}`;

    const payment = new Payment({
      paymentId,
      customerId,
      orderId,
      productId,
      amount,
      status: 'pending'
    });

    await payment.save();
    console.log(`Payment created: ${paymentId} for order: ${orderId}`);

    const isPaymentSuccessful = Math.random() > 0.1;

    if (isPaymentSuccessful) {
      payment.status = 'completed';
      await payment.save();

      const transactionData = {
        paymentId,
        customerId,
        orderId,
        productId,
        amount,
        timestamp: new Date().toISOString()
      };

      try {
        await publishToQueue(transactionData);
        console.log(`Transaction details published to queue for payment: ${paymentId}`);
      } catch (queueError) {
        console.error('Failed to publish to queue:', queueError);
      }

      res.json({
        paymentId,
        customerId,
        orderId,
        productId,
        amount,
        status: 'completed',
        message: 'Payment processed successfully'
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        paymentId,
        status: 'failed',
        error: 'Payment processing failed - Demo failure simulation'
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { customerId, orderId, status } = req.query;
    const filter = {};

    if (customerId) filter.customerId = customerId;
    if (orderId) filter.orderId = orderId;
    if (status) filter.status = status;

    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  processPayment,
  getPayment,
  getAllPayments
};