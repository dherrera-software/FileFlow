import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  getFileExtension,
  isConversionAllowed,
  normalizeExtension,
} from './utils/formatRules.js';
import { convertInWorker } from './services/workerConversionService.js';

export interface Env {
  NODE_ENV?: string;
  CLIENT_URL?: string;
  CORS_ORIGINS?: string;
  MAX_FILE_SIZE_MB?: string;
}

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------
// 1. Configuración de CORS
// ---------------------------------------------------------
app.use('*', async (c, next) => {
  const configuredOrigins = (c.env?.CORS_ORIGINS || 'https://dherrera-software.github.io,http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''));

  if (c.env?.CLIENT_URL) {
    try {
      const clientOrigin = new URL(c.env.CLIENT_URL).origin;
      if (!configuredOrigins.includes(clientOrigin)) {
        configuredOrigins.push(clientOrigin);
      }
    } catch {
      // Ignore invalid URL formatting in env
    }
  }

  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin) return configuredOrigins[0];
      const normalizedOrigin = origin.replace(/\/$/, '');

      // Coincidencia exacta con dominios configurados (GitHub Pages, etc.)
      if (configuredOrigins.includes(normalizedOrigin)) {
        return origin;
      }

      // Soporte para dominios github.io o subrutas
      if (normalizedOrigin.endsWith('.github.io') || normalizedOrigin.includes('localhost')) {
        return origin;
      }

      // No permitir orígenes no autorizados
      return configuredOrigins[0];
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposeHeaders: ['Content-Disposition'],
    credentials: true,
    maxAge: 86400,
  });

  return corsMiddleware(c, next);
});

// ---------------------------------------------------------
// 2. Health Check
// ---------------------------------------------------------
const handleHealth = (c: any) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FileFlow API (Cloudflare Workers)',
    environment: c.env?.NODE_ENV || 'production',
  });
};

app.get('/', handleHealth);
app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// ---------------------------------------------------------
// 3. Conversión de Archivos
// ---------------------------------------------------------
const handleConvert = async (c: any) => {
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch (err: any) {
    return c.json({ error: 'Invalid form-data payload. Ensure Content-Type is multipart/form-data.' }, 400);
  }

  const file = formData.get('file');
  const rawTargetFormat = formData.get('targetFormat');

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded. Please provide a file in the "file" field.' }, 400);
  }

  if (!rawTargetFormat || typeof rawTargetFormat !== 'string') {
    return c.json({
      error: 'Target format is required. Please provide a "targetFormat" form field (e.g. "pdf", "csv", "json").',
    }, 400);
  }

  const sourceExt = getFileExtension(file.name);
  const targetExt = normalizeExtension(rawTargetFormat);

  // Validación de tamaño máximo (por defecto 25MB)
  const maxMb = parseInt(c.env?.MAX_FILE_SIZE_MB || '25', 10);
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return c.json({
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds limit of ${maxMb} MB.`,
    }, 413);
  }

  if (!isConversionAllowed(sourceExt, targetExt)) {
    return c.json({
      error: `Conversion from '${sourceExt.toUpperCase()}' to '${targetExt.toUpperCase()}' is not supported.`,
    }, 400);
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const result = await convertInWorker({
      fileBytes,
      fileName: file.name,
      sourceFormat: sourceExt,
      targetFormat: targetExt,
    });

    const body = typeof result.data === 'string' ? result.data : result.data.buffer;

    return new Response(body as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.downloadFileName}"`,
      },
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'Conversion failed';

    if (errorMsg.startsWith('NATIVE_ENGINE_REQUIRED:')) {
      return c.json({
        error: errorMsg.replace('NATIVE_ENGINE_REQUIRED:', '').trim(),
      }, 501);
    }

    console.error(`[Worker Conversion Error] (${sourceExt} -> ${targetExt}):`, err);
    return c.json({ error: errorMsg }, 500);
  }
};

app.post('/convert', handleConvert);
app.post('/api/convert', handleConvert);

export default app;
