# FileFlow

![Frontend CI](https://github.com/dherrera-software/FileFlow/actions/workflows/deploy-client.yml/badge.svg)
![Backend CI](https://github.com/dherrera-software/FileFlow/actions/workflows/deploy-worker.yml/badge.svg)
![Backend](https://img.shields.io/badge/backend-Cloudflare%20Workers-orange)
![Frontend](https://img.shields.io/badge/frontend-GitHub%20Pages-green)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

Conversor universal de archivos multipropósito de alta fidelidad. Soporta documentos, imágenes, hojas de cálculo, presentaciones, audio y video con más de 35 formatos compatibles, conversiones rápidas, seguras y sin pérdida de calidad.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js**: `>= 20.0.0` (recomendado v24, fijado en [`.nvmrc`](.nvmrc))
- **pnpm**: `>= 9.0.0` (gestor de paquetes del monorepo)

```bash
# 1. Instalar dependencias en todo el monorepo
pnpm install

# 2. Iniciar ambos servicios en paralelo (Frontend + Backend)
pnpm dev

# O iniciar individualmente desde la raíz
pnpm dev:client  # Frontend en http://localhost:5173
pnpm dev:server  # Backend en http://localhost:8787 (Wrangler) o http://localhost:3000
```

---

## 🏗️ Estructura del Monorepo

```
FileFlow/
├── .github/workflows/         # Automatización CI/CD (GitHub Actions)
│   ├── deploy-client.yml      # Despliegue automático de frontend a GitHub Pages
│   └── deploy-worker.yml      # Despliegue automático de backend a Cloudflare Workers
├── client/                    # Frontend SPA (React 19, TypeScript, Tailwind v4, Vite)
├── server/                    # Backend API REST (Cloudflare Workers / Hono, TypeScript)
├── docs/                      # Documentación detallada
│   ├── architecture.md        # Arquitectura del sistema y flujo de datos
│   └── deployment.md          # Guía paso a paso para desplegar en producción
├── pnpm-workspace.yaml        # Configuración del workspace de pnpm
└── package.json               # Scripts y orquestación del monorepo
```

---

## 🌐 Despliegue en Producción

FileFlow está optimizado para desplegarse de forma 100% gratuita con **CI/CD completamente automatizado**:

| Servicio | Plataforma | Workflow | Trigger |
|----------|-----------|----------|---------|
| **Frontend** | GitHub Pages | [`deploy-client.yml`](.github/workflows/deploy-client.yml) | Push a `main` |
| **Backend** | Cloudflare Workers | [`deploy-worker.yml`](.github/workflows/deploy-worker.yml) | Push a `main` (cambios en `server/`) |

### Secretos y Variables Requeridos en GitHub

Configura estos valores en **Settings → Secrets and variables → Actions** de tu repositorio:

#### Secrets (para el backend)
| Nombre | Descripción |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Token de API de Cloudflare con permisos de "Edit Workers" |
| `CLOUDFLARE_ACCOUNT_ID` | ID de tu cuenta de Cloudflare |

#### Variables (para el frontend)
| Nombre | Descripción |
|--------|-------------|
| `VITE_API_BASE_URL` | URL del Worker + `/api` (ej. `https://fileflow-server.<subdominio>.workers.dev/api`) |

Para instrucciones detalladas de configuración, consulta la [**Guía de Despliegue Completa**](docs/deployment.md).

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
