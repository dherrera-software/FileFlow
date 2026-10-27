import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import { CONFIG } from '../config.js';

export async function cleanupFolder(folderPath: string, maxAgeMinutes: number): Promise<number> {
  let cleanedCount = 0;
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
          await fs.unlink(filePath);
          cleanedCount++;
        }
      } catch (err: any) {
        console.warn(`[Cleanup] Failed to remove ${filePath}:`, err?.message);
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.error(`[Cleanup] Error scanning ${folderPath}:`, err?.message);
    }
  }

  return cleanedCount;
}

export async function runCleanup(): Promise<void> {
  const uploadsCleaned = await cleanupFolder(CONFIG.UPLOADS_DIR, CONFIG.FILE_RETENTION_MINUTES);
  const outputsCleaned = await cleanupFolder(CONFIG.OUTPUTS_DIR, CONFIG.FILE_RETENTION_MINUTES);

  if (uploadsCleaned > 0 || outputsCleaned > 0) {
    console.log(
      `[Cleanup] Removed expired files (> ${CONFIG.FILE_RETENTION_MINUTES} min): ${uploadsCleaned} from uploads, ${outputsCleaned} from outputs.`,
    );
  }
}

/**
 * Starts a cron job that runs periodically to enforce the 10-minute retention policy.
 */
export function startCleanupSchedule(): cron.ScheduledTask {
  // Run every 2 minutes
  const task = cron.schedule('*/2 * * * *', async () => {
    await runCleanup();
  });

  console.log(`[Cleanup] Scheduled cleanup running every 2 minutes (Retention: ${CONFIG.FILE_RETENTION_MINUTES} min)`);
  return task;
}
