const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@airos.id' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Department: ${existingAdmin.department}`);
      console.log('   You can use these credentials to login');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin AIROS',
      email: 'admin@airos.id',
      password: 'admin123',
      role: 'admin',
      department: 'IT',
      isActive: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Department: ${adminUser.department}`);
    console.log('   Password: admin123');
    console.log('\n🎉 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('⚠️  Admin user already exists with this email');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createAdminUser(); 