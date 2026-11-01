import fs from 'fs/promises';
import fsSync from 'fs';
import { convertFile } from './conversionService.js';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ConversionJob {
  jobId: string;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  inputPath: string;
  outputPath: string;
  sourceFormat: string;
  targetFormat: string;
  originalName: string;
  downloadFileName: string;
  error?: string;
}

const jobs = new Map<string, ConversionJob>();
const queue: string[] = [];

/**
 * Add a new conversion job to the queue.
 * The job will be processed in FIFO order.
 * Concurrency is controlled by ConcurrencyLimiter in conversionService.
 */
export function addJob(jobData: Omit<ConversionJob, 'status' | 'createdAt' | 'updatedAt'>): ConversionJob {
  const now = Date.now();
  const job: ConversionJob = {
    ...jobData,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(job.jobId, job);
  queue.push(job.jobId);
  processQueue();

  return job;
}

export function getJob(jobId: string): ConversionJob | undefined {
  return jobs.get(jobId);
}

/**
 * Process queued jobs in FIFO order.
 * Jobs are started immediately; actual concurrency is limited by ConcurrencyLimiter.
 */
function processQueue() {
  while (queue.length > 0) {
    const jobId = queue.shift();
    if (!jobId) continue;

    const job = jobs.get(jobId);
    if (!job || job.status !== 'pending') continue;

    // Start job immediately; ConcurrencyLimiter will queue it if needed
    runJob(jobId);
  }
}

async function runJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = 'processing';
  job.updatedAt = Date.now();
  jobs.set(jobId, job);

  try {
    await convertFile({
      inputPath: job.inputPath,
      outputPath: job.outputPath,
      sourceFormat: job.sourceFormat,
      targetFormat: job.targetFormat,
    });

    job.status = 'completed';
    job.completedAt = Date.now();
    job.updatedAt = Date.now();
    jobs.set(jobId, job);
  } catch (error: any) {
    console.error(`[Conversion Queue Error] Job ${jobId} (${job.sourceFormat} -> ${job.targetFormat}):`, error);

    job.status = 'failed';
    job.error = error?.message || 'Conversion failed';
    job.updatedAt = Date.now();
    jobs.set(jobId, job);

    // Clean up failed output file
    await fs.unlink(job.outputPath).catch(() => {});
  } finally {
    // Always clean up input file to prevent orphaned uploads
    await fs.unlink(job.inputPath).catch(() => {});
  }
}

export function removeOldJobs(maxAgeMinutes: number): void {
  const now = Date.now();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  for (const [jobId, job] of jobs.entries()) {
    const age = now - job.updatedAt;
    if (age > maxAgeMs) {
      if (job.status === 'completed' || job.status === 'failed') {
        try {
          if (fsSync.existsSync(job.outputPath)) {
            fsSync.unlinkSync(job.outputPath);
          }
        } catch (e) {
          console.warn(`[Cleanup] Failed to remove output ${job.outputPath}:`, (e as Error).message);
        }
        jobs.delete(jobId);
      }
    }
  }
}
