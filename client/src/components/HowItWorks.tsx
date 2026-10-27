import { BRAND, HOW_IT_WORKS_STEPS } from '../utils/content'

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="border-y border-line bg-surface transition-colors dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <h2 id="how-it-works-heading" className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
          Cómo funciona
        </h2>

        <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-line bg-white p-5 transition-colors dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent-line bg-accent-soft text-[11px] font-semibold text-accent-ink dark:border-accent/30 dark:bg-accent/15">
                  {index + 1}
                </span>
                <h3 className="text-[14px] font-semibold text-ink">{step.title}</h3>
              </div>
              <p className="mt-3 text-[13px] leading-[1.65] text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="sr-only">{BRAND.tagline}</p>
      </div>
    </section>
  )
}
