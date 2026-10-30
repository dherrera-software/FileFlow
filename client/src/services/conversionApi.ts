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
  if (progress <= 15) return 'Subiendo archivo...';
  if (progress <= 35) return 'Iniciando motor de conversión...';
  if (progress <= 60) return 'Procesando páginas y formato...';
  if (progress <= 80) return 'Convirtiendo estilos y contenido...';
  if (progress <= 95) return 'Optimizando archivo final...';
  return '¡Listo! Descargando archivo...';
}

/**
 * Sends a file to the FileFlow backend API for conversion and handles the download.
 * Features a real-time adaptive progress engine that constantly updates the percentage
 * and status without getting stuck at static values.
 */
export async function convertAndDownload(
  file: File,
  targetFormat: string,
  onProgress?: ProgressCallback,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', targetFormat.toLowerCase());

  const { blob, downloadFileName } = await new Promise<{ blob: Blob; downloadFileName: string }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/convert`, true);
      xhr.responseType = 'blob';

      let currentProgress = 0;
      let progressTimer: ReturnType<typeof setInterval> | null = null;
      let isCompleted = false;

      const reportProgress = (val: number, customStage?: string) => {
        currentProgress = Math.min(val, 100);
        const stage = customStage || getStageMessage(currentProgress);
        onProgress?.(Math.round(currentProgress), stage);
      };

      const startProcessingTicker = () => {
        if (progressTimer || isCompleted) return;

        // Smooth continuous advancement while server processes the conversion
        progressTimer = setInterval(() => {
          if (isCompleted) {
            if (progressTimer) clearInterval(progressTimer);
            return;
          }

          // Dynamic asymptotic increment: faster at start, gentle crawl approaching 95%
          let increment = 0;
          if (currentProgress < 30) {
            increment = 1.6 + Math.random() * 0.8;
          } else if (currentProgress < 55) {
            increment = 1.0 + Math.random() * 0.6;
          } else if (currentProgress < 75) {
            increment = 0.6 + Math.random() * 0.4;
          } else if (currentProgress < 88) {
            increment = 0.3 + Math.random() * 0.3;
          } else if (currentProgress < 95) {
            increment = 0.1 + Math.random() * 0.15;
          } else {
            increment = 0.02;
          }

          const next = Math.min(currentProgress + increment, 96);
          reportProgress(next);
        }, 80);
      };

      const stopProcessingTicker = () => {
        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }
      };

      // 1. Upload progress (0% – 20%)
      reportProgress(5, 'Subiendo archivo...');

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const uploadPercent = Math.max(5, (e.loaded / e.total) * 20);
          reportProgress(uploadPercent, 'Subiendo archivo...');
        }
      });

      xhr.upload.addEventListener('loadend', () => {
        // Upload completed: kick off real-time processing ticker immediately
        if (currentProgress < 22) {
          reportProgress(22, 'Iniciando motor de conversión...');
        }
        startProcessingTicker();
      });

      // In case upload events were skipped/instantaneous
      setTimeout(() => {
        if (!isCompleted && !progressTimer) {
          startProcessingTicker();
        }
      }, 150);

      // 2. Server Response handling
      xhr.addEventListener('load', () => {
        isCompleted = true;
        stopProcessingTicker();

        if (xhr.status >= 200 && xhr.status < 300) {
          // Extract filename from Content-Disposition header
          const disposition = xhr.getResponseHeader('content-disposition');
          let fileName = '';

          if (disposition && disposition.includes('filename=')) {
            const match = disposition.match(/filename="?([^";]+)"?/i);
            if (match?.[1]) {
              fileName = match[1].trim();
            }
          }

          if (!fileName) {
            const lastDot = file.name.lastIndexOf('.');
            const baseName = lastDot === -1 ? file.name : file.name.slice(0, lastDot);
            fileName = `${baseName}.${targetFormat.toLowerCase()}`;
          }

          // Smoothly ramp to 100% so the user sees the finalization
          reportProgress(98, 'Finalizando archivo...');
          setTimeout(() => {
            reportProgress(100, '¡Completado!');
            setTimeout(() => {
              resolve({ blob: xhr.response as Blob, downloadFileName: fileName });
            }, 120);
          }, 100);
        } else {
          const errorBlob = xhr.response as Blob;
          const reader = new FileReader();
          reader.onload = () => {
            let errorMessage = `Error del servidor (${xhr.status})`;
            try {
              const parsed = JSON.parse(reader.result as string);
              if (parsed && typeof parsed.error === 'string') {
                errorMessage = parsed.error;
              }
            } catch {
              errorMessage = xhr.statusText || errorMessage;
            }
            reject(new Error(errorMessage));
          };
          reader.onerror = () => reject(new Error(`Error del servidor (${xhr.status})`));
          reader.readAsText(errorBlob);
        }
      });

      xhr.addEventListener('error', () => {
        isCompleted = true;
        stopProcessingTicker();
        reject(
          new Error(
            `No se pudo conectar con el servidor backend en ${API_BASE_URL}. Asegúrate de que el backend esté ejecutándose.`,
          ),
        );
      });

      xhr.addEventListener('abort', () => {
        isCompleted = true;
        stopProcessingTicker();
        reject(new Error('La conversión fue cancelada.'));
      });

      xhr.send(formData);
    },
  );

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
