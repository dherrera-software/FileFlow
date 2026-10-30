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

export type ProgressCallback = (progress: number) => void;

/**
 * Sends a file to the FileFlow backend API for conversion and handles the download.
 * Uses XMLHttpRequest to track upload + download progress and report a combined percentage.
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

      // --- Upload progress (0% – 50%) ---
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const uploadPercent = (e.loaded / e.total) * 50;
          onProgress(Math.round(uploadPercent));
        }
      });

      xhr.upload.addEventListener('loadend', () => {
        // Upload finished, server is now converting → hold at 50%
        onProgress?.(50);
      });

      // --- Download progress (50% – 100%) ---
      xhr.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const downloadPercent = 50 + (e.loaded / e.total) * 50;
          onProgress(Math.min(99, Math.round(downloadPercent)));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);

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

          resolve({ blob: xhr.response as Blob, downloadFileName: fileName });
        } else {
          // Try to parse error JSON from the blob response
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
        reject(
          new Error(
            `No se pudo conectar con el servidor backend en ${API_BASE_URL}. Asegúrate de que el backend esté ejecutándose.`,
          ),
        );
      });

      xhr.addEventListener('abort', () => {
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
