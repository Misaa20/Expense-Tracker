const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [50, 'Budget name cannot exceed 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount must be positive']
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  categories: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Category budget must be positive']
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  alertThreshold: {
    type: Number,
    default: 80, // Alert when 80% of budget is used
    min: [0, 'Alert threshold must be between 0 and 100'],
    max: [100, 'Alert threshold must be between 0 and 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for spent amount (to be calculated)
budgetSchema.virtual('spentAmount').get(function() {
  return this._spentAmount || 0;
});

budgetSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.amount - (this._spentAmount || 0));
});

budgetSchema.virtual('progressPercentage').get(function() {
  return Math.min(100, ((this._spentAmount || 0) / this.amount) * 100);
});

module.exports = mongoose.model('Budget', budgetSchema);
