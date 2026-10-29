# Guía de Despliegue en Producción — FileFlow

Esta guía detalla el proceso completo para desplegar **FileFlow** de forma 100% gratuita utilizando:
- **Frontend (`client`)**: Desplegado en **GitHub Pages** mediante GitHub Actions.
- **Backend (`server`)**: Desplegado en **Cloudflare Workers**.

---

## 1. Despliegue del Backend en Cloudflare Workers

Cloudflare Workers ofrece una plataforma serverless de baja latencia en el borde (Edge) con soporte nativo de TypeScript y Node.js compatibility.

### Requisitos Previos
1. Una cuenta activa en [Cloudflare](https://dash.cloudflare.com).
2. Tener instalado `wrangler` (incluido como devDependency en el proyecto).

### Pasos de Despliegue con Wrangler

1. Inicia sesión en Cloudflare desde tu terminal:
   ```bash
   npx wrangler login
   ```

2. Verifica la configuración en `server/wrangler.toml`:
   - `name`: Nombre del Worker (`fileflow-server`).
   - `main`: Archivo de entrada (`src/index.ts`).
   - `compatibility_date`: Fecha de compatibilidad.
   - `compatibility_flags`: Incluye `["nodejs_compat"]`.
   - `[vars]`:
     ```toml
     NODE_ENV = "production"
     CLIENT_URL = "https://<TU_USUARIO>.github.io/FileFlow"
     CORS_ORIGINS = "https://<TU_USUARIO>.github.io,http://localhost:5173"
     MAX_FILE_SIZE_MB = "25"
     ```

3. Prueba en modo seco (dry-run):
   ```bash
   npx wrangler deploy --dry-run
   ```

4. Despliega en producción:
   ```bash
   npx wrangler deploy
   ```

5. Copia la URL pública generada (ej. `https://fileflow-server.<tu-subdominio>.workers.dev`).

---

## 2. Despliegue del Frontend en GitHub Pages

El frontend está configurado con Vite y un flujo de trabajo automatizado de GitHub Actions en [`.github/workflows/deploy-client.yml`](../.github/workflows/deploy-client.yml).

### Paso 1: Habilitar GitHub Pages en el Repositorio

1. Entra a tu repositorio en GitHub.
2. Ve a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En la sección **Build and deployment**:
   - **Source**: Selecciona **GitHub Actions**.

### Paso 2: Configurar la URL del Backend en GitHub

1. En el repositorio de GitHub, ve a **Settings** > **Secrets and variables** > **Actions** > pestaña **Variables**.
2. Haz clic en **New repository variable**.
3. Añade:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: La URL de tu Worker en Cloudflare con el sufijo `/api` (ej. `https://fileflow-server.<tu-subdominio>.workers.dev/api`).
4. Haz clic en **Add variable**.

### Paso 3: Disparar el Despliegue

1. Haz un `push` a la rama `main` (o `master`), o ve a la pestaña **Actions** en GitHub, selecciona el workflow **Deploy Client to GitHub Pages** y pulsa **Run workflow**.
2. El workflow:
   - Instalará Node.js y `pnpm`.
   - Compilará `client` inyectando `VITE_API_BASE_URL` y el path base `/<REPO_NAME>/`.
   - Publicará el frontend en `https://<TU_USUARIO>.github.io/<REPO_NAME>/`.

---

## 3. Resolución de Problemas (Troubleshooting)

### Error de CORS (`CORS blocked: Origin ... is not allowed`)
- **Causa**: La variable `CLIENT_URL` o `CORS_ORIGINS` en Cloudflare Workers no coincide con la URL desde donde se abre el frontend en el navegador.
- **Solución**:
  - Verifica que en `wrangler.toml` (o mediante `wrangler secret put`) la variable `CLIENT_URL` y `CORS_ORIGINS` incluyan el origen de tu GitHub Pages (`https://<TU_USUARIO>.github.io`).

### Error 404 al cargar scripts o estilos en GitHub Pages
- **Causa**: La propiedad `base` en `client/vite.config.ts` no coincide con el nombre del repositorio.
- **Solución**:
  - El workflow de GitHub Actions detecta automáticamente el nombre del repositorio mediante la variable `GITHUB_REPOSITORY`.
  - Si compilas manualmente fuera de GitHub Actions, asegúrate de que el parámetro base coincida con el nombre de tu repo en GitHub (ej. `/FileFlow/`).

### El backend responde "No se pudo conectar con el servidor"
- **Causa**: La variable `VITE_API_BASE_URL` en GitHub Actions no apunta a la URL correcta del Cloudflare Worker.
- **Solución**:
  - Abre la URL del Worker directamente en el navegador (`https://fileflow-server.<tu-subdominio>.workers.dev/api/health`). Si devuelve `{"status":"ok"}`, el Worker está activo.
  - Vuelve a compilar el cliente si modificaste la variable `VITE_API_BASE_URL` en GitHub.
