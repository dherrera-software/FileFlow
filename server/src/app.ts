import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import healthRouter from './routes/health.route.js';
import convertRouter from './routes/convert.route.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

export const app = express();

// Configuración de CORS
const allowedOrigins: string[] = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como Postman, curl o peticiones entre servicios)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
};

// Middleware CORS colocado ANTES de definir las rutas
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', healthRouter);
app.use('/api', convertRouter);

// Global Error Handler
app.use(errorHandler);
