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
  tableNumber: {
    type: Number,
    default: null
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
  isTakeaway: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'paid', 'cancelled'],
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
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Sync isTakeaway with orderType and populate tableNumber from table reference
orderSchema.pre('save', async function(next) {
  if (this.orderType === 'takeaway' || this.orderType === 'delivery') {
    this.isTakeaway = true;
  }
  
  // Populate tableNumber from table reference if table is provided
  if (this.table && this.isModified('table')) {
    try {
      const Table = mongoose.model('Table');
      const table = await Table.findById(this.table);
      if (table) {
        this.tableNumber = table.tableNumber;
      }
    } catch (error) {
      console.error('Error populating tableNumber:', error);
    }
  }
  
  next();
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
