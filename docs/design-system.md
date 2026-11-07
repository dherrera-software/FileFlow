# FileFlow — Sistema de diseño v2

> Rediseño visual completo. Dirección: **app-shell oscuro inspirado en Linear**, disciplina
> tipográfica de **Vercel** y un único acento cromático: **lima eléctrica**.
> El producto es la interfaz: nada de gradientes decorativos ni capturas falsas.

---

## 1. Dirección de arte

| Decisión | Valor |
|---|---|
| Tipo de sitio | Software (herramienta de conversión) |
| Estructura | App-shell con barra lateral fija en escritorio; topbar + drawer en móvil |
| Tema por defecto | Oscuro (toggle a claro disponible) |
| Acento | Lima eléctrica `#c8f96b` sobre casi-negro `#08090a` |
| Tipografía | Geist (display + texto) · Geist Mono (etiquetas técnicas, badges, cifras) |
| Radio | 8 px controles · 12–16 px paneles · pill solo para etiquetas de formato |
| Densidad | Compacta, hairlines de 1 px, jerarquía por contraste y espacio, no por cajas |
| Movimiento | Elevación de 2 px en tarjetas, press de 0.98, subrayados progresivos, transiciones 150–250 ms |
| Prohibido | Violeta/lavanda como acento, degradados arcoíris, tilt, animaciones al hacer scroll |

La referencia es Linear (densidad, paneles, hairlines) y Vercel (escala tipográfica, mono para
datos técnicos), pero el acento lima es propio de FileFlow y evita el look genérico.

---

## 2. Auditoría del código actual

Fuente: `@vercel-labs/web-interface-guidelines` + revisión manual de `client/src`.

### Hallazgos corregidos en este rediseño

| Archivo:línea | Hallazgo | Corrección |
|---|---|---|
| `App.tsx:39` | `hero-wash` se usa pero no existe en CSS | Nuevo fondo `.app-ground` con glow y rejilla sutil |
| `FileUploadDropzone.tsx:183` | `animate-bounce-subtle` no existe | Animación `bounce` nativa o keyframe propio |
| `FileUploadDropzone.tsx:226` | `role="tablist"` sin `tabpanel`, `aria-controls` ni gestión de foco | Cambiado a `role="group"` + `aria-pressed` |
| `PopularConversions.tsx:46` | Filtros sin estado accesible | `aria-pressed` + foco visible |
| `index.css:1` | `@import` de Google Fonts bloquea el render | Fuentes movidas a `<link>` con preconnect |
| `Navbar`, footer, chips, tarjetas | Sin anillo de foco global consistente | `:focus-visible` global con acento |
| `FilePreviewPanel.tsx:36` | `<img>` sin dimensiones | Contenedor con `aspect-ratio` + width/height cuando se conocen |
| `FilePreviewPanel.tsx:46,77` | Iconos decorativos sin `aria-hidden` | Añadido |
| `NetworkStatusBanner.tsx:39,43,51` | Iconos sin `aria-hidden` | Añadido |
| `content.ts:114` | Enlace `#terms` apunta a una sección inexistente | Sustituido por enlaces reales (`#privacy`, `#faq`) |
| `index.html:7` | `theme-color` claro fijo | Actualizado por tema desde el script y `useTheme` |
| `index.css:92` | Fondo del body fijo en blanco | Token `--color-canvas` por tema |
| `PageSkeleton.tsx:5` | Colores oscuros hardcodeados | Tokens de superficie |
| `FileUploadDropzone.tsx:259` | Texto `text-ink-faint` a 11.5 px (contraste insuficiente) | Tokens `ink-subtle`/`ink-faint` recalibrados |

### Comprobaciones que ya pasaban

- Skip link, `aria-live` en errores/avisos, `aria-label` en botones icono.
- `aria-current` en navegación, `aria-pressed` en badges seleccionables.
- `prefers-reduced-motion` global y animaciones solo de `transform`/`opacity`.
- Botones como `<button>` y enlaces como `<a>`; jerarquía `h1 → h2 → h3`.
- Formatos derivados de una única fuente de verdad (`formats.ts`).

### Pendiente fuera de alcance visual

- `i18n` existe pero varios textos siguen hardcodeados en español. El rediseño no inventa
  traducciones nuevas; se conserva el comportamiento actual.
- No hay tests E2E ni de contraste automatizados en el repo. La verificación se hace con
  Playwright en el paso 3.

---

## 3. Tokens

### 3.1 Color — oscuro (por defecto)

| Token | Valor | Uso |
|---|---|---|
| `canvas` | `#08090a` | Fondo de la app |
| `surface` | `#0e1011` | Paneles y sidebar |
| `surface-raised` | `#141617` | Tarjetas, dropzone |
| `surface-sunken` | `#0a0b0c` | Zonas hundidas |
| `line` | `#22262a` | Hairline base |
| `line-strong` | `#31363b` | Hairline en hover/activo |
| `ink` | `#f4f6f5` | Texto principal |
| `ink-muted` | `#b6bec2` | Cuerpo secundario |
| `ink-subtle` | `#8b9499` | Metadatos (contraste AA) |
| `ink-faint` | `#767f84` | Texto secundario tenue (contraste AA) |
| `accent` | `#c8f96b` | Acento, iconos, progreso |
| `accent-fill` | `#c8f96b` | Fondo de botón primario |
| `accent-on` | `#101403` | Texto sobre lima |
| `accent-strong` | `#ddff9a` | Hover |
| `accent-soft` | `rgba(200,249,107,.10)` | Tinte de selección |
| `accent-line` | `rgba(200,249,107,.30)` | Bordes de selección |
| `success` | `#6ee7a8` | Motor activo |
| `danger` | `#ff7a7a` | Errores |
| `info` | `#7cc4ff` | Avisos |

### 3.2 Color — claro

`canvas #f5f5f1`, `surface #ffffff`, `surface-raised #ffffff`, `surface-sunken #edede7`,
`line #e0e0d8`, `line-strong #c9c9c0`, `ink #111310`, `ink-muted #4c5048`,
`ink-subtle #656a60`, `ink-faint #6a6f64`.
En claro el acento funcional es **tinta** (`accent #1a1d16`) para texto y bordes; el lima se
reserva para el botón primario (`accent-fill #c8f96b`, texto `#101403`).

### 3.3 Tipografía

| Rol | Tamaño / peso | Notas |
|---|---|---|
| Display hero | 44–64 px / 500 | `letter-spacing: -0.045em`, `text-wrap: balance` |
| Sección h2 | 28–34 px / 500 | `-0.03em` |
| Card title | 15–16 px / 500 | `-0.01em` |
| Cuerpo | 14–16 px / 400 | `line-height: 1.65` |
| Meta / eyebrows | 11–12 px / 500 | Geist Mono, mayúsculas, tracking `0.14em` |
| Badge de formato | 10–10.5 px / 500 | Geist Mono, tracking `0.08em` |
| Cifras | tabular-nums | Tamaños, porcentajes, contadores |

### 3.4 Espaciado

Base 4 px: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
Contenedor principal: `max-width: 1180px`, padding lateral 20/32 px.
Sidebar: 260 px. Separación entre secciones: 72–96 px en escritorio, 56 px en móvil.

### 3.5 Radios

`6px` chips pequeños · `8px` botones/inputs · `12px` tarjetas · `16px` paneles ·
`999px` badges de formato y píldoras de estado.

### 3.6 Elevación

- `--shadow-panel`: `0 1px 0 rgba(255,255,255,.04) inset, 0 24px 64px -40px rgba(0,0,0,.9)`
- `--shadow-lift`: `0 18px 40px -24px rgba(0,0,0,.8)`
- Botón primario: `0 8px 24px -12px rgba(200,249,107,.45)`

### 3.7 Movimiento

| Interacción | Especificación |
|---|---|
| Hover tarjeta enlazada | `translateY(-2px)`, borde a `line-strong`, 180 ms |
| Hover botón | brillo del fill + borde, 150 ms |
| Press | `scale(.98)`, 100 ms |
| Aparición de panel | opacidad + `translateY(4px)`, 240 ms, solo al montar |
| Progreso | barra lineal, sin rebote |
| Reduced motion | todo a `0.01ms`, sin desplazamientos |

---

## 4. Componentes

### 4.1 Sidebar (escritorio ≥ 1024 px)

- 260 px, fija, `border-right` hairline, superficie ligeramente más clara que el canvas.
- Cabecera: marca en tile lima + wordmark + etiqueta mono `CONVERSOR`.
- CTA primario **Nuevo archivo** (abre el selector real).
- Navegación con iconos de 16 px: Conversor, Conversiones, Cómo funciona, Privacidad, FAQ.
  Estado activo: fondo `accent-soft`, texto `accent`, barra de 2 px a la izquierda.
- Pie: estado del motor (punto verde + “Motor activo”), texto “Gratis · sin cuenta”,
  versión de la app.
- Scroll spy mediante `IntersectionObserver`, sin animaciones atadas al scroll.

### 4.2 Topbar

- Sticky, 56–60 px, `backdrop-blur`, hairline inferior.
- Izquierda: migas `FileFlow / <sección activa>` en móvil muestra la marca.
- Derecha: píldora de estado, toggle de tema con `aria-label`, botón “Convertir” en móvil.
- En móvil (< 1024 px) incluye botón de menú con `aria-expanded` y drawer a pantalla completa.

### 4.3 Hero / workspace

- Rejilla 5/7 en ≥ 1280 px: copy a la izquierda, conversor a la derecha.
- Eyebrow mono con punto lima; h1 de 2–3 líneas; descripción de 52–58 ch.
- Fila de hechos: `9 formatos`, `13 conversiones`, `hasta 25 MB`, separados por hairlines.
- Fondo `.app-ground`: glow radial lima al 5 % + rejilla de 64 px al 2.5 %.

### 4.4 Panel de archivo (dropzone)

- Panel `surface` con borde `line`, radio 16 px, cabecera con título y estado.
- Zona de drop: borde discontinuo, icono en tile, texto principal 16 px, ayuda 13 px,
  botón primario. Estado drag: borde lima, tinte `accent-soft`, icono animado.
- Archivo cargado: fila con badge, nombre truncado, tamaño + descripción, botón quitar.
- Previsualización en marco de relación 4/3, después opciones de destino y CTA.
- Chips de categoría (`Todos`, `Documentos`, …) y fila de formatos aceptados con puntos
  de color por familia; scroll interno máximo 140 px.
- Todos los estados de error/aviso conservan `role="alert"`/`status`.

### 4.5 Tarjetas

- Conversión popular: botón-tarjeta con `source → target`, texto “Convertir”, flecha que se
  desplaza 2 px en hover; rejilla 1/2/3 columnas.
- Cómo funciona: tarjeta con índice mono grande, icono, título y cuerpo; sin cajas anidadas.
- Matriz de privacidad: filas con etiqueta de categoría, origen seleccionable, flecha y
  destinos; hover de fila y foco visible.
- FAQ: acordeón nativo `<details>` con icono `+` que rota a `×`; una columna en móvil.

### 4.6 Footer

- Hairline superior, tres bloques: marca + tagline, columnas de enlaces, estado/versión.
- Sin enlaces muertos. Enlaces con subrayado progresivo.

### 4.7 Responsive

| Ancho | Comportamiento |
|---|---|
| ≥ 1280 | Sidebar + hero 5/7 + tarjetas 3 columnas |
| 1024–1279 | Sidebar + hero apilado o 5/7 ajustado + tarjetas 2 columnas |
| 768–1023 | Topbar con drawer; hero apilado; tarjetas 2 columnas |
| < 768 | Una columna; botones a ancho completo; drawer; sin scroll horizontal |

---

## 5. Criterios de aceptación

- [ ] Ningún desbordamiento horizontal a 1440, 1024, 768 y 390 px.
- [ ] Contraste AA en texto normal y grande en ambos temas.
- [ ] Foco visible en todos los controles; navegación completa por teclado.
- [ ] Subida, selección de destino, conversión y descarga siguen funcionando.
- [ ] Drawer móvil cierra con Escape y al navegar; `aria-expanded` correcto.
- [ ] Tema oscuro por defecto; toggle persiste en `localStorage`.
- [ ] Cero animaciones al hacer scroll; `prefers-reduced-motion` respetado.
- [ ] Sin enlaces `#` muertos ni textos de relleno.
