import { useState } from 'react'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { CONVERSION_RULES, PRIVACY } from '../utils/content'
import { CONVERSION_TARGETS } from '../utils/formats'
import type { ConversionPair, FileFormat } from '../utils/formats'
import { FormatBadge } from './ui/FormatBadge'

const DEFAULT_SELECTED_SOURCES: Record<string, FileFormat> = {
  Documentos: 'PDF',
  Imágenes: 'JPG',
  'Hojas de cálculo y datos': 'XLSX',
  Presentaciones: 'PPTX',
  Audio: 'WAV',
  Video: 'MP4',
}

type PrivacySectionProps = {
  onSelectPair?: (pair: ConversionPair) => void
}

export function PrivacySection({ onSelectPair }: PrivacySectionProps = {}) {
  const [selectedSources, setSelectedSources] = useState<Record<string, FileFormat>>(
    DEFAULT_SELECTED_SOURCES,
  )

  const handleSelectSource = (category: string, format: FileFormat) => {
    setSelectedSources((prev) => ({
      ...prev,
      [category]: format,
    }))
  }

  const handleTargetClick = (source: FileFormat, target: string) => {
    if (onSelectPair) {
      onSelectPair({
        source,
        target: target as FileFormat,
      })
      const dropzone = document.getElementById('convert')
      if (dropzone) {
        dropzone.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section id="privacy" aria-labelledby="privacy-heading" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
      <div className="rounded-xl border border-line bg-surface p-5 transition-colors sm:flex sm:items-start sm:gap-5 dark:border-zinc-800 dark:bg-zinc-900/60 shadow-xs">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent-line bg-white text-accent dark:border-accent/40 dark:bg-zinc-800 dark:text-accent">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>

        <div className="mt-3 w-full sm:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h2 id="privacy-heading" className="text-[14px] font-semibold text-ink">
              {PRIVACY.heading}
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent dark:text-accent-strong">
              <Sparkles className="size-3" aria-hidden="true" />
              Haz clic en cualquier formato para ver sus destinos compatibles
            </span>
          </div>

          <p className="mt-1.5 max-w-[78ch] text-[13px] leading-[1.7] text-ink-muted">
            {PRIVACY.body}
          </p>

          {/* Interactive Conversion Matrix by Category */}
          <div className="mt-4 space-y-2.5">
            {CONVERSION_RULES.map((rule) => {
              const selectedSource = selectedSources[rule.label] || rule.sources[0]
              const targets = CONVERSION_TARGETS[selectedSource] || []

              return (
                <div
                  key={rule.label}
                  className="rounded-lg border border-line/70 bg-surface-sunken/40 p-2.5 transition-colors hover:border-line dark:border-zinc-800/80 dark:bg-zinc-900/40"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                    {/* Category Label */}
                    <div className="min-w-[170px] shrink-0 flex items-center justify-between lg:justify-start gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-subtle dark:text-zinc-400">
                        {rule.label}
                      </span>
                      <span className="text-[10px] text-ink-faint bg-surface border border-line/60 rounded px-1.5 py-0.5 dark:bg-zinc-800/60 dark:border-zinc-700/60">
                        {selectedSource} → {targets.length} opciones
                      </span>
                    </div>

                    {/* Sources (Clickable format pills) */}
                    <div className="flex flex-wrap items-center gap-1">
                      {rule.sources.map((source) => {
                        const isSelected = source === selectedSource
                        return (
                          <FormatBadge
                            key={source}
                            format={source}
                            isSelected={isSelected}
                            onClick={() => handleSelectSource(rule.label, source)}
                            title={`Seleccionar ${source} para ver sus formatos destino`}
                            className={!isSelected ? 'opacity-70 hover:opacity-100 hover:scale-105' : ''}
                          />
                        )
                      })}
                    </div>

                    {/* Arrow Divider */}
                    <div className="flex items-center justify-center shrink-0 px-1 text-accent dark:text-accent-strong">
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </div>

                    {/* Dynamic Targets based on selectedSource */}
                    <div className="flex flex-wrap items-center gap-1 min-h-[26px]">
                      {targets.map((target) => (
                        <FormatBadge
                          key={`${selectedSource}->${target}`}
                          format={target}
                          onClick={() => handleTargetClick(selectedSource, target)}
                          title={`Convertir de ${selectedSource} a ${target} (clic para configurar en el conversor)`}
                          className="cursor-pointer hover:ring-1 hover:ring-accent/50 dark:hover:ring-accent transition-all"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
