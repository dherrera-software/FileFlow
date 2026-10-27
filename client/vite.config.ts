// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// IMPORTANTE: Para GitHub Pages, 'base' debe coincidir con el nombre de tu repositorio:
// Ej: https://<TU_USUARIO>.github.io/<NOMBRE_DEL_REPO>/ -> base: '/<NOMBRE_DEL_REPO>/'
// Si tu repositorio se llama diferente de 'FileFlow', ajusta '/FileFlow/' aquí.
const repoName = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/FileFlow/'

export default defineConfig({
  // En producción usa el prefijo del repositorio para GitHub Pages; en desarrollo local usa '/'
  base: process.env.NODE_ENV === 'production' ? repoName : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})