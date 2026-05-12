import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    console.log('Loading MONGODB_URI from env...');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ahmed-rasel';
    console.log('MONGODB_URI:', mongoURI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;