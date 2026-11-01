import { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';
import fsSync from 'fs';
import { CONFIG } from '../config.js';
import {
  getFileExtension,
  isConversionAllowed,
  normalizeExtension,
  getSafeBaseName,
  MIME_TYPE_MAP,
} from '../utils/formatRules.js';
import { addJob, getJob } from '../services/conversionQueue.js';

/**
 * Endpoint de Encolado (POST /api/convert)
 * Receives the file and target format, validates, and enqueues the job.
 */
export async function enqueueConvertController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    res.status(400).json({ error: 'No file uploaded. Please provide a file in the "file" field.' });
    return;
  }

  const rawTargetFormat = req.body.targetFormat;
  if (!rawTargetFormat || typeof rawTargetFormat !== 'string') {
    // Clean up uploaded file
    await fs.unlink(uploadedFile.path).catch(() => {});
    res.status(400).json({
      error: 'Target format is required. Please provide a "targetFormat" form field (e.g. "pdf", "jpg", "docx").',
    });
    return;
  }

  const sourceExt = getFileExtension(uploadedFile.originalname);
  const targetExt = normalizeExtension(rawTargetFormat);

  if (!isConversionAllowed(sourceExt, targetExt)) {
    await fs.unlink(uploadedFile.path).catch(() => {});
    res.status(400).json({
      error: `Conversion from '${sourceExt.toUpperCase()}' to '${targetExt.toUpperCase()}' is not supported.`,
    });
    return;
  }

  const jobId = crypto.randomUUID();
  const baseName = getSafeBaseName(uploadedFile.originalname);
  const uniqueOutName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${baseName}.${targetExt}`;
  const outputPath = path.join(CONFIG.OUTPUTS_DIR, uniqueOutName);
  const downloadFileName = `${baseName}.${targetExt}`;

  try {
    addJob({
      jobId,
      inputPath: uploadedFile.path,
      outputPath,
      sourceFormat: sourceExt,
      targetFormat: targetExt,
      originalName: uploadedFile.originalname,
      downloadFileName,
    });

    res.status(202).json({
      jobId,
      status: 'pending',
      message: 'Conversion job enqueued successfully',
    });
  } catch (error: any) {
    console.error(`[Enqueue Error] (${sourceExt} -> ${targetExt}):`, error);
    await fs.unlink(uploadedFile.path).catch(() => {});
    next(error);
  }
}

/**
 * Endpoint de Estado de la Tarea (GET /api/status/:jobId)
 * Allows checking the progress and status of a conversion job.
 */
export async function getStatusController(
  req: Request,
  res: Response,
): Promise<void> {
  const jobId = req.params.jobId as string;
  const job = getJob(jobId);

  if (!job) {
    res.status(404).json({ error: 'Conversion job not found' });
    return;
  }

  if (job.status === 'completed') {
    res.json({
      jobId: job.jobId,
      status: 'completed',
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      downloadUrl: `/api/download/${job.jobId}`,
      downloadFileName: job.downloadFileName,
      originalName: job.originalName,
    });
    return;
  }

  if (job.status === 'failed') {
    res.json({
      jobId: job.jobId,
      status: 'failed',
      error: job.error || 'Conversion failed',
      createdAt: job.createdAt,
    });
    return;
  }

  // pending or processing
  res.json({
    jobId: job.jobId,
    status: job.status,
    createdAt: job.createdAt,
  });
}

/**
 * Endpoint de Descarga del Resultado (GET /api/download/:jobId)
 * Streams the final converted file once the job is completed.
 */
export async function downloadResultController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const jobId = req.params.jobId as string;
  const job = getJob(jobId);

  if (!job) {
    res.status(404).json({ error: 'Conversion job not found' });
    return;
  }

  if (job.status !== 'completed') {
    res.status(400).json({
      error: `Job is not completed yet. Current status: ${job.status}`,
    });
    return;
  }

  if (!fsSync.existsSync(job.outputPath)) {
    res.status(404).json({ error: 'Converted file not found or expired' });
    return;
  }

  const mimeType = MIME_TYPE_MAP[job.targetFormat] || 'application/octet-stream';

  try {
    const stat = await fs.stat(job.outputPath);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${job.downloadFileName}"`);

    const readStream = fsSync.createReadStream(job.outputPath, { highWaterMark: 256 * 1024 });
    readStream.pipe(res);

    readStream.on('end', async () => {
      // Optional one-time download cleanup: remove output file after successful delivery
      // Uncomment to enable single-use downloads:
      // await fs.unlink(job.outputPath).catch(() => {});
    });

    readStream.on('error', async (streamErr) => {
      if (!res.headersSent) {
        next(streamErr);
      }
    });

    // Cleanup on client abort
    req.on('close', async () => {
      try {
        readStream.destroy();
      } catch {}
    });
  } catch (error: any) {
    if (!res.headersSent) {
      next(error);
    }
  }
}
