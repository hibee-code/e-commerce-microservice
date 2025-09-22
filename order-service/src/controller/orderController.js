const Order = require('../models/Order');
const Joi = require('joi');
const { validateCustomer, validateProduct, processPayment } = require('../services/externalServices');

const orderSchema = Joi.object({
  customerId: Joi.string().required(),
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const createOrder = async (req, res) => {
  try {
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { customerId, productId, quantity } = value;

    console.log(`Processing order for customer: ${customerId}, product: ${productId}, quantity: ${quantity}`);

    let customer, productAvailability;

    try {
      [customer, productAvailability] = await Promise.all([
        validateCustomer(customerId),
        validateProduct(productId, quantity)
      ]);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    if (!productAvailability.available) {
      return res.status(400).json({
        error: `Insufficient stock. Requested: ${quantity}, Available: ${productAvailability.availableStock}`
      });
    }

    const orderId = `ORDER-${Date.now()}`;
    const amount = productAvailability.price * quantity;

    const order = new Order({
      orderId,
      customerId,
      productId,
      quantity,
      amount,
      orderStatus: 'pending'
    });

    await order.save();
    console.log(`Order created: ${orderId}`);

    const paymentData = {
      customerId,
      orderId,
      productId,
      amount
    };

    try {
      const paymentResult = await processPayment(paymentData);

      order.paymentId = paymentResult.paymentId;
      order.orderStatus = 'confirmed';
      await order.save();

      console.log(`Payment processed for order: ${orderId}`);

      const orderResponse = {
        orderId: order.orderId,
        customerId: order.customerId,
        productId: order.productId,
        quantity: order.quantity,
        amount: order.amount,
        orderStatus: order.orderStatus,
        paymentId: order.paymentId,
        createdAt: order.createdAt
      };

      res.status(201).json(orderResponse);
    } catch (paymentError) {
      order.orderStatus = 'cancelled';
      await order.save();

      console.error(`Payment failed for order: ${orderId}`, paymentError.message);

      return res.status(400).json({
        error: `Order created but payment failed: ${paymentError.message}`,
        orderId,
        orderStatus: 'cancelled'
      });
    }

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { customerId, status } = req.query;
    const filter = {};

    if (customerId) {
      filter.customerId = customerId;
    }

    if (status) {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'paid', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus
};