import { cn } from '../../utils/cn'

/**
 * FileFlow App Icon / BrandMark:
 * Dos documentos en blanco puro con esquinas dobladas y flechas de ciclo de conversión.
 * El fondo degradado cyan/azul se gestiona de forma nativa e infalible vía CSS (.brand-tile)
 * evitando fallos de resolución de linearGradient SVG al navegar por hash routes (#/feedback).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-full block', className)}
      aria-hidden="true"
    >
      {/* Resplandor radial suave en la esquina superior izquierda */}
      <radialGradient id="ffBrandGlow" cx="25%" cy="20%" r="65%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <rect x="0" y="0" width="512" height="512" fill="url(#ffBrandGlow)" pointerEvents="none" />

      {/* 1. Documento Superior Izquierdo */}
      <path
        d="M 112 128 A 18 18 0 0 1 130 110 L 224 110 L 268 154 L 268 282 A 18 18 0 0 1 250 300 L 130 300 A 18 18 0 0 1 112 282 Z"
        fill="#ffffff"
      />
      <path
        d="M 224 110 L 224 146 A 8 8 0 0 0 232 154 L 268 154 Z"
        fill="#a5f3fc"
      />

      {/* 2. Documento Inferior Derecho */}
      <path
        d="M 232 230 A 18 18 0 0 1 250 212 L 344 212 L 388 256 L 388 384 A 18 18 0 0 1 370 402 L 250 402 A 18 18 0 0 1 232 384 Z"
        fill="#ffffff"
      />
      <path
        d="M 344 212 L 344 248 A 8 8 0 0 0 352 256 L 388 256 Z"
        fill="#bae6fd"
      />

      {/* 3. Flecha de ciclo superior derecha (horaria) */}
      <path
        d="M 294 140 C 334 136, 368 158, 376 196"
        stroke="#ffffff"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d="M 344 198 L 378 206 L 392 174"
        stroke="#ffffff"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4. Flecha de ciclo inferior izquierda (horaria) */}
      <path
        d="M 206 372 C 166 376, 132 354, 124 316"
        stroke="#ffffff"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d="M 156 314 L 122 306 L 108 338"
        stroke="#ffffff"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
