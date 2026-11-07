import { cn } from '../../utils/cn'

/**
 * Two overlapping pages: the back sheet stays a hairline, the front one takes
 * the current text colour, so the mark works on the lime tile and on canvas.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('relative block size-[21px]', className)} aria-hidden="true">
      <span className="absolute left-0 top-[3px] block h-[15px] w-[12px] rounded-[5px] border border-current opacity-40" />
      <span className="absolute left-[8px] top-0 block h-[15px] w-[12px] rounded-[5px] border-[1.5px] border-current" />
    </span>
  )
}
