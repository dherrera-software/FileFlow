-- =====================================================================
-- Esquema de Base de Datos para Cloudflare D1 (Free Tier)
-- Proyecto: FileFlow - Apartado de Comentarios de la Comunidad
-- =====================================================================
-- 
-- Cuotas de la versión gratuita de Cloudflare D1:
-- - Lecturas: 5.000.000 filas / día
-- - Escrituras: 100.000 filas / día
-- - Almacenamiento total: 5 GB (más que suficiente para texto y metadatos)
--
-- Para inicializar en Cloudflare D1:
-- 1. Crear base de datos: npx wrangler d1 create fileflow-db
-- 2. Ejecutar esquema:    npx wrangler d1 execute fileflow-db --file=./schema.sql (o --remote para prod)
-- =====================================================================

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  is_verified_gmail INTEGER NOT NULL DEFAULT 1
);

-- Índices para búsquedas rápidas con bajo consumo de CPU (< 10ms)
-- y evitar escaneos de tabla completa que consuman lecturas gratuitas:
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_category ON comments(category);
