import { ArrowRight } from 'lucide-react'
import type { ConversionPair } from '../utils/formats'
import { FormatBadge } from './ui/FormatBadge'
import { cn } from '../utils/cn'

type ConverterCardProps = {
  pair: ConversionPair
  onSelect: (pair: ConversionPair) => void
  className?: string
  wide?: boolean
}

export function ConverterCard({ pair, onSelect, className, wide = false }: ConverterCardProps) {
  return (
    <li className={cn(className)}>
      <button
        type="button"
        onClick={() => onSelect(pair)}
        aria-label={`Convertir de ${pair.source} a ${pair.target}`}
        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface-raised p-3.5 text-left transition-[transform,border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-lift motion-safe:hover:-translate-y-0.5"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FormatBadge format={pair.source} size="sm" className="min-w-[46px] justify-center" />
          <ArrowRight className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
          <FormatBadge format={pair.target} size="sm" className="min-w-[46px] justify-center" />
        </span>
        {wide && (
          <span
            aria-hidden="true"
            className="mx-2 hidden min-w-4 flex-1 border-t border-dashed border-line/70 sm:block"
          />
        )}
        <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-ink-subtle transition-colors group-hover:text-accent">
          Convertir
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </button>
    </li>
  )
}
