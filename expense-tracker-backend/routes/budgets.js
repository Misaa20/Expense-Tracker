const express = require('express');
const { 
  getBudgets, 
  getBudget,
  createBudget, 
  updateBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { validateBody, budgetSchema } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All budget routes require authentication

router.route('/')
  .get(getBudgets)
  .post(validateBody(budgetSchema), createBudget);

router.route('/:id')
  .get(getBudget)
  .put(validateBody(budgetSchema), updateBudget)
  .delete(deleteBudget);

module.exports = router; 