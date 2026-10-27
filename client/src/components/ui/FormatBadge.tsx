import { cn } from '../../lib/cn'
import { FORMAT_BADGE_STYLES } from '../../lib/formats'
import type { FileFormat } from '../../lib/formats'

const SIZES = {
  xs: 'px-2 py-0.5 text-[10.5px]',
  sm: 'px-2.5 py-1 text-[10.5px]',
} as const

export type FormatBadgeSize = keyof typeof SIZES

type FormatBadgeProps = {
  format: FileFormat | string
  size?: FormatBadgeSize
  className?: string
}

/**
 * Semantic format badge. Pastel fill, deep text, clean rounded pill styling.
 */
export function FormatBadge({ format, size = 'xs', className }: FormatBadgeProps) {
  const badgeStyle =
    FORMAT_BADGE_STYLES[format as FileFormat] ||
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center text-center rounded-full font-semibold tracking-[0.06em]',
        SIZES[size],
        badgeStyle,
        className,
      )}
    >
      {format}
    </span>
  )
}
