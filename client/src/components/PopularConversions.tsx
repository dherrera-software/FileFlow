import { useState } from 'react'
import type { ConversionPair, FormatCategory } from '../utils/formats'
import { POPULAR_CONVERSIONS, FORMAT_CATEGORY_MAP } from '../utils/formats'
import { ConverterCard } from './ConverterCard'
import { cn } from '../utils/cn'

type PopularConversionsProps = {
  onSelectPair: (pair: ConversionPair) => void
}

/** Only categories that actually contain quick-access conversions. */
const CATEGORY_TABS: ('Todos' | FormatCategory)[] = [
  'Todos',
  ...Array.from(
    new Set<FormatCategory>(
      POPULAR_CONVERSIONS.map((pair) => FORMAT_CATEGORY_MAP[pair.source]),
    ),
  ),
]

export function PopularConversions({ onSelectPair }: PopularConversionsProps) {
  const [activeCategory, setActiveCategory] = useState<'Todos' | FormatCategory>('Todos')

  const filteredPairs =
    activeCategory === 'Todos'
      ? POPULAR_CONVERSIONS
      : POPULAR_CONVERSIONS.filter(
          (pair) => FORMAT_CATEGORY_MAP[pair.source] === activeCategory,
        )

  return (
    <section
      id="converters"
      aria-labelledby="converters-heading"
      className="mx-auto max-w-[1180px] scroll-mt-24 px-5 pb-16 sm:px-8"
    >
      <div className="flex flex-col gap-5 border-t border-line pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Accesos rápidos</p>
          <h2
            id="converters-heading"
            className="mt-2 text-[28px] font-medium tracking-[-0.03em] text-ink sm:text-[32px]"
          >
            Conversiones populares
          </h2>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-[1.65] text-ink-muted">
            Haz clic en una opción para configurarla directamente en el conversor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={cn(
                'rounded-md border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors',
                activeCategory === cat
                  ? 'border-accent-line bg-accent-soft text-accent'
                  : 'border-line bg-surface-sunken text-ink-subtle hover:border-line-strong hover:text-ink',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filteredPairs.map((pair) => (
          <ConverterCard key={`${pair.source}-${pair.target}`} pair={pair} onSelect={onSelectPair} />
        ))}
      </ul>

      <p className="mt-6 text-center font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-subtle">
        Generado dinámicamente a partir de los {POPULAR_CONVERSIONS.length} accesos rápidos compatibles
      </p>
    </section>
  )
}
