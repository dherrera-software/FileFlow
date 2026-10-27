import { Router } from 'express';
import { upload } from '../middlewares/upload.middleware.js';
import { convertController } from '../controllers/convert.controller.js';

const router = Router();

router.post('/convert', upload.single('file'), convertController);

export default router;
