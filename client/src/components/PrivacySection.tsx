import { useState } from 'react'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { CONVERSION_RULES, PRIVACY } from '../utils/content'
import { CONVERSION_TARGETS, isFormatEnabled } from '../utils/formats'
import type { ConversionPair, FileFormat } from '../utils/formats'
import { FormatBadge } from './ui/FormatBadge'

const DEFAULT_SELECTED_SOURCES: Record<string, FileFormat> = {
  Documentos: 'TXT',
  Imágenes: 'JPG',
  'Hojas de cálculo y datos': 'CSV',
}

/** Leaves only categories/sources that the Cloudflare Worker can convert. */
const ENABLED_CONVERSION_RULES = CONVERSION_RULES.map((rule) => ({
  ...rule,
  sources: rule.sources.filter((source) => isFormatEnabled(source)),
})).filter((rule) => rule.sources.length > 0)

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
    if (!onSelectPair) return

    onSelectPair({
      source,
      target: target as FileFormat,
    })

    const dropzone = document.getElementById('convert')
    if (dropzone) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      dropzone.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    }
  }

  return (
    <section id="privacy" aria-labelledby="privacy-heading" className="mx-auto max-w-[1180px] scroll-mt-24 px-5 py-16 sm:px-8">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-accent-line bg-accent-soft text-accent">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Privacidad</p>
                <h2
                  id="privacy-heading"
                  className="mt-2 text-[22px] font-medium tracking-[-0.02em] text-ink sm:text-[24px]"
                >
                  {PRIVACY.heading}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-accent">
                <Sparkles className="size-3" aria-hidden="true" />
                Explora los destinos
              </span>
            </div>

            <p className="mt-3 max-w-[78ch] text-[13px] leading-[1.7] text-ink-muted">
              {PRIVACY.body}
            </p>

            <div className="mt-6 space-y-2">
              {ENABLED_CONVERSION_RULES.map((rule) => {
                const selectedSource = selectedSources[rule.label] || rule.sources[0]
                const targets = CONVERSION_TARGETS[selectedSource] || []

                return (
                  <div
                    key={rule.label}
                    className="rounded-lg border border-line bg-surface-sunken/50 p-2.5 transition-colors hover:border-line-strong hover:bg-surface-sunken"
                  >
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                      <div className="flex min-w-[170px] shrink-0 items-center justify-between gap-2 lg:justify-start">
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-subtle">
                          {rule.label}
                        </span>
                        <span className="rounded-full border border-line bg-surface px-2 py-0.5 font-mono text-[9px] tabular-nums text-ink-subtle">
                          {selectedSource} → {targets.length}
                        </span>
                      </div>

                      <div
                        role="group"
                        aria-label={`Formatos de origen para ${rule.label}`}
                        className="flex flex-wrap items-center gap-1"
                      >
                        {rule.sources.map((source) => {
                          const isSelected = source === selectedSource
                          return (
                            <FormatBadge
                              key={source}
                              format={source}
                              isSelected={isSelected}
                              onClick={() => handleSelectSource(rule.label, source)}
                              title={`Seleccionar ${source} para ver sus formatos destino`}
                              ariaLabel={`Seleccionar ${source} para ver sus formatos destino`}
                              className={!isSelected ? 'opacity-60 hover:opacity-100' : ''}
                            />
                          )
                        })}
                      </div>

                      <div className="flex shrink-0 items-center justify-center px-1 text-accent">
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </div>

                      <div
                        role="group"
                        aria-label={`Destinos compatibles desde ${selectedSource}`}
                        className="flex min-h-[26px] flex-wrap items-center gap-1"
                      >
                        {targets.map((target) => (
                          <FormatBadge
                            key={`${selectedSource}->${target}`}
                            format={target}
                            onClick={() => handleTargetClick(selectedSource, target)}
                            title={`Convertir de ${selectedSource} a ${target}`}
                            ariaLabel={`Convertir de ${selectedSource} a ${target}`}
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
      </div>
    </section>
  )
}
