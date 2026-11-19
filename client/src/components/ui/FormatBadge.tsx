import { cn } from '../../utils/cn'
import { FORMAT_BADGE_CATEGORY } from '../../utils/formats'
import type { FileFormat } from '../../utils/formats'

const SIZES = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-[10.5px]',
} as const

export type FormatBadgeSize = keyof typeof SIZES

type FormatBadgeProps = {
  format: FileFormat | string
  size?: FormatBadgeSize
  className?: string
  onClick?: () => void
  isSelected?: boolean
  title?: string
  ariaLabel?: string
  asButton?: boolean
}

/**
 * Semantic format badge. Translucent fill and colored border, matching the
 * FileFlow Desktop badge palette.
 * Interactive badges become real buttons with `aria-pressed` when selectable.
 */
export function FormatBadge({
  format,
  size = 'xs',
  className,
  onClick,
  isSelected,
  title,
  ariaLabel,
  asButton,
}: FormatBadgeProps) {
  const category = FORMAT_BADGE_CATEGORY[format as FileFormat] ?? 'neutral'

  const baseClasses = cn(
    'format-badge inline-flex items-center justify-center rounded-md border font-mono font-medium tracking-[0.08em] text-center transition-colors',
    SIZES[size],
    (onClick || asButton) && 'cursor-pointer select-none',
    isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
    className,
  )

  if (onClick || asButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        data-cat={category}
        title={title || `Formato ${format}`}
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        className={baseClasses}
      >
        {format}
      </button>
    )
  }

  return (
    <span title={title} data-cat={category} className={baseClasses}>
      {format}
    </span>
  )
}
