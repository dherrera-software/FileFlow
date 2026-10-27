import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import healthRouter from './routes/health.route.js';
import convertRouter from './routes/convert.route.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

export const app = express();

// CORS setup: normalize origin (browsers send Origin without path)
const normalizeOrigin = (urlStr: string): string => {
  try {
    return new URL(urlStr).origin;
  } catch {
    return urlStr.replace(/\/$/, '');
  }
};

const clientOrigin = normalizeOrigin(CONFIG.CLIENT_URL);
const allowedOrigins = new Set([
  clientOrigin,
  CONFIG.CLIENT_URL.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server health-checks, curl, or mobile clients)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedRequestOrigin = normalizeOrigin(origin);

      if (allowedOrigins.has(origin) || allowedOrigins.has(normalizedRequestOrigin)) {
        return callback(null, true);
      }

      // Permissive only during local development
      if (CONFIG.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
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
