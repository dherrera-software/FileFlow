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

function getStageMessage(progress: number): string {
  if (progress <= 15) return 'Subiendo archivo y encolando tarea...';
  if (progress <= 40) return 'En cola de espera...';
  if (progress <= 75) return 'Procesando conversión en segundo plano...';
  if (progress <= 95) return 'Optimizando archivo final...';
  return '¡Listo! Descargando archivo...';
}

/**
 * Sends a file to the FileFlow async backend API for conversion,
 * polls job status, and handles the download.
 */
export async function convertAndDownload(
  file: File,
  targetFormat: string,
  onProgress?: ProgressCallback,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', targetFormat.toLowerCase());

  const reportProgress = (val: number, customStage?: string) => {
    const progress = Math.min(val, 100);
    const stage = customStage || getStageMessage(progress);
    onProgress?.(Math.round(progress), stage);
  };

  reportProgress(5, 'Subiendo archivo...');

  // 1. Enqueue job (POST /api/convert)
  const enqueueRes = await fetch(`${API_BASE_URL}/convert`, {
    method: 'POST',
    body: formData,
  });

  if (!enqueueRes.ok) {
    let errorMsg = `Error del servidor (${enqueueRes.status})`;
    try {
      const data = await enqueueRes.json();
      if (data && typeof data.error === 'string') {
        errorMsg = data.error;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  const enqueueData = await enqueueRes.json();
  const jobId = enqueueData.jobId;

  if (!jobId) {
    throw new Error('No se pudo obtener el ID de la tarea de conversión.');
  }

  reportProgress(20, 'Tarea encolada. Iniciando procesamiento...');

  // 2. Poll job status (GET /api/status/:jobId)
  let downloadFileName = `${file.name.replace(/\.[^/.]+$/, '')}.${targetFormat.toLowerCase()}`;
  let currentProgress = 20;
  const pollIntervalMs = 800;
  const maxAttempts = 375; // up to 5 minutes for heavy files
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    attempts++;

    const statusRes = await fetch(`${API_BASE_URL}/status/${jobId}`);
    if (!statusRes.ok) {
      throw new Error(`Error al consultar estado de la tarea (${statusRes.status})`);
    }

    const statusData = await statusRes.json();

    if (statusData.status === 'completed') {
      if (statusData.downloadFileName) {
        downloadFileName = statusData.downloadFileName;
      }
      reportProgress(90, '¡Conversión completada!');
      break;
    }

    if (statusData.status === 'failed') {
      throw new Error(statusData.error || 'La conversión falló en el servidor.');
    }

    // Incremental progress while pending or processing
    if (statusData.status === 'processing') {
      currentProgress = Math.min(currentProgress + 2.5, 88);
      reportProgress(currentProgress, 'Procesando archivo pesados en segundo plano...');
    } else {
      currentProgress = Math.min(currentProgress + 1, 45);
      reportProgress(currentProgress, 'En cola de espera...');
    }
  }

  if (attempts >= maxAttempts) {
    throw new Error('La conversión tardó demasiado tiempo y expiró el tiempo de espera.');
  }

  // 3. Download converted file (GET /api/download/:jobId)
  reportProgress(95, 'Descargando resultado...');
  const downloadRes = await fetch(`${API_BASE_URL}/download/${jobId}`);
  if (!downloadRes.ok) {
    let errorMsg = `Error al descargar archivo (${downloadRes.status})`;
    try {
      const data = await downloadRes.json();
      if (data && typeof data.error === 'string') {
        errorMsg = data.error;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  const blob = await downloadRes.blob();
  reportProgress(100, '¡Completado!');

  // Trigger browser download
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

/**
 * Health check endpoint ping.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
