const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock level cannot be negative']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pcs', 'kg', 'liter', 'box', 'pair', 'set']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.cost > 0) {
    return ((this.price - this.cost) / this.cost * 100).toFixed(2);
  }
  return 0;
});

// Virtual for total value
productSchema.virtual('totalValue').get(function() {
  return this.price * this.stockQuantity;
});

// Check if stock is low
productSchema.methods.isLowStock = function() {
  return this.stockQuantity <= this.minStockLevel;
};

// Update stock quantity
productSchema.methods.updateStock = function(quantity, operation = 'add') {
  if (operation === 'add') {
    this.stockQuantity += quantity;
  } else if (operation === 'subtract') {
    if (this.stockQuantity >= quantity) {
      this.stockQuantity -= quantity;
    } else {
      throw new Error('Insufficient stock');
    }
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema); 