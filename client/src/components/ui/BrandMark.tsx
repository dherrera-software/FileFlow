import { cn } from '../../utils/cn'

/**
 * FileFlow App Icon / BrandMark:
 * Dos documentos en blanco puro con esquinas dobladas en gradiente Hyper Cyan/Sky Blue
 * y flechas de ciclo de conversión sobre el contenedor squircle oficial de FileFlow.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="16 16 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-full object-contain', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ffBrandBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="ffBrandBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#67e8f9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="ffFold1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        <linearGradient id="ffFold2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <radialGradient id="ffTopGlow" cx="25%" cy="20%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Squircle Tile */}
      <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#ffBrandBg)" />
      <rect x="16" y="16" width="480" height="480" rx="108" fill="none" stroke="url(#ffBrandBorder)" strokeWidth="4" />
      <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#ffTopGlow)" />

      {/* 2. Top-Left Document */}
      <path
        d="M 112 128 A 18 18 0 0 1 130 110 L 224 110 L 268 154 L 268 282 A 18 18 0 0 1 250 300 L 130 300 A 18 18 0 0 1 112 282 Z"
        fill="#ffffff"
      />
      <path
        d="M 224 110 L 224 146 A 8 8 0 0 0 232 154 L 268 154 Z"
        fill="url(#ffFold1)"
      />

      {/* 3. Bottom-Right Document */}
      <path
        d="M 232 230 A 18 18 0 0 1 250 212 L 344 212 L 388 256 L 388 384 A 18 18 0 0 1 370 402 L 250 402 A 18 18 0 0 1 232 384 Z"
        fill="#ffffff"
      />
      <path
        d="M 344 212 L 344 248 A 8 8 0 0 0 352 256 L 388 256 Z"
        fill="url(#ffFold2)"
      />

      {/* 4. Top-Right Curved Cycle Arrow */}
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

      {/* 5. Bottom-Left Curved Cycle Arrow */}
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
