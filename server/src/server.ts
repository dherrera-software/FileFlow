import fs from 'fs';
import { app } from './app.js';
import { CONFIG } from './config.js';
import { startCleanupSchedule } from './services/cleanupService.js';

// Ensure directories exist
if (!fs.existsSync(CONFIG.UPLOADS_DIR)) {
  fs.mkdirSync(CONFIG.UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(CONFIG.OUTPUTS_DIR)) {
  fs.mkdirSync(CONFIG.OUTPUTS_DIR, { recursive: true });
}

// Start cleanup background task
startCleanupSchedule();

// Start Express server
const server = app.listen(CONFIG.PORT, () => {
  console.log('====================================================');
  console.log(`🚀 FileFlow Backend Server running on port ${CONFIG.PORT}`);
  console.log(`📡 Health check: http://localhost:${CONFIG.PORT}/api/health`);
  console.log(`🔄 Conversion:   http://localhost:${CONFIG.PORT}/api/convert`);
  console.log(`🌐 Allowed CORS: ${CONFIG.CLIENT_URL}`);
  console.log(`📁 Uploads dir:  ${CONFIG.UPLOADS_DIR}`);
  console.log(`📁 Outputs dir:  ${CONFIG.OUTPUTS_DIR}`);
  console.log('====================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
