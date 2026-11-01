import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import {
  enqueueConvertController,
  getStatusController,
  downloadResultController,
} from '../controllers/convert.controller.js';

const router = Router();

router.post('/convert', upload.single('file'), enqueueConvertController);
router.get('/status/:jobId', getStatusController);
router.get('/download/:jobId', downloadResultController);

export default router;
