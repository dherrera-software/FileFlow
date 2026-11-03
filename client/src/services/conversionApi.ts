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
 * Sends a file to the FileFlow API for conversion,
 * supports both direct binary download (Cloudflare Workers)
 * and asynchronous job polling (Express/Queue).
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
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isError = err instanceof Error;
    if (retries > 0 && (isError && (err.name === 'TypeError' || err.message === 'Retryable'))) {
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
    throw { kind: 'validation', message: `El archivo supera el límite de ${Math.round(limits.maxFileSizeBytes / 1024 / 1024)} MB`, retryable: false };
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', targetFormat.toLowerCase());

  onProgress?.(10, 'Subiendo archivo al servidor...');

  // 1. Enviar solicitud de conversión
  const enqueueRes = await fetchWithRetry(`${API_BASE_URL}/convert`, { method: 'POST', body: formData });

  if (!enqueueRes.ok) {
    let errorMsg = `Error del servidor (${enqueueRes.status})`;
    try {
      const data = await enqueueRes.json();
      if (data && typeof data.error === 'string') {
        errorMsg = data.error;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  const contentType = enqueueRes.headers.get('content-type') || '';

  // Modo A: Respuesta binaria directa (Cloudflare Workers / modo síncrono)
  if (!contentType.includes('application/json')) {
    onProgress?.(90, 'Finalizando y descargando archivo...');
    const disposition = enqueueRes.headers.get('content-disposition');
    let downloadFileName = `${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat.toLowerCase()}`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/i);
      if (match?.[1]) {
        downloadFileName = match[1].trim();
      }
    }

    const blob = await enqueueRes.blob();
    onProgress?.(100, '¡Completado!');

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return downloadFileName;
  }

  // Modo B: Cola asíncrona de tareas (Node.js Express / Job Queue)
  const enqueueData = await enqueueRes.json();
  const jobId = enqueueData.jobId;

  if (!jobId) throw new Error('No se pudo obtener el ID de la tarea.');

  onProgress?.(20, 'Tarea encolada. Procesando...');

  let attempts = 0;
  const MAX_ATTEMPTS = 60;

  while (attempts < MAX_ATTEMPTS) {
    try {
      const statusRes = await fetchWithRetry(`${API_BASE_URL}/status/${jobId}`, {}, 1, 2000);
      const statusData = await statusRes.json();

      if (statusData.status === 'completed') {
        onProgress?.(100, getStatusMessage('completed'));

        // 3. Descarga
        const downloadRes = await fetchWithRetry(`${API_BASE_URL}/download/${jobId}`);
        const blob = await downloadRes.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = statusData.downloadFileName || `${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return statusData.downloadFileName || link.download;
      }

      if (statusData.status === 'failed') throw new Error(statusData.error || 'La conversión falló en el servidor.');

      onProgress?.(statusData.status === 'pending' ? 30 : 70, getStatusMessage(statusData.status));
      attempts++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (e: unknown) {
      if (attempts++ > 3) {
        const errorText = e instanceof Error ? e.message : 'Error de conexión persistente.';
        throw new Error(errorText, { cause: e });
      }
      onProgress?.(20, 'Reintentando conexión...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  throw new Error('La tarea de conversión ha expirado.');
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
