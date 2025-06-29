const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { validateBody, categorySchema } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All category routes require authentication

router.route('/')
  .get(getCategories)
  .post(validateBody(categorySchema), createCategory);

module.exports = router; 