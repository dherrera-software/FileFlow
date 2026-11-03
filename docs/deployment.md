# Guía de Despliegue en Producción — FileFlow

Esta guía detalla el proceso completo para desplegar **FileFlow** de forma 100% gratuita utilizando:
- **Frontend (`client`)**: Desplegado en **GitHub Pages** mediante GitHub Actions.
- **Backend (`server`)**: Desplegado en **Cloudflare Workers** mediante GitHub Actions.

---

## 1. Configuración de Secretos y Variables en GitHub

Antes de que los workflows funcionen, debes configurar los secretos y variables en tu repositorio.

### 1.1 Obtener el API Token de Cloudflare

1. Ve a [Cloudflare Dashboard → Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Haz clic en **"Create Token"**.
3. Usa la plantilla **"Edit Cloudflare Workers"**.
4. Configura los permisos:
   - **Account → Cloudflare Workers Scripts → Edit**
   - **Zone → Workers Routes → Edit** (si usas rutas personalizadas)
5. Haz clic en **"Continue to summary"** → **"Create Token"**.
6. **Copia el token** (solo se muestra una vez).

### 1.2 Obtener tu Account ID

1. En el [Cloudflare Dashboard](https://dash.cloudflare.com), selecciona tu cuenta.
2. El **Account ID** aparece en la barra lateral derecha de la página principal, o en la URL: `https://dash.cloudflare.com/<ACCOUNT_ID>`.

### 1.3 Agregar Secretos y Variables en GitHub

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions**.

#### Pestaña "Secrets" → "New repository secret"
| Nombre | Valor |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | El token de API que copiaste en el paso 1.1 |
| `CLOUDFLARE_ACCOUNT_ID` | Tu Account ID del paso 1.2 |

#### Pestaña "Variables" → "New repository variable"
| Nombre | Valor |
|--------|-------|
| `VITE_API_BASE_URL` | URL de tu Worker + `/api` (ej. `https://fileflow-server.<subdominio>.workers.dev/api`) |

---

## 2. Despliegue del Backend en Cloudflare Workers

### Despliegue Automático (CI/CD)

El workflow [`.github/workflows/deploy-worker.yml`](../.github/workflows/deploy-worker.yml) despliega automáticamente el backend cuando:
- Se hace push a `main`/`master` con cambios en `server/`, `pnpm-lock.yaml` o `pnpm-workspace.yaml`.
- Se ejecuta manualmente desde **Actions → Deploy Server to Cloudflare Workers → Run workflow**.

El workflow usa la acción oficial [`cloudflare/wrangler-action@v3`](https://github.com/cloudflare/wrangler-action) para ejecutar `wrangler deploy` desde el directorio `server/`.

### Despliegue Manual (opcional)

Si necesitas desplegar manualmente desde tu terminal:

1. Inicia sesión en Cloudflare:
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
   cd server
   npx wrangler deploy --dry-run
   ```

4. Despliega en producción:
   ```bash
   npx wrangler deploy
   ```

5. Copia la URL pública generada (ej. `https://fileflow-server.<tu-subdominio>.workers.dev`).

---

## 3. Despliegue del Frontend en GitHub Pages

### Despliegue Automático (CI/CD)

El workflow [`.github/workflows/deploy-client.yml`](../.github/workflows/deploy-client.yml) despliega automáticamente el frontend cuando:
- Se hace push a `main`/`master`.
- Se ejecuta manualmente desde **Actions → Deploy Client to GitHub Pages → Run workflow**.

### Paso 1: Habilitar GitHub Pages en el Repositorio

1. Entra a tu repositorio en GitHub.
2. Ve a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En la sección **Build and deployment**:
   - **Source**: Selecciona **GitHub Actions**.

### Paso 2: Configurar la URL del Backend

Asegúrate de haber creado la variable `VITE_API_BASE_URL` como se indica en la sección 1.3.

### Paso 3: Disparar el Despliegue

1. Haz un `push` a la rama `main` (o `master`), o ve a la pestaña **Actions** en GitHub, selecciona el workflow **Deploy Client to GitHub Pages** y pulsa **Run workflow**.
2. El workflow:
   - Instalará Node.js y `pnpm`.
   - Compilará `client` inyectando `VITE_API_BASE_URL` y el path base `/<REPO_NAME>/`.
   - Publicará el frontend en `https://<TU_USUARIO>.github.io/<REPO_NAME>/`.

---

## 4. Resolución de Problemas (Troubleshooting)

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

### El workflow `deploy-worker.yml` falla con "Authentication error"
- **Causa**: El secreto `CLOUDFLARE_API_TOKEN` no está configurado o el token expiró.
- **Solución**:
  - Verifica que el secreto exista en **Settings → Secrets and variables → Actions → Secrets**.
  - Si el token expiró, crea uno nuevo en Cloudflare y actualiza el secreto en GitHub.

### El workflow `deploy-worker.yml` no se ejecuta al hacer push
- **Causa**: Los cambios no afectaron archivos en `server/`, `pnpm-lock.yaml` o `pnpm-workspace.yaml`.
- **Solución**:
  - El workflow solo se ejecuta cuando cambian archivos del backend. Puedes ejecutarlo manualmente desde la pestaña **Actions**.
