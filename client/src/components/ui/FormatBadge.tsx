import { cn } from '../../utils/cn'
import { FORMAT_BADGE_STYLES } from '../../utils/formats'
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
 * Semantic format badge. Pastel fill, deep text, pill only for format labels.
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
  const badgeStyle =
    FORMAT_BADGE_STYLES[format as FileFormat] ||
    'bg-surface-sunken text-ink-muted'

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-full border border-transparent font-mono font-medium tracking-[0.08em] text-center transition-colors',
    SIZES[size],
    badgeStyle,
    (onClick || asButton) && 'cursor-pointer select-none',
    isSelected && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
    className,
  )

  if (onClick || asButton) {
    return (
      <button
        type="button"
        onClick={onClick}
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
    <span title={title} className={baseClasses}>
      {format}
    </span>
  )
}
