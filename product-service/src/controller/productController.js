const Product = require('../models/Product');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().min(2).max(100).required(),
  stock: Joi.number().integer().min(0).required(),
  isActive: Joi.boolean().optional()
});

const createProduct = async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const productId = `PROD-${Date.now()}`;
    const product = new Product({
      productId,
      ...value
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, active = 'true' } = req.query;
    const filter = { isActive: active === 'true' };

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { error, value } = productSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const product = await Product.findOneAndUpdate(
      { productId },
      value,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOneAndUpdate(
      { productId },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.query;

    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const available = product.stock >= parseInt(quantity);

    res.json({
      productId,
      available,
      requestedQuantity: parseInt(quantity),
      availableStock: product.stock,
      price: product.price
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  checkAvailability
};