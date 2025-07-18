const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get current date and last month date
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();

    // Revenue calculations
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['completed', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const thisMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: thisMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['completed', 'delivered'] },
          createdAt: { $gte: lastMonth, $lt: thisMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Order statistics
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: { $in: ['completed', 'delivered'] } });
    const totalOrderValue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Low stock count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
    });

    // Customer count (from orders)
    const uniqueCustomers = await Order.distinct('customer.email');
    const totalCustomers = uniqueCustomers.length;

    // Performance metrics
    const fulfillmentRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
    const avgOrderValue = totalOrders > 0 ? (totalOrderValue[0]?.total || 0) / totalOrders : 0;
    const satisfactionRate = 85; // Mock data - would come from customer feedback

    // Calculate trends
    const revenueTrend = lastMonthRevenue[0]?.total > 0 
      ? ((thisMonthRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100
      : 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSuppliers,
      totalRevenue: totalRevenue[0]?.total || 0,
      thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
      pendingOrders,
      completedOrders,
      lowStockCount,
      totalCustomers,
      fulfillmentRate,
      avgOrderValue,
      satisfactionRate,
      revenueTrend: Math.round(revenueTrend * 10) / 10
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get sales chart data
// @route   GET /api/orders/stats/sales-chart
// @access  Private
router.get('/orders/stats/sales-chart', protect, async (req, res) => {
  try {
    const days = 30;
    const salesData = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const dailySales = await Order.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'delivered'] },
            createdAt: { $gte: startOfDay, $lt: endOfDay }
          }
        },
        {
          $group: {
            _id: null,
            sales: { $sum: '$total' }
          }
        }
      ]);

      salesData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: dailySales[0]?.sales || 0
      });
    }

    res.json(salesData);
  } catch (error) {
    console.error('Sales chart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get category distribution
// @route   GET /api/products/stats/category-distribution
// @access  Private
router.get('/products/stats/category-distribution', protect, async (req, res) => {
  try {
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      },
      {
        $sort: { value: -1 }
      }
    ]);

    res.json(categoryDistribution);
  } catch (error) {
    console.error('Category distribution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 