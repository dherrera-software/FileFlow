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
  ADMIN_EMAIL?: string;
  DB?: any;
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
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Request-Attempt', 'X-User-Email'],
    exposeHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
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

// ---------------------------------------------------------
// 4. Comentarios de la Comunidad (Cloudflare D1 + Free Tier Optimizations)
// ---------------------------------------------------------
const inMemoryComments: any[] = [];

// Helper para obtener la lista de correos administradores configurados en variables/secretos del Worker
const getAdminEmails = (c: any): string[] => {
  const envAdmins = c.env?.ADMIN_EMAIL || '';
  return envAdmins
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
};

// Anti-spam in-memory rate limiter para proteger el límite de 100k invocaciones/día en free tier
const recentPosts = new Map<string, number>();

const handleGetComments = async (c: any) => {
  const category = c.req.query('category');
  const limitParam = parseInt(c.req.query('limit') || '20', 10);
  const limit = Math.min(Math.max(limitParam, 1), 50); // Máx 50 para evitar consumo excesivo de filas
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10), 0);

  // Cloudflare CDN Edge Caching: 30 segundos en cliente, 60 en CDN
  // Evita invocar el worker repetidas veces en peticiones frecuentes
  c.header('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');

  if (c.env?.DB) {
    try {
      let query = 'SELECT id, name, username, email, avatar_color as avatarColor, category, rating, text, created_at as createdAt, is_verified_gmail as isVerifiedGmail FROM comments';
      const params: any[] = [];

      if (category && category !== 'all') {
        query += ' WHERE category = ?';
        params.push(category);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const stmt = c.env.DB.prepare(query);
      const { results } = await stmt.bind(...params).all();

      const comments = results.map((row: any) => ({
        id: row.id,
        author: {
          name: row.name,
          username: row.username,
          email: row.email,
          avatarColor: row.avatarColor,
        },
        category: row.category,
        rating: row.rating,
        text: row.text,
        createdAt: row.createdAt,
        isVerifiedGmail: Boolean(row.isVerifiedGmail),
      }));

      return c.json({ comments, count: comments.length });
    } catch (err: any) {
      console.warn('[D1 Query Warning]:', err?.message);
    }
  }

  // Fallback si D1 no está vinculado
  let filtered = inMemoryComments;
  if (category && category !== 'all') {
    filtered = inMemoryComments.filter((item) => item.category === category);
  }
  const paginated = filtered.slice(offset, offset + limit);
  return c.json({ comments: paginated, count: paginated.length });
};

const handlePostComment = async (c: any) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Payload JSON inválido.' }, 400);
  }

  const { id, name, username, email, avatarColor, category, rating, text, createdAt } = body || {};

  // Validaciones
  if (!email || typeof email !== 'string' || !/^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/i.test(email.trim())) {
    return c.json({ error: 'Se requiere una cuenta de Gmail válida (@gmail.com).' }, 400);
  }

  if (!username || typeof username !== 'string' || !/^[a-z0-9_]{3,20}$/i.test(username.trim())) {
    return c.json({ error: 'El nombre de usuario debe tener entre 3 y 20 caracteres alfanuméricos.' }, 400);
  }

  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return c.json({ error: 'El comentario debe contener al menos 10 caracteres.' }, 400);
  }

  if (text.length > 500) {
    return c.json({ error: 'El comentario excede el límite de 500 caracteres (optimización de almacenamiento D1).' }, 400);
  }

  const validCategories = ['suggestion', 'general', 'desktop', 'bug'];
  const finalCategory = validCategories.includes(category) ? category : 'general';
  const finalRating = Math.min(Math.max(Number(rating) || 5, 1), 5);
  const finalId = id || 'cmt-' + Date.now();
  const finalCreatedAt = Number(createdAt) || Date.now();
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase();
  const cleanName = (name || cleanUsername).trim().slice(0, 50);
  const cleanText = text.trim();
  const finalAvatar = avatarColor || 'bg-sky-600';

  // Rate Limiting (1 post cada 30 segundos por IP o usuario)
  const clientIp = c.req.header('cf-connecting-ip') || cleanEmail;
  const now = Date.now();
  const lastPost = recentPosts.get(clientIp);
  if (lastPost && now - lastPost < 30000) {
    return c.json({ error: 'Por favor espera 30 segundos antes de enviar otro comentario.' }, 429);
  }
  recentPosts.set(clientIp, now);

  const newComment = {
    id: finalId,
    author: {
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      avatarColor: finalAvatar,
    },
    category: finalCategory,
    rating: finalRating,
    text: cleanText,
    createdAt: finalCreatedAt,
    isVerifiedGmail: true,
  };

  if (c.env?.DB) {
    try {
      await c.env.DB.prepare(`
        INSERT INTO comments (id, name, username, email, avatar_color, category, rating, text, created_at, is_verified_gmail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).bind(
        finalId,
        cleanName,
        cleanUsername,
        cleanEmail,
        finalAvatar,
        finalCategory,
        finalRating,
        cleanText,
        finalCreatedAt
      ).run();
    } catch (err: any) {
      console.warn('[D1 Insert Warning]:', err?.message);
    }
  }

  inMemoryComments.unshift(newComment);
  return c.json({ success: true, comment: newComment }, 201);
};

const handleDeleteComment = async (c: any) => {
  const commentId = c.req.param('id');
  if (!commentId) {
    return c.json({ error: 'ID de comentario requerido.' }, 400);
  }

  // Obtener email del usuario desde cabecera o query param
  const userEmail = (
    c.req.header('x-user-email') ||
    c.req.query('email') ||
    ''
  ).toLowerCase().trim();

  const adminEmails = getAdminEmails(c);
  const isAdmin = Boolean(userEmail && adminEmails.includes(userEmail));

  if (c.env?.DB) {
    try {
      const existing = await c.env.DB.prepare('SELECT email FROM comments WHERE id = ?').bind(commentId).first();
      if (!existing) {
        return c.json({ error: 'Comentario no encontrado o ya resuelto.' }, 404);
      }

      const isAuthor = existing.email && existing.email.toLowerCase() === userEmail;

      if (!isAdmin && !isAuthor) {
        return c.json({ error: 'No tienes permisos para eliminar este comentario.' }, 403);
      }

      await c.env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(commentId).run();
      return c.json({ success: true, message: 'Comentario resuelto y eliminado de la base de datos.' });
    } catch (err: any) {
      console.error('[D1 Delete Error]:', err);
      return c.json({ error: 'Error al procesar la eliminación en la base de datos.' }, 500);
    }
  }

  const index = inMemoryComments.findIndex((c) => c.id === commentId);
  if (index !== -1) {
    inMemoryComments.splice(index, 1);
  }
  return c.json({ success: true, message: 'Comentario resuelto y eliminado.' });
};

const handleCheckAdmin = async (c: any) => {
  const userEmail = (
    c.req.header('x-user-email') ||
    c.req.query('email') ||
    ''
  ).toLowerCase().trim();

  const adminEmails = getAdminEmails(c);
  const isAdmin = Boolean(userEmail && adminEmails.includes(userEmail));
  return c.json({ isAdmin });
};

app.get('/comments', handleGetComments);
app.get('/api/comments', handleGetComments);
app.get('/comments/is-admin', handleCheckAdmin);
app.get('/api/comments/is-admin', handleCheckAdmin);
app.post('/comments', handlePostComment);
app.post('/api/comments', handlePostComment);
app.delete('/comments/:id', handleDeleteComment);
app.delete('/api/comments/:id', handleDeleteComment);

export default app;
