const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, isActive } = req.query;
    let query = {};

    // Search by name or code
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      res.json(supplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private/Manager
router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const {
      name,
      code,
      contactPerson,
      address,
      businessInfo,
      paymentTerms,
      creditLimit,
      categories,
      rating,
      notes
    } = req.body;

    // Check if supplier code already exists
    const existingSupplier = await Supplier.findOne({ code });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier code already exists' });
    }

    const supplier = await Supplier.create({
      name,
      code,
      contactPerson,
      address,
      businessInfo,
      paymentTerms: paymentTerms || 'net_30',
      creditLimit: creditLimit || 0,
      categories: categories || [],
      rating: rating || 3,
      notes
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Manager
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      // Check if code is being changed and if it already exists
      if (req.body.code && req.body.code !== supplier.code) {
        const existingSupplier = await Supplier.findOne({ code: req.body.code });
        if (existingSupplier) {
          return res.status(400).json({ message: 'Supplier code already exists' });
        }
      }

      Object.assign(supplier, req.body);
      const updatedSupplier = await supplier.save();

      res.json(updatedSupplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update supplier balance
// @route   PUT /api/suppliers/:id/balance
// @access  Private/Manager
router.put('/:id/balance', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { amount, operation } = req.body;
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      await supplier.updateBalance(amount, operation);
      res.json(supplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    console.error('Update supplier balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (supplier) {
      // Check if supplier has outstanding balance
      if (supplier.currentBalance > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete supplier with outstanding balance' 
        });
      }

      await supplier.deleteOne();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get supplier statistics
// @route   GET /api/suppliers/stats/overview
// @access  Private/Manager
router.get('/stats/overview', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ isActive: true });
    
    const totalCreditLimit = await Supplier.aggregate([
      { $group: { _id: null, total: { $sum: '$creditLimit' } } }
    ]);

    const totalCurrentBalance = await Supplier.aggregate([
      { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);

    const suppliersByRating = await Supplier.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const topSuppliersByBalance = await Supplier.find({})
      .sort({ currentBalance: -1 })
      .limit(5)
      .select('name code currentBalance creditLimit');

    res.json({
      totalSuppliers,
      activeSuppliers,
      totalCreditLimit: totalCreditLimit[0]?.total || 0,
      totalCurrentBalance: totalCurrentBalance[0]?.total || 0,
      suppliersByRating,
      topSuppliersByBalance
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 