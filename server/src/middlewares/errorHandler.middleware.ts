import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { CONFIG } from '../config.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: `File too large. Maximum allowed size is ${CONFIG.MAX_FILE_SIZE_MB}MB.`,
      });
      return;
    }
    res.status(400).json({
      error: `Upload error: ${err.message}`,
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred during conversion.';

  res.status(statusCode).json({
    error: message,
  });
}
