const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter low stock items
    if (lowStock === 'true') {
      query.stockQuantity = { $lte: '$minStockLevel' };
    }

    const products = await Product.find(query)
      .populate('supplier', 'name code')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name code contactPerson');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Manager
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      category,
      price,
      cost,
      stockQuantity,
      minStockLevel,
      supplier,
      unit,
      tags
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const product = await Product.create({
      name,
      description,
      sku,
      category,
      price,
      cost,
      stockQuantity: stockQuantity || 0,
      minStockLevel: minStockLevel || 10,
      supplier,
      unit,
      tags: tags || []
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('supplier', 'name code');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Manager
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if SKU is being changed and if it already exists
      if (req.body.sku && req.body.sku !== product.sku) {
        const existingProduct = await Product.findOne({ sku: req.body.sku });
        if (existingProduct) {
          return res.status(400).json({ message: 'SKU already exists' });
        }
      }

      Object.assign(product, req.body);
      const updatedProduct = await product.save();

      const populatedProduct = await Product.findById(updatedProduct._id)
        .populate('supplier', 'name code');

      res.json(populatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Manager
router.put('/:id/stock', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.updateStock(quantity, operation);
      
      const updatedProduct = await Product.findById(product._id)
        .populate('supplier', 'name code');

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
router.get('/alerts/low-stock', protect, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
    }).populate('supplier', 'name code');

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 