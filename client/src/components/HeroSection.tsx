import { HERO } from '../utils/content'
import { AVAILABLE_CONVERSIONS, SUPPORTED_FORMATS } from '../utils/formats'
import type { ConverterController } from '../hooks/useConverter'
import { FileUploadDropzone } from './FileUploadDropzone'

export function HeroSection({ controller }: { controller: ConverterController }) {
  const maxFileSizeMB = controller.limits?.maxFileSizeMB ?? 25

  const facts = [
    { value: String(SUPPORTED_FORMATS.length), label: 'formatos' },
    { value: String(AVAILABLE_CONVERSIONS.length), label: 'conversiones' },
    { value: `${maxFileSizeMB} MB`, label: 'por archivo' },
  ]

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto max-w-[1180px] px-5 pb-16 pt-12 sm:px-8 sm:pt-16 xl:pb-20 xl:pt-20"
    >
      <div className="grid gap-10 xl:grid-cols-12 xl:items-start xl:gap-12">
        <div className="xl:col-span-5 xl:pt-4">
          <p className="eyebrow inline-flex items-center gap-2">
            <span
              className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]"
              aria-hidden="true"
            />
            {HERO.eyebrow}
          </p>

          <h1
            id="hero-heading"
            className="mt-5 max-w-[13ch] text-balance text-[40px] font-medium leading-[1.03] tracking-[-0.045em] sm:text-[52px] xl:text-[58px]"
          >
            {HERO.title}
          </h1>

          <p className="mt-5 max-w-[54ch] text-[15px] leading-[1.65] text-ink-muted sm:text-[16px]">
            {HERO.description}
          </p>

          <dl className="mt-8 flex flex-wrap items-stretch border-y border-line">
            {facts.map((fact) => (
              <div key={fact.label} className="border-r border-line px-5 py-3.5 first:pl-0 last:border-r-0">
                <dt className="font-mono text-[20px] font-medium leading-none tracking-[-0.02em] tabular-nums text-ink">
                  {fact.value}
                </dt>
                <dd className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-subtle">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="xl:col-span-7">
          <div className="rounded-2xl border border-line bg-surface/85 p-1.5 shadow-panel backdrop-blur-sm sm:p-2">
            <FileUploadDropzone controller={controller} />
          </div>
        </div>
      </div>
    </section>
  )
}
