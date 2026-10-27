import { useState } from 'react'
import type { ConversionPair, FormatCategory } from '../lib/formats'
import { POPULAR_CONVERSIONS, FORMAT_CATEGORY_MAP } from '../lib/formats'
import { ConverterCard } from './ConverterCard'
import { cn } from '../lib/cn'

type PopularConversionsProps = {
  onSelectPair: (pair: ConversionPair) => void
}

const CATEGORY_TABS: ('Todos' | FormatCategory)[] = [
  'Todos',
  'Documentos',
  'Imágenes',
  'Hojas de cálculo',
  'Presentaciones',
  'Audio',
  'Video',
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
      className="mx-auto max-w-[1120px] px-4 pb-16 sm:px-6"
    >
      <div className="flex flex-col items-center justify-center text-center gap-1.5 border-t border-line pt-8 dark:border-zinc-800">
        <h2 id="converters-heading" className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
          Conversiones populares
        </h2>
        <p className="text-[13px] text-ink-subtle">
          Haz clic en una opción para configurarla directamente en el conversor.
        </p>

        {/* Category Filter Tabs */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1 text-[12px] font-medium transition-all',
                activeCategory === cat
                  ? 'bg-ink text-surface dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-surface-sunken text-ink-subtle hover:text-ink hover:bg-line dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-2.5">
        {filteredPairs.map((pair) => (
          <ConverterCard key={`${pair.source}-${pair.target}`} pair={pair} onSelect={onSelectPair} />
        ))}
      </ul>

      <p className="mt-5 text-center text-[12px] text-ink-faint">
        Generado dinámicamente a partir de los {POPULAR_CONVERSIONS.length} accesos rápidos compatibles.
      </p>
    </section>
  )
}
