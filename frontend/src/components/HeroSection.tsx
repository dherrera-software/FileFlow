import { HERO } from '../lib/content'
import type { ConverterController } from '../hooks/useConverter'
import { FileUploadDropzone } from './FileUploadDropzone'

export function HeroSection({ controller }: { controller: ConverterController }) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto max-w-[1120px] px-4 pb-14 pt-14 sm:px-6 sm:pt-[76px]"
    >
      <div className="mx-auto max-w-[780px] text-center">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-accent-strong">
          {HERO.eyebrow}
        </p>
        <h1
          id="hero-heading"
          className="mx-auto mt-5 max-w-[17ch] text-balance text-[34px] font-medium leading-[1.08] tracking-[-0.04em] sm:text-[48px] lg:text-[60px]"
        >
          {HERO.title}
        </h1>
        <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-[1.62] text-ink-muted sm:text-[16px]">
          {HERO.description}
        </p>
      </div>

      <div className="relative mx-auto mt-9 max-w-[700px] sm:mt-11">
        <div className="rounded-xl border border-line bg-white/70 p-2.5 shadow-plate backdrop-blur-xl transition-colors dark:border-zinc-800 dark:bg-zinc-900/60">
          <FileUploadDropzone controller={controller} />
        </div>
      </div>
    </section>
  )
}
