# DEV_LOG — FileFlow

## 2026-11-06 · Sistema de diseño v2 (implementación visual)

- `index.css`: tokens v2 (lima `#c8f96b` sobre casi-negro `#08090a`), tema claro
  equivalente, Geist + Geist Mono, sombras `panel/lift/primary`, foco global
  `:focus-visible`, fondo `.app-ground` (glow + rejilla de 64 px) y animación
  `drop-bob`.
- `index.html`: fuentes Geist por `<link>` con preconnect, `theme-color` por tema y
  arranque en oscuro por defecto (persistencia en `localStorage`).
- App shell nuevo: `AppShell` con sidebar fija de 260 px, topbar sticky, drawer móvil
  con `aria-expanded`, cierre con Escape, foco atrapado y restaurado, y scroll spy con
  `IntersectionObserver`.
- Rediseñados: `HeroSection` (rejilla 5/7 en ≥1280), `FileUploadDropzone`,
  `FilePreviewPanel`, `PopularConversions`/`ConverterCard`, `HowItWorks`,
  `PrivacySection`, `FaqSection` (acordeón nativo), `Footer`, `PageSkeleton`,
  `NetworkStatusBanner`, `Button`, `FormatBadge` y `Skeleton`.
- Auditoría aplicada: iconos decorativos con `aria-hidden`, filtros con
  `aria-pressed`, `role="group"` en chips, dimensiones de imágenes, `#terms`
  sustituido por `#faq`, tokens en lugar de colores fijos, sin `hero-wash` ni
  `animate-bounce-subtle`.
- Verificado: `pnpm --filter fileflow-client build` y `pnpm --filter fileflow-client lint`
  pasan.

### Verificación Playwright (2026-11-06)

- Capturas en 1440×900, 1024×768, 768×1024 y 390×844, más estados de drawer y
  tema claro. Evidencia en `docs/screenshots/` e informe en
  `docs/verification/report.md` (+ `report.json`).
- Sin scroll horizontal ni textos cortados en ninguna resolución.
- Contraste AA: 0 fallos en oscuro, claro y drawer (118/118/106/105/117/116
  elementos auditados según contexto).
- Drawer: abre con foco atrapado, cierra con Escape, backdrop y enlaces; restaura
  foco y scroll; `aria-expanded` correcto.
- Tema: `dark` por defecto, toggle cambia clase/`color-scheme`/`theme-color`,
  persiste en `localStorage` tras recargar.
- `.app-ground`: glow `rgba(200,249,107,.055)` y rejilla de 64 px con líneas al
  2.4 % de opacidad; sutil, sin afectar legibilidad.
- Incidencia corregida: `--color-ink-faint` no llegaba a AA en textos pequeños.
  Oscuro `#6c757a → #767f84` (4.05 → 4.67 sobre surface) y claro
  `#83887c → #6a6f64` (3.33 → 4.72 sobre canvas). Comparativa en
  `docs/screenshots/contrast-fix-before.png` / `contrast-fix-after.png`.
- `pnpm --filter fileflow-client build` y `lint` pasan con el código final; 0
  errores de consola y Geist cargada.
