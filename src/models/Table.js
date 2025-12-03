const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: [true, 'Please provide a table number'],
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide table capacity'],
    min: 1
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  qrCode: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
