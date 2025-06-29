const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { page = 1, limit = 10, period, isActive } = req.query;

    // Build query
    const query = { user: req.user.id };

    if (period) query.period = period;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query with pagination
    const budgets = await Budget.find(query)
      .populate('categories.category', 'name color icon')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Calculate spent amounts for each budget
    const budgetsWithSpentAmount = await Promise.all(
      budgets.map(async (budget) => {
        // Calculate spent amount for this budget's period
        const spentAmount = await calculateSpentAmount(budget, req.user.id);
        
        // Convert to plain object and add calculated fields
        const budgetObj = budget.toJSON();
        budgetObj.spentAmount = spentAmount;
        budgetObj.remainingAmount = Math.max(0, budget.amount - spentAmount);
        budgetObj.progressPercentage = Math.min(100, (spentAmount / budget.amount) * 100);
        
        return budgetObj;
      })
    );

    const total = await Budget.countDocuments(query);

    res.json({
      success: true,
      budgets: budgetsWithSpentAmount,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
const getBudget = async (req, res) => {
  try {
    console.log('Get budget request received for ID:', req.params.id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid budget ID format'
      });
    }

    const budget = await Budget.findById(req.params.id)
      .populate('categories.category', 'name color icon');

    if (!budget) {
      console.log('Budget not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user.id) {
      console.log('User not authorized to access this budget');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this budget'
      });
    }

    // Calculate spent amount
    const spentAmount = await calculateSpentAmount(budget, req.user.id);
    const budgetObj = budget.toJSON();
    budgetObj.spentAmount = spentAmount;
    budgetObj.remainingAmount = Math.max(0, budget.amount - spentAmount);
    budgetObj.progressPercentage = Math.min(100, (spentAmount / budget.amount) * 100);

    res.json({
      success: true,
      budget: budgetObj
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const budgetData = {
      ...req.body,
      user: req.user.id
    };

    const budget = await Budget.create(budgetData);
    await budget.populate('categories.category', 'name color icon');

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    
    // Handle duplicate budget names
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    console.log('Update budget request received for ID:', req.params.id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid budget ID format'
      });
    }

    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      console.log('Budget not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to user
    if (budget.user.toString() !== req.user.id) {
      console.log('User not authorized to update this budget');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('categories.category', 'name color icon');

    // Calculate spent amount for updated budget
    const spentAmount = await calculateSpentAmount(budget, req.user.id);
    const budgetObj = budget.toJSON();
    budgetObj.spentAmount = spentAmount;
    budgetObj.remainingAmount = Math.max(0, budget.amount - spentAmount);
    budgetObj.progressPercentage = Math.min(100, (spentAmount / budget.amount) * 100);

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget: budgetObj
    });
  } catch (error) {
    console.error('Update budget error:', error);
    
    // Handle duplicate budget names
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    console.log('Delete budget request received for ID:', req.params.id);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid budget ID format'
      });
    }

    const budget = await Budget.findById(req.params.id);
    console.log('Found budget:', budget);

    if (!budget) {
      console.log('Budget not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if budget belongs to user
    console.log('Budget user ID:', budget.user.toString());
    console.log('Request user ID:', req.user.id);
    
    if (budget.user.toString() !== req.user.id) {
      console.log('User not authorized to delete this budget');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();
    console.log('Budget deleted successfully');

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to calculate spent amount for a budget period
const calculateSpentAmount = async (budget, userId) => {
  try {
    const query = {
      user: userId,
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate
      }
    };

    // If budget has specific categories, filter by those categories
    if (budget.categories && budget.categories.length > 0) {
      const categoryIds = budget.categories.map(cat => cat.category);
      query.category = { $in: categoryIds };
    }

    const expenses = await Expense.find(query);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  } catch (error) {
    console.error('Error calculating spent amount:', error);
    return 0;
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
}; 