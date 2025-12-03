const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: false
  },
  customerName: {
    type: String,
    trim: true,
    default: 'Guest'
  },
  customerPhone: {
    type: String,
    trim: true,
    default: ''
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    default: 'dine-in'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      
      // Create start and end of today for counting
      const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);
      
      const count = await mongoose.model('Order').countDocuments({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback to timestamp-based number to ensure uniqueness
      this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
