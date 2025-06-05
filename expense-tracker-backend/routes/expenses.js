const express = require('express');
const { getExpenses, createExpense, getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { validateBody, expenseSchema } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All expense routes require authentication

router.route('/')
  .get(getExpenses)
  .post(validateBody(expenseSchema), createExpense);

router.get('/stats', getExpenseStats);

module.exports = router;
