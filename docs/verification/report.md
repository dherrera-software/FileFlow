# FileFlow — Verificación visual y funcional (Playwright)

**Fecha:** 2026-11-06  
**Entorno:** Vite dev server `http://localhost:5173` + API local `http://localhost:3000`  
**Navegador:** Chromium 1254 (Playwright 1.65, headless)  
**Datos crudos:** [`report.json`](./report.json)

## Resultado general

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Servidor de desarrollo levantado | ✅ PASS |
| 2 | Página abierta con Playwright | ✅ PASS |
| 3 | Capturas en 1440×900, 1024×768, 768×1024 y 390×844 | ✅ PASS |
| 4 | Sin scroll horizontal en ninguna resolución | ✅ PASS |
| 5 | Contraste WCAG AA (oscuro, claro, botones lima y drawer) | ✅ PASS (0 fallos) |
| 6 | Sidebar como drawer en móvil/tablet y cierre correcto | ✅ PASS |
| 7 | Fondo `.app-ground` sutil y no invasivo | ✅ PASS |
| 8 | Toggle claro/oscuro + clase/atributo + persistencia | ✅ PASS |
| 9 | Sin errores de consola ni textos cortados | ✅ PASS |
| 10 | `build` y `lint` finales | ✅ PASS |

## 1. Capturas de pantalla

Todas las capturas se tomaron con `deviceScaleFactor: 1` y movimiento reducido para evitar capturas a mitad de animación.

| Resolución | Captura | Página completa |
|---|---|---|
| 1440×900 (escritorio grande) | [`desktop-large-1440x900.png`](../screenshots/desktop-large-1440x900.png) | [`…-full.png`](../screenshots/desktop-large-1440x900-full.png) |
| 1024×768 (escritorio medio) | [`desktop-medium-1024x768.png`](../screenshots/desktop-medium-1024x768.png) | [`…-full.png`](../screenshots/desktop-medium-1024x768-full.png) |
| 768×1024 (tablet) | [`tablet-768x1024.png`](../screenshots/tablet-768x1024.png) | [`…-full.png`](../screenshots/tablet-768x1024-full.png) |
| 390×844 (móvil) | [`mobile-390x844.png`](../screenshots/mobile-390x844.png) | [`…-full.png`](../screenshots/mobile-390x844-full.png) |

Capturas de estado adicionales:

- Drawer abierto en móvil: [`mobile-390x844-drawer-open.png`](../screenshots/mobile-390x844-drawer-open.png)
- Drawer abierto en tablet: [`tablet-768x1024-drawer-open.png`](../screenshots/tablet-768x1024-drawer-open.png)
- Tema claro: [`desktop-large-1440x900-light.png`](../screenshots/desktop-large-1440x900-light.png)
- Prueba del arreglo de contraste: [`contrast-fix-before.png`](../screenshots/contrast-fix-before.png) / [`contrast-fix-after.png`](../screenshots/contrast-fix-after.png)

## 2. Scroll horizontal

Medido con `document.documentElement.clientWidth` frente a `scrollWidth` y `document.body.scrollWidth`. También se recorrieron todos los elementos visibles buscando rectángulos fuera del viewport.

| Resolución | `clientWidth` | `scrollWidth` doc | `scrollWidth` body | ¿Scroll horizontal? | Elementos desbordados |
|---|---:|---:|---:|---|---:|
| 1440×900 | 1440 | 1440 | 1440 | No | 0 |
| 1024×768 | 1024 | 1024 | 1024 | No | 0 |
| 768×1024 | 768 | 768 | 768 | No | 0 |
| 390×844 | 390 | 390 | 390 | No | 0 |

Textos cortados por `overflow: hidden/clip`: **0** en las cuatro resoluciones (se excluyeron los `.sr-only`, que recortan a propósito).

## 3. Contraste WCAG AA

Se auditó cada elemento visible con texto directo, calculando el color efectivo (incluyendo fondos translúcidos y colores `oklch`/`oklab`) y el umbral AA según tamaño y peso (4.5:1 normal, 3:1 texto grande).

| Contexto | Elementos auditados | Fallos AA |
|---|---:|---:|
| Oscuro 1440 | 118 | **0** |
| Oscuro 1024 | 118 | **0** |
| Oscuro 768 | 106 | **0** |
| Oscuro 390 | 105 | **0** |
| Drawer tablet | 117 | **0** |
| Drawer móvil | 116 | **0** |
| Claro 1440 | 118 | **0** |

Pares representativos:

| Elemento | Oscuro | Claro | Umbral |
|---|---:|---:|---:|
| H1 del hero | 18.36 | 17.09 | 3.0 (grande) |
| Descripción del hero | 10.57 | 7.54 | 4.5 |
| Eyebrow | 6.45 | 5.08 | 4.5 |
| Botón primario (texto oscuro sobre lima) | 15.33 | 15.33 | 4.5 |
| Píldora «En línea» | 6.17 | 5.55 | 4.5 |
| Texto del footer | 6.45 | 5.08 | 4.5 |
| Formato CSV/TSV (caso más bajo en claro) | — | 4.81 | 4.5 |

El mínimo global fue **4.44** en el número decorativo `01` de 28 px (umbral 3.0). El mínimo en texto normal fue **4.67** en oscuro (`ink-faint` sobre `surface`) y **4.72** en claro.

## 4. Drawer móvil / tablet

Probado a 390×844 y 768×1024:

- El botón hamburguesa es visible y la sidebar fija está oculta.
- Al abrir: `role="dialog"`, `aria-modal="true"`, ancho 340 px, `aria-expanded="true"`, `body { overflow: hidden }` y foco inicial en «Cerrar menú».
- **Escape** cierra el drawer, restaura el scroll y devuelve el foco al botón hamburguesa (`aria-expanded="false"`).
- **Clic en enlace** `#faq` cierra el drawer y actualiza el hash a `#faq`.
- **Clic en el backdrop** cierra el drawer y restaura el scroll.
- Contraste dentro del drawer: 0 fallos.

**Resultado:** ✅ PASS en ambas resoluciones.

## 5. Toggle de tema

| Estado | Clase en `<html>` | `localStorage` | Fondo / texto | `theme-color` |
|---|---|---|---|---|
| Inicial (oscuro) | `dark` | `dark` | `rgb(8,9,10)` / `rgb(244,246,245)` | `#08090a` |
| Tras clic | sin `dark` | `light` | `rgb(245,245,241)` / `rgb(17,19,16)` | `#f5f5f1` |
| Tras recargar | sin `dark` | `light` | `rgb(245,245,241)` / `rgb(17,19,16)` | `#f5f5f1` |

También cambia el `color-scheme` a `light` y el `aria-label` del botón pasa de «Cambiar a modo claro» a «Cambiar a modo oscuro». La preferencia persiste tras recargar.

**Resultado:** ✅ PASS.

## 6. Fondo `.app-ground`

Valores computados en tema oscuro:

- Glow radial lima: `rgba(200, 249, 107, 0.055)`.
- Rejilla de 64 px: `rgba(255, 255, 255, 0.024)` (token `--ground-line` con alpha `0.025`).
- Fondo base: `#08090a`.
- Sin scroll horizontal ni pérdida de contraste; la rejilla se percibe como textura y no compite con el contenido.
- En claro: glow `rgba(26,29,22,0.045)` y líneas `rgba(26,29,22,0.035)`.

**Resultado:** ✅ PASS (sutil y no invasivo).

## 7. Incidencia encontrada y corregida

**Problema:** `--color-ink-faint` no alcanzaba AA en textos pequeños.

- Oscuro `#6c757a`: 4.05 sobre `surface` y 4.24 sobre `canvas` (mínimo 4.5).
- Claro `#83887c`: 3.33 sobre `canvas` y 3.63 sobre blanco.

Afectaba a «ARCHIVO», versión `v1.0.0` y «HECHO PARA SER RÁPIDO», entre otros.

**Corrección aplicada en `client/src/index.css`:**

| Tema | Antes | Después | Contraste después |
|---|---|---|---|
| Oscuro | `#6c757a` | `#767f84` | 4.67 sobre `surface` · 4.88 sobre `canvas` |
| Claro | `#83887c` | `#6a6f64` | 4.72 sobre `canvas` · 5.16 sobre blanco |

La prueba visual reproducible del footer muestra **4.24 → 4.88** (`contrast-fix-before.png` → `contrast-fix-after.png`). La tabla de tokens de `docs/design-system.md` quedó actualizada.

Tras el cambio:

- `pnpm --filter fileflow-client build` ✅
- `pnpm --filter fileflow-client lint` ✅
- Capturas regeneradas con el código final ✅
- Errores de consola: **0** ✅
- Fuente Geist cargada (`document.fonts.check('16px Geist') === true`) ✅

## Observaciones

- No se detectaron elementos desalineados, solapados ni textos cortados en las cuatro resoluciones.
- La sidebar fija de 260 px se mantiene en 1024×768 (≥1024) y el contenido pasa a una columna sin desbordarse.
- Los badges de formato usan colores `oklch`; la auditoría los convierte correctamente antes de calcular contraste para evitar falsos negativos.
- El backend local respondió correctamente, por lo que las capturas muestran el estado «En línea» y los límites reales (25 MB).
