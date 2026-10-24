import mongoose from 'mongoose';

import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(env.MONGO_URI, { dbName: env.MONGO_DB_NAME });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn(
      'MongoDB connection failed. Continuing without database for local dev. Start MongoDB to enable DB-backed features.'
    );
    console.debug(error);

    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
