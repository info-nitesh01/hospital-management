import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/docu',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'docu',
};
