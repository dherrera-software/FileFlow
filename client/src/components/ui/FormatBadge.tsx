import { cn } from '../../utils/cn'
import { FORMAT_BADGE_STYLES } from '../../utils/formats'
import type { FileFormat } from '../../utils/formats'

const SIZES = {
  xs: 'px-2 py-0.5 text-[10.5px]',
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
  asButton?: boolean
}

/**
 * Semantic format badge. Pastel fill, deep text, clean rounded pill styling.
 * Supports interactive button state and active/selected highlight.
 */
export function FormatBadge({
  format,
  size = 'xs',
  className,
  onClick,
  isSelected,
  title,
  asButton,
}: FormatBadgeProps) {
  const badgeStyle =
    FORMAT_BADGE_STYLES[format as FileFormat] ||
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'

  const baseClasses = cn(
    'inline-flex items-center justify-center text-center rounded-full font-semibold tracking-[0.06em] transition-all',
    SIZES[size],
    badgeStyle,
    onClick &&
      'cursor-pointer hover:scale-105 active:scale-95 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    isSelected &&
      'ring-2 ring-accent dark:ring-accent-strong ring-offset-1 dark:ring-offset-zinc-900 shadow-sm font-bold scale-105 z-10',
    className,
  )

  if (onClick || asButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title || `Formato ${format}`}
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
