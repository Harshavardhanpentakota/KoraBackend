const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  cafeName: {
    type: String,
    default: 'My Café'
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
    default: 'info@cafe.com'
  },
  businessHours: {
    openingTime: {
      type: String,
      default: '08:00'
    },
    closingTime: {
      type: String,
      default: '22:00'
    }
  },
  tax: {
    gstRate: {
      type: Number,
      min: [0, 'GST rate cannot be negative'],
      max: [100, 'GST rate cannot exceed 100'],
      default: 5
    }
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  isInitialized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      isInitialized: true
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
