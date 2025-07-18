const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Supplier code is required'],
    unique: true,
    uppercase: true,
    maxlength: [20, 'Supplier code cannot exceed 20 characters']
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required']
    },
    position: {
      type: String,
      trim: true
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'Indonesia'
    }
  },
  businessInfo: {
    taxId: {
      type: String,
      trim: true
    },
    registrationNumber: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_60', 'net_90'],
    default: 'net_30'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  categories: [{
    type: String,
    enum: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Other']
  }],
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  lastOrderDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for available credit
supplierSchema.virtual('availableCredit').get(function() {
  return Math.max(0, this.creditLimit - this.currentBalance);
});

// Virtual for full address
supplierSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Update current balance
supplierSchema.methods.updateBalance = function(amount, operation = 'add') {
  if (operation === 'add') {
    this.currentBalance += amount;
  } else if (operation === 'subtract') {
    this.currentBalance = Math.max(0, this.currentBalance - amount);
  }
  return this.save();
};

// Check if credit limit exceeded
supplierSchema.methods.isCreditLimitExceeded = function(amount = 0) {
  return (this.currentBalance + amount) > this.creditLimit;
};

module.exports = mongoose.model('Supplier', supplierSchema); 