const Customer = require('./../model/customer');
const Joi = require('joi');
const customerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional()
  }).optional()
});

const createCustomer = async (req, res) => {
  try {
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const customerId = `CUST-${Date.now()}`;
    const customer = new Customer({
      customerId,
      ...value
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Customer with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findOne({ customerId });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({});
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { error, value } = customerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const customer = await Customer.findOneAndUpdate(
      { customerId },
      value,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findOneAndDelete({ customerId });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer
};