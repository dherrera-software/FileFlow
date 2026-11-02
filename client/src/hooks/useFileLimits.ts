import { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '../services/conversionApi';

export interface FileLimits {
  maxFileSizeBytes: number;
  maxFileSizeMB: number;
  maxConcurrentJobs: number;
  supportedFormats: string[];
  loaded: boolean;
  error: Error | null;
}

const fallbackMaxFileSizeMB = Number(import.meta.env.VITE_FALLBACK_MAX_FILE_SIZE_MB || 50);
const limitsEndpoint = import.meta.env.VITE_API_LIMITS_ENDPOINT || '/health';

export function useFileLimits(): FileLimits & { reloadLimits: () => void } {
  const [state, setState] = useState<FileLimits>({
    maxFileSizeBytes: fallbackMaxFileSizeMB * 1024 * 1024,
    maxFileSizeMB: fallbackMaxFileSizeMB,
    maxConcurrentJobs: 1,
    supportedFormats: [],
    loaded: false,
    error: null,
  });

  const fetchLimits = useCallback(async (attempt = 1) => {
    try {
      const res = await fetch(`${API_BASE_URL}${limitsEndpoint}`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const limits = data.limits || {};
      setState({
        maxFileSizeBytes: limits.maxFileSizeBytes || fallbackMaxFileSizeMB * 1024 * 1024,
        maxFileSizeMB: limits.maxFileSizeMB || fallbackMaxFileSizeMB,
        maxConcurrentJobs: limits.maxConcurrentJobs || 1,
        supportedFormats: limits.supportedFormats || [],
        loaded: true,
        error: null,
      });
    } catch (err) {
      console.warn('No se pudieron cargar los límites del backend, usando fallback.', err);
      if (attempt < 3 && state.error === null) {
        setTimeout(() => fetchLimits(attempt + 1), 800 * Math.pow(2, attempt));
      } else {
        setState(prev => ({ ...prev, loaded: true, error: err as Error }));
      }
    }
  }, []);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const reloadLimits = useCallback(() => {
    setState(prev => ({ ...prev, loaded: false }));
    fetchLimits();
  }, [fetchLimits]);

  return { ...state, reloadLimits };
}
