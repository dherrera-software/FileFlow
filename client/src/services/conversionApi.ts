const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export interface ConversionResponse {
  blob: Blob;
  downloadFileName: string;
}

/**
 * Sends a file to the FileFlow backend API for conversion and handles the download.
 */
export async function convertAndDownload(file: File, targetFormat: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', targetFormat.toLowerCase());

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/convert`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr: unknown) {
    throw new Error(
      `No se pudo conectar con el servidor backend en ${API_BASE_URL}. Asegúrate de que el backend esté ejecutándose.`,
      { cause: networkErr },
    );
  }

  if (!response.ok) {
    let errorMessage = `Error del servidor (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson && typeof errorJson.error === 'string') {
        errorMessage = errorJson.error;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Extract filename from header or build from original name
  const disposition = response.headers.get('content-disposition');
  let downloadFileName = '';

  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match?.[1]) {
      downloadFileName = match[1].trim();
    }
  }

  if (!downloadFileName) {
    const lastDot = file.name.lastIndexOf('.');
    const baseName = lastDot === -1 ? file.name : file.name.slice(0, lastDot);
    downloadFileName = `${baseName}.${targetFormat.toLowerCase()}`;
  }

  // Download blob
  const blob = await response.blob();
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
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
