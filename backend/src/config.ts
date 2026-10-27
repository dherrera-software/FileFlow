import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
  get MAX_FILE_SIZE_BYTES() {
    return this.MAX_FILE_SIZE_MB * 1024 * 1024;
  },
  CLEANUP_INTERVAL_MINUTES: 2,
  FILE_RETENTION_MINUTES: parseInt(process.env.FILE_CLEANUP_MINUTES || '10', 10),
  UPLOADS_DIR: path.resolve(process.cwd(), 'uploads'),
  OUTPUTS_DIR: path.resolve(process.cwd(), 'outputs'),
};
