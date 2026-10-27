# Guía de Despliegue en Producción — FileFlow

Esta guía detalla el proceso completo para desplegar **FileFlow** de forma 100% gratuita utilizando:
- **Frontend (`client`)**: Desplegado en **GitHub Pages** mediante GitHub Actions.
- **Backend (`server`)**: Desplegado en **Render** como un Web Service en su plan Free.

---

## 1. Despliegue del Backend en Render

Render ofrece alojamiento gratuito para servicios web con Node.js.

### Opción A — Despliegue Automatizado con `render.yaml` (Recomendado)

El repositorio incluye un archivo [`render.yaml`](../render.yaml) configurado para Blueprints.

1. Inicia sesión en [Render.com](https://render.com).
2. En el panel principal, haz clic en **New +** y selecciona **Blueprint**.
3. Conecta tu repositorio de GitHub `FileFlow`.
4. Render detectará automáticamente `render.yaml` y configurará el servicio `fileflow-server`.
5. Modifica la variable de entorno `CLIENT_URL` para que apunte a tu URL de GitHub Pages:
   ```env
   CLIENT_URL=https://<TU_USUARIO>.github.io/FileFlow
   ```
6. Haz clic en **Apply** para iniciar la construcción y despliegue inicial.

### Opción B — Configuración Manual del Web Service

Si prefieres configurarlo manualmente desde la interfaz de Render:

1. Haz clic en **New +** > **Web Service**.
2. Conecta tu repositorio de GitHub.
3. Completa los siguientes campos:
   - **Name**: `fileflow-server`
   - **Region**: La más cercana a tu audiencia (ej. *Frankfurt* o *Oregon*).
   - **Branch**: `main` (o `master`).
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/server.js`
   - **Plan**: `Free`
4. Añade las siguientes **Environment Variables**:
   | Variable | Valor Recomendado | Descripción |
   |---|---|---|
   | `NODE_ENV` | `production` | Modo de producción optimizado |
   | `PORT` | `10000` | Puerto interno asignado por Render |
   | `CLIENT_URL` | `https://<TU_USUARIO>.github.io/FileFlow` | Origen permitido en CORS (tu frontend) |
   | `MAX_FILE_SIZE_MB` | `25` | Límite máximo de subida en MB |
   | `FILE_CLEANUP_MINUTES` | `10` | Tiempo de retención de archivos temporales |
5. Haz clic en **Create Web Service**.
6. Copia la URL pública generada (ej. `https://fileflow-server.onrender.com`).

> [!NOTE]
> En el plan Free de Render, las instancias entran en reposo tras 15 minutos de inactividad. La primera petición puede tardar unos 30-50 segundos en despertar el servicio.

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
   - **Value**: La URL de tu backend en Render con el sufijo `/api` (ej. `https://fileflow-server.onrender.com/api`).
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
- **Causa**: La variable `CLIENT_URL` en Render no coincide con la URL desde donde se abre el frontend en el navegador.
- **Solución**:
  - Verifica que en Render la variable `CLIENT_URL` sea exactamente la de tu GitHub Pages, por ejemplo: `https://<TU_USUARIO>.github.io/FileFlow`.
  - El backend de FileFlow normaliza automáticamente los orígenes (`https://<TU_USUARIO>.github.io`), por lo que funcionará tanto con la ruta del repositorio como con el dominio base.

### Error 404 al cargar scripts o estilos en GitHub Pages
- **Causa**: La propiedad `base` en `client/vite.config.ts` no coincide con el nombre del repositorio.
- **Solución**:
  - El workflow de GitHub Actions detecta automáticamente el nombre del repositorio mediante la variable `GITHUB_REPOSITORY`.
  - Si compilas manualmente para producción fuera de GitHub Actions, asegúrate de que el nombre de la carpeta base en `client/vite.config.ts` coincida con el nombre de tu repo en GitHub (ej. `/FileFlow/`).

### El backend responde "No se pudo conectar con el servidor"
- **Causa**: El backend en Render está en estado *spin-down* (reposo) o la variable `VITE_API_BASE_URL` no está apuntando a la URL correcta.
- **Solución**:
  - Abre la URL del backend directamente en el navegador (`https://tu-servicio.onrender.com/api/health`). Si devuelve `{"status":"ok"}`, el backend está despierto y listo.
  - Vuelve a compilar el cliente si cambiaste la variable `VITE_API_BASE_URL` en GitHub.
