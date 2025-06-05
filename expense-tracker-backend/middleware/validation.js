const Joi = require('joi');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const expenseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().trim().max(500).allow(''),
  category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  date: Joi.date().max('now').required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'bank_transfer', 'digital_wallet', 'other'),
  tags: Joi.array().items(Joi.string().trim().lowercase())
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(30).required(),
  description: Joi.string().trim().max(200).allow(''),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
  icon: Joi.string().trim()
});

const budgetSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
  amount: Joi.number().positive().required(),
  period: Joi.string().valid('weekly', 'monthly', 'yearly'),
  categories: Joi.array().items(Joi.object({
    category: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    amount: Joi.number().positive().required()
  })),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  alertThreshold: Joi.number().min(0).max(100)
});

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
  expenseSchema,
  categorySchema,
  budgetSchema
};
