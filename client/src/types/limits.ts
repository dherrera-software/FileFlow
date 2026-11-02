export interface FileLimits {
  maxFileSizeBytes: number;
  maxFileSizeMB: number;
  maxConcurrentJobs: number;
  supportedFormats: string[];
  loaded: boolean;
  error: Error | null;
}
