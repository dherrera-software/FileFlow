/**
 * ConcurrencyLimiter - Worker Pool / Semaphore implementation
 * Limits number of concurrent async operations with FIFO queue.
 */
export class ConcurrencyLimiter {
  private readonly maxConcurrent: number;
  private activeCount = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrent: number = 2) {
    if (maxConcurrent < 1) {
      throw new Error('maxConcurrent must be >= 1');
    }
    this.maxConcurrent = maxConcurrent;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      this.queue.push(() => {
        this.activeCount++;
        this.logState();
        task().finally(() => {
          this.activeCount--;
          this.logState();
          this.dequeue();
        });
      });

      this.logState();
      this.dequeue();
    });
  }

  private dequeue() {
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const next = this.queue.shift();
      next?.();
    }
  }

  private logState() {
    const queued = this.queue.length;
    const active = this.activeCount;
    if (active > 0 || queued > 0) {
      console.log(`[Concurrency] Active: ${active}, Queued: ${queued}, Max: ${this.maxConcurrent}`);
    }
  }

  getStats() {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      max: this.maxConcurrent,
    };
  }
}

/**
 * Create a default limiter instance for the application
 */
export function createLimiter(maxConcurrent?: number): ConcurrencyLimiter {
  return new ConcurrencyLimiter(maxConcurrent);
}
