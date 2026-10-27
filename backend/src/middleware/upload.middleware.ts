import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { CONFIG } from '../config.js';
import { getFileExtension, isSourceFormatAllowed } from '../utils/formatRules.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, CONFIG.UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = getFileExtension(file.originalname);
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const safeName = `${Date.now()}-${uniqueId}.${ext}`;
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const ext = getFileExtension(file.originalname);
    if (!isSourceFormatAllowed(ext)) {
      const err = new Error(
        `Unsupported file type '.${ext}'. Please choose a supported document, image, spreadsheet, presentation, audio, or video file.`,
      );
      (err as any).status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});
