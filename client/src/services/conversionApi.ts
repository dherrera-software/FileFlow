const RAW_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

// Normaliza para que siempre apunte al endpoint base de la API (/api)
export const API_BASE_URL = RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`;

export interface ConversionResponse {
  blob: Blob;
  downloadFileName: string;
}

export type ProgressCallback = (progress: number, stage: string) => void;

function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending': return 'En cola de espera...';
    case 'processing': return 'Procesando conversión...';
    case 'completed': return '¡Conversión finalizada!';
    case 'failed': return 'Error en el servidor.';
    default: return 'Actualizando...';
  }
}

/**
 * Sends a file to the FileFlow async backend API for conversion,
 * polls job status, and handles the download.
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 800): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number(import.meta.env.VITE_FETCH_TIMEOUT_GENERAL || 30000));
  
  options.signal = controller.signal;
  options.headers = { ...options.headers, 'X-Request-Attempt': String(4 - retries) };

  try {
    const res = await fetch(url, options);
    clearTimeout(timeoutId);
    if (!res.ok && retries > 0 && (res.status >= 500 || res.status === 429)) {
      throw new Error('Retryable');
    }
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (retries > 0 && (err.name === 'TypeError' || err.message === 'Retryable')) {
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

export async function convertAndDownload(
  file: File,
  targetFormat: string,
  onProgress?: ProgressCallback,
  limits?: { maxFileSizeBytes: number },
): Promise<string> {
  if (limits && file.size > limits.maxFileSizeBytes) {
    throw { kind: 'validation', message: `El archivo supera el límite de ${Math.round(limits.maxFileSizeBytes/1024/1024)} MB`, retryable: false };
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', targetFormat.toLowerCase());

  // 1. Enqueue job
  const enqueueRes = await fetchWithRetry(`${API_BASE_URL}/convert`, { method: 'POST', body: formData });

  if (!enqueueRes.ok) {
    const data = await enqueueRes.json().catch(() => ({}));
    throw new Error(data.error || `Error del servidor (${enqueueRes.status})`);
  }

  const enqueueData = await enqueueRes.json();
  const jobId = enqueueData.jobId;

  if (!jobId) throw new Error('No se pudo obtener el ID de la tarea.');

  onProgress?.(10, 'Tarea encolada...');

  // 2. Poll job status
  let attempts = 0;
  const MAX_ATTEMPTS = 60;

  while (attempts < MAX_ATTEMPTS) {
    try {
      const statusRes = await fetchWithRetry(`${API_BASE_URL}/status/${jobId}`, {}, 1, 2000);
      const statusData = await statusRes.json();
      
      if (statusData.status === 'completed') {
        onProgress?.(100, getStatusMessage('completed'));
        
        // 3. Download
        const downloadRes = await fetchWithRetry(`${API_BASE_URL}/download/${jobId}`);
        const blob = await downloadRes.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = statusData.downloadFileName || 'converted_file';
        link.click();
        window.URL.revokeObjectURL(url);
        
        return statusData.downloadFileName;
      }

      if (statusData.status === 'failed') throw new Error(statusData.error || 'La conversión falló.');

      onProgress?.(statusData.status === 'pending' ? 20 : 60, getStatusMessage(statusData.status));
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      if (attempts++ > 3) throw new Error('Error de conexión persistente.');
      onProgress?.(20, 'Reintentando conexión...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  throw new Error('La tarea ha expirado.');
}

/**
 * Health check endpoint ping.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}
