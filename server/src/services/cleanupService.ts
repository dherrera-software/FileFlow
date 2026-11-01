import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import { CONFIG } from '../config.js';
import { removeOldJobs } from './conversionQueue.js';

export async function cleanupFolder(folderPath: string, maxAgeMinutes: number): Promise<{ cleanedCount: number; freedBytes: number }> {
  let cleanedCount = 0;
  let freedBytes = 0;
  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const filePath = path.join(folderPath, entry.name);
      try {
        const stats = await fs.stat(filePath);
        const ageMs = now - stats.mtimeMs;

        if (ageMs > maxAgeMs) {
          try {
            freedBytes += stats.size;
            await fs.unlink(filePath);
            cleanedCount++;
          } catch (unlinkErr: any) {
            console.warn(`[Cleanup] Failed to remove ${filePath}:`, unlinkErr?.message);
          }
        }
      } catch (statErr: any) {
        console.warn(`[Cleanup] Failed to stat ${filePath}:`, statErr?.message);
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error(`[Cleanup] Error scanning ${folderPath}:`, err?.message);
    }
  }

  return { cleanedCount, freedBytes };
}

export async function runCleanup(): Promise<void> {
  const { cleanedCount: uploadsCleaned, freedBytes: uploadsFreed } = await cleanupFolder(CONFIG.UPLOADS_DIR, CONFIG.FILE_RETENTION_MINUTES);
  const { cleanedCount: outputsCleaned, freedBytes: outputsFreed } = await cleanupFolder(CONFIG.OUTPUTS_DIR, CONFIG.FILE_RETENTION_MINUTES);
  
  try {
    removeOldJobs(CONFIG.FILE_RETENTION_MINUTES);
  } catch (err: any) {
    console.error('[Cleanup] Error removing old jobs:', err?.message);
  }

  const totalCleaned = uploadsCleaned + outputsCleaned;
  const totalFreed = uploadsFreed + outputsFreed;

  if (totalCleaned > 0) {
    const mbFreed = (totalFreed / (1024 * 1024)).toFixed(2);
    console.log(
      `[Cleanup] Removed ${totalCleaned} expired files (> ${CONFIG.FILE_RETENTION_MINUTES} min): ${uploadsCleaned} from uploads, ${outputsCleaned} from outputs. Freed ~${mbFreed} MB.`,
    );
  }
}

/**
 * Starts a cron job that runs periodically to enforce retention policy.
 */
export function startCleanupSchedule(): cron.ScheduledTask {
  const task = cron.schedule('*/2 * * * *', async () => {
    try {
      await runCleanup();
    } catch (err: any) {
      console.error('[Cleanup] Scheduled cleanup failed:', err?.message);
    }
  });

  console.log(`[Cleanup] Scheduled cleanup running every 2 minutes (Retention: ${CONFIG.FILE_RETENTION_MINUTES} min)`);
  return task;
}
