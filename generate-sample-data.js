const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Order = require('./models/Order');
require('dotenv').config({ path: './config.env' });

const generateSampleData = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if data already exists
    const existingData = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Supplier.countDocuments(),
      Order.countDocuments()
    ]);

    if (existingData.some(count => count > 0)) {
      console.log('⚠️  Sample data already exists. Skipping generation.');
      console.log(`   Users: ${existingData[0]}`);
      console.log(`   Products: ${existingData[1]}`);
      console.log(`   Suppliers: ${existingData[2]}`);
      console.log(`   Orders: ${existingData[3]}`);
      process.exit(0);
    }

    console.log('🚀 Generating sample data...');

    // Generate Suppliers
    const suppliers = [
      {
        name: 'TechCorp Solutions',
        code: 'TECH001',
        contactPerson: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0101',
        address: '123 Tech Street, Silicon Valley, CA',
        category: 'Electronics',
        paymentTerms: 'Net 30',
        isActive: true
      },
      {
        name: 'Global Materials Inc',
        code: 'GMI002',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@gmi.com',
        phone: '+1-555-0102',
        address: '456 Industrial Ave, Chicago, IL',
        category: 'Raw Materials',
        paymentTerms: 'Net 45',
        isActive: true
      },
      {
        name: 'Office Supplies Plus',
        code: 'OSP003',
        contactPerson: 'Mike Davis',
        email: 'mike@osp.com',
        phone: '+1-555-0103',
        address: '789 Business Blvd, New York, NY',
        category: 'Office Supplies',
        paymentTerms: 'Net 15',
        isActive: true
      },
      {
        name: 'Furniture World',
        code: 'FW004',
        contactPerson: 'Lisa Wilson',
        email: 'lisa@furnitureworld.com',
        phone: '+1-555-0104',
        address: '321 Design Drive, Los Angeles, CA',
        category: 'Furniture',
        paymentTerms: 'Net 30',
        isActive: true
      },
      {
        name: 'Digital Components Ltd',
        code: 'DCL005',
        contactPerson: 'David Brown',
        email: 'david@dcl.com',
        phone: '+1-555-0105',
        address: '654 Circuit Road, Austin, TX',
        category: 'Electronics',
        paymentTerms: 'Net 30',
        isActive: true
      }
    ];

    const createdSuppliers = await Supplier.insertMany(suppliers);
    console.log(`✅ Created ${createdSuppliers.length} suppliers`);

    // Generate Products
    const products = [
      {
        name: 'Laptop Pro X1',
        description: 'High-performance business laptop with 16GB RAM',
        sku: 'LAP001',
        category: 'Electronics',
        price: 1299.99,
        cost: 899.99,
        stockQuantity: 25,
        minStockLevel: 5,
        supplier: createdSuppliers[0]._id,
        unit: 'piece',
        tags: ['laptop', 'business', 'high-performance']
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        sku: 'MOU002',
        category: 'Electronics',
        price: 49.99,
        cost: 25.99,
        stockQuantity: 100,
        minStockLevel: 20,
        supplier: createdSuppliers[0]._id,
        unit: 'piece',
        tags: ['mouse', 'wireless', 'ergonomic']
      },
      {
        name: 'Office Chair Deluxe',
        description: 'Comfortable office chair with lumbar support',
        sku: 'CHA003',
        category: 'Furniture',
        price: 299.99,
        cost: 180.99,
        stockQuantity: 15,
        minStockLevel: 3,
        supplier: createdSuppliers[3]._id,
        unit: 'piece',
        tags: ['chair', 'office', 'ergonomic']
      },
      {
        name: 'Printer Paper A4',
        description: 'High-quality A4 printer paper, 500 sheets',
        sku: 'PAP004',
        category: 'Office Supplies',
        price: 12.99,
        cost: 6.99,
        stockQuantity: 200,
        minStockLevel: 50,
        supplier: createdSuppliers[2]._id,
        unit: 'pack',
        tags: ['paper', 'printer', 'a4']
      },
      {
        name: 'Desk Lamp LED',
        description: 'Modern LED desk lamp with adjustable brightness',
        sku: 'LAM005',
        category: 'Office Supplies',
        price: 89.99,
        cost: 45.99,
        stockQuantity: 30,
        minStockLevel: 8,
        supplier: createdSuppliers[2]._id,
        unit: 'piece',
        tags: ['lamp', 'led', 'desk']
      },
      {
        name: 'Steel Desk',
        description: 'Professional steel desk with cable management',
        sku: 'DES006',
        category: 'Furniture',
        price: 399.99,
        cost: 250.99,
        stockQuantity: 8,
        minStockLevel: 2,
        supplier: createdSuppliers[3]._id,
        unit: 'piece',
        tags: ['desk', 'steel', 'professional']
      },
      {
        name: 'USB-C Cable',
        description: 'High-speed USB-C cable, 2 meters',
        sku: 'CAB007',
        category: 'Electronics',
        price: 19.99,
        cost: 8.99,
        stockQuantity: 150,
        minStockLevel: 30,
        supplier: createdSuppliers[4]._id,
        unit: 'piece',
        tags: ['cable', 'usb-c', 'high-speed']
      },
      {
        name: 'Whiteboard Marker Set',
        description: 'Set of 8 colored whiteboard markers',
        sku: 'MAR008',
        category: 'Office Supplies',
        price: 15.99,
        cost: 7.99,
        stockQuantity: 75,
        minStockLevel: 15,
        supplier: createdSuppliers[2]._id,
        unit: 'set',
        tags: ['markers', 'whiteboard', 'colors']
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Generate additional users
    const users = [
      {
        name: 'Manager User',
        email: 'manager@airos.id',
        password: 'manager123',
        role: 'manager',
        department: 'Sales',
        isActive: true
      },
      {
        name: 'Employee User',
        email: 'employee@airos.id',
        password: 'employee123',
        role: 'employee',
        department: 'Inventory',
        isActive: true
      },
      {
        name: 'Sales Manager',
        email: 'sales@airos.id',
        password: 'sales123',
        role: 'manager',
        department: 'Sales',
        isActive: true
      },
      {
        name: 'Inventory Clerk',
        email: 'inventory@airos.id',
        password: 'inventory123',
        role: 'employee',
        department: 'Inventory',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} additional users`);

    // Generate Orders
    const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    const paymentMethods = ['credit_card', 'bank_transfer', 'cash', 'check'];
    
    const customers = [
      { name: 'ABC Corporation', email: 'orders@abc.com', phone: '+1-555-1001' },
      { name: 'XYZ Industries', email: 'purchasing@xyz.com', phone: '+1-555-1002' },
      { name: 'Tech Startup Inc', email: 'admin@techstartup.com', phone: '+1-555-1003' },
      { name: 'Global Consulting', email: 'procurement@global.com', phone: '+1-555-1004' },
      { name: 'Innovation Labs', email: 'supplies@innovation.com', phone: '+1-555-1005' }
    ];

    const orders = [];
    const adminUser = await User.findOne({ email: 'admin@airos.id' });

    for (let i = 0; i < 20; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Generate 1-4 random items per order
      const numItems = Math.floor(Math.random() * 4) + 1;
      const orderItems = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const itemTotal = product.price * quantity;
        
        orderItems.push({
          product: product._id,
          quantity,
          price: product.price,
          total: itemTotal
        });
        
        subtotal += itemTotal;
      }

      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal > 500 ? 0 : 25; // Free shipping over $500
      const total = subtotal + tax + shipping;

      // Generate random date within last 30 days
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

      orders.push({
        orderNumber: `ORD${String(i + 1).padStart(4, '0')}`,
        customer,
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total,
        status,
        paymentMethod,
        notes: `Sample order ${i + 1}`,
        createdBy: adminUser._id,
        createdAt: orderDate
      });
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);

    // Update some products to have low stock for testing alerts
    await Product.updateOne(
      { sku: 'LAP001' },
      { stockQuantity: 3, minStockLevel: 5 }
    );

    await Product.updateOne(
      { sku: 'CHA003' },
      { stockQuantity: 1, minStockLevel: 3 }
    );

    console.log('\n🎉 Sample data generation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Products: ${await Product.countDocuments()}`);
    console.log(`   Suppliers: ${await Supplier.countDocuments()}`);
    console.log(`   Orders: ${await Order.countDocuments()}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@airos.id / admin123');
    console.log('   Manager: manager@airos.id / manager123');
    console.log('   Employee: employee@airos.id / employee123');
    console.log('   Sales: sales@airos.id / sales123');
    console.log('   Inventory: inventory@airos.id / inventory123');

  } catch (error) {
    console.error('❌ Error generating sample data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
generateSampleData(); 