import { ArrowRight } from 'lucide-react'
import type { ConversionPair } from '../lib/formats'
import { FormatBadge } from './ui/FormatBadge'

type ConverterCardProps = {
  pair: ConversionPair
  onSelect: (pair: ConversionPair) => void
}

export function ConverterCard({ pair, onSelect }: ConverterCardProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(pair)}
        aria-label={`Convertir de ${pair.source} a ${pair.target}`}
        className="group inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white p-1 transition-colors hover:border-accent hover:bg-accent-soft dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-accent dark:hover:bg-accent-soft"
      >
        <FormatBadge format={pair.source} size="sm" className="min-w-[46px] justify-center" />
        <ArrowRight
          className="size-3 text-ink-faint transition-colors group-hover:text-accent dark:text-zinc-500"
          aria-hidden="true"
        />
        <FormatBadge format={pair.target} size="sm" className="min-w-[46px] justify-center" />
      </button>
    </li>
  )
}
