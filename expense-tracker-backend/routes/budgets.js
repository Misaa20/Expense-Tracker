const express = require('express');
const { getBudgets, createBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { validateBody, budgetSchema } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All budget routes require authentication

router.route('/')
  .get(getBudgets)
  .post(validateBody(budgetSchema), createBudget);

module.exports = router; 