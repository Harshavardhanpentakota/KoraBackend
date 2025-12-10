const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an item name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide a category']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15,
    comment: 'Time in minutes'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to check if item is low on stock
itemSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.threshold;
});

module.exports = mongoose.model('Item', itemSchema);
