import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ahmed-rasel';
    
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create admin user
      const admin = await User.create({
        email: 'admin@gmail.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
      });
      
      console.log('Admin user created successfully');
      console.log('Email: admin@gmail.com');
      console.log('Password: admin123');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();