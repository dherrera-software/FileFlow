import { cn } from '../../lib/cn'

/**
 * Two overlapping pages: the front sheet takes the accent, the back one stays
 * a hairline. Pure CSS so there is no logo asset to keep in sync.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('relative block size-[21px]', className)} aria-hidden="true">
      <span className="absolute left-0 top-[3px] block h-[15px] w-[12px] rounded-[5px] border border-ink/30" />
      <span className="absolute left-[8px] top-0 block h-[15px] w-[12px] rounded-[5px] border-[1.5px] border-accent" />
    </span>
  )
}
