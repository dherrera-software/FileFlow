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
import { convertFile } from '../services/conversionService.js';

export async function convertController(
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

  const baseName = getSafeBaseName(uploadedFile.originalname);
  const uniqueOutName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${baseName}.${targetExt}`;
  const outputPath = path.join(CONFIG.OUTPUTS_DIR, uniqueOutName);
  const downloadFileName = `${baseName}.${targetExt}`;

  try {
    await convertFile({
      inputPath: uploadedFile.path,
      outputPath,
      sourceFormat: sourceExt,
      targetFormat: targetExt,
    });

    const mimeType = MIME_TYPE_MAP[targetExt] || 'application/octet-stream';

    // Set Content-Length so the client can track download progress accurately
    const stat = await fs.stat(outputPath);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);

    // Stream the converted file with a larger buffer for better throughput
    const readStream = fsSync.createReadStream(outputPath, { highWaterMark: 256 * 1024 });
    readStream.pipe(res);

    readStream.on('end', async () => {
      // Clean up input file after successful delivery
      await fs.unlink(uploadedFile.path).catch(() => {});
    });

    readStream.on('error', async (streamErr) => {
      await fs.unlink(uploadedFile.path).catch(() => {});
      if (!res.headersSent) {
        next(streamErr);
      }
    });
  } catch (error: any) {
    console.error(`[Conversion Controller Error] (${sourceExt} -> ${targetExt}):`, error);

    // Clean up input file and failed output file if created
    await fs.unlink(uploadedFile.path).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    const errorMsg = error?.message || 'Conversion failed';
    if (
      errorMsg.includes('Conversion engine not installed on this server') ||
      errorMsg.includes('Conversion engine error')
    ) {
      res.status(500).json({ error: errorMsg });
      return;
    }

    next(error);
  }
}
