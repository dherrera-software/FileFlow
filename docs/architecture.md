# Arquitectura del Sistema — FileFlow

## 1. Visión General

FileFlow es una plataforma de conversión de archivos multipropósito diseñada con una arquitectura desacoplada basada en un monorepo gestionado con `pnpm`:

- **Cliente Web (`client/`)**: SPA moderna construida con React 19, TypeScript y Tailwind CSS v4, empaquetada mediante Vite. Alojada estáticamente en **GitHub Pages**.
- **Servidor API (`server/`)**: Servicio RESTful serverless desplegado en **Cloudflare Workers** (usando TypeScript, Hono y Node.js compat). Procesa peticiones API y conversiones en memoria.

---

## 2. Flujo de Datos en Producción

```
+-------------------------------------------------------------+
|                Cliente Web (GitHub Pages)                   |
|   https://<usuario>.github.io/<repo>/                       |
|                                                             |
|   1. Usuario selecciona archivo origen y formato destino    |
|   2. Validación de tipo y tamaño (máx. 25 MB) en navegador |
+------------------------------+------------------------------+
                               |
                               | HTTPS POST multipart/form-data
                               | (Header Origin validado vía CORS)
                               v
+-------------------------------------------------------------+
|             API Backend (Cloudflare Workers)                |
|   https://fileflow-server.<subdominio>.workers.dev          |
|                                                             |
|   3. Middleware de CORS y lectura de payload en memoria     |
|   4. Enrutamiento hacia el motor de conversión en Worker:   |
|      - Formatos tabulares/datos: ExcelJS / Fast-XML-Parser  |
|      - Documentos texto: PDF-lib / Marked / Turndown        |
|      - Formatos pesados externos: 501 Not Implemented       |
|   5. Generación de respuesta binaria directa en streaming   |
+------------------------------+------------------------------+
                               |
                               | HTTPS Response (Stream / Blob binario)
                               | Content-Disposition: attachment; filename=...
                               v
+-------------------------------------------------------------+
|                Navegador del Usuario                        |
|                                                             |
|   6. Recepción del Blob y disparo de descarga automática    |
|   7. Operación sin persistencia en disco ni residuos        |
+-------------------------------------------------------------+
```

### Resumen del Flujo:
```
Cliente (GitHub Pages) ---> API (Cloudflare Workers) ---> Conversión ---> Descarga en Navegador
```

---

## 3. Seguridad y Privacidad en el Flujo
1. **Restricción CORS**: El backend valida que la cabecera `Origin` provenga exclusivamente del dominio de `CLIENT_URL` (GitHub Pages) en modo producción.
2. **Ciclo de Vida Efímero**: Los archivos subidos no se indexan ni se conservan; el servicio de limpieza (`cleanupService`) elimina los temporales de `uploads/` y `outputs/` automáticamente cada 10 minutos.
3. **Validación Estricta**: Cada par de formatos es validado contra la matriz central de conversiones antes de procesar el archivo.
