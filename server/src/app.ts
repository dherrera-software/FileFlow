import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import healthRouter from './routes/health.route.js';
import convertRouter from './routes/convert.route.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';

export const app = express();

// CORS setup
const allowedOrigins = [
  CONFIG.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in local development
    },
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', healthRouter);
app.use('/api', convertRouter);

// Global Error Handler
app.use(errorHandler);
