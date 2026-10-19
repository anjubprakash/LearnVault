import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnvault';
    await mongoose.connect(mongoUri);
    console.log(`[LearnVault DB] Connected to MongoDB: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('[LearnVault DB] Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
