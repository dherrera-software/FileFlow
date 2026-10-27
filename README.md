# FileFlow

![CI](https://github.com/<TU_USUARIO>/<REPO_NAME>/actions/workflows/deploy-client.yml/badge.svg)
![Backend](https://img.shields.io/badge/backend-Render-blue)
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
pnpm dev:server  # Backend en http://localhost:3000
```

---

## 🏗️ Estructura del Monorepo

```
FileFlow/
├── .github/workflows/         # Automatización CI/CD (GitHub Actions)
│   └── deploy-client.yml      # Despliegue automático de frontend a GitHub Pages
├── client/                    # Frontend SPA (React 19, TypeScript, Tailwind v4, Vite)
├── server/                    # Backend API REST (Express, TypeScript NodeNext ESM)
├── docs/                      # Documentación detallada
│   ├── architecture.md        # Arquitectura del sistema y flujo de datos
│   └── deployment.md          # Guía paso a paso para desplegar en producción
├── pnpm-workspace.yaml        # Configuración del workspace de pnpm
├── render.yaml                # Blueprint para despliegue automatizado en Render
└── package.json               # Scripts y orquestación del monorepo
```

---

## 🌐 Despliegue en Producción

FileFlow está optimizado para desplegarse de forma 100% gratuita:

- **Frontend**: Alojado en **GitHub Pages** mediante GitHub Actions.
- **Backend**: Alojado en **Render** (Web Service, plan Free).

Para instrucciones detalladas de configuración de variables de entorno, CORS y dominios, consulta la [**Guía de Despliegue Completa**](docs/deployment.md).

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.
