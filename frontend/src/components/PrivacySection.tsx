import { ArrowRight, ShieldCheck } from 'lucide-react'
import { CONVERSION_RULES, PRIVACY } from '../lib/content'
import { FormatBadge } from './ui/FormatBadge'

export function PrivacySection() {
  return (
    <section id="privacy" aria-labelledby="privacy-heading" className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
      <div className="rounded-xl border border-line bg-surface p-5 transition-colors sm:flex sm:items-start sm:gap-5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent-line bg-white text-accent dark:border-accent/40 dark:bg-zinc-800 dark:text-accent">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>

        <div className="mt-3 sm:mt-0">
          <h2 id="privacy-heading" className="text-[14px] font-semibold text-ink">
            {PRIVACY.heading}
          </h2>
          <p className="mt-1.5 max-w-[78ch] text-[13px] leading-[1.7] text-ink-muted">{PRIVACY.body}</p>

          <ul className="mt-3.5 space-y-1.5">
            {CONVERSION_RULES.map((rule) => (
              <li key={rule.label} className="flex flex-wrap items-center gap-1">
                {rule.sources.map((source) => (
                  <FormatBadge key={source} format={source} />
                ))}
                <ArrowRight className="mx-0.5 size-3 text-ink-faint dark:text-zinc-500" aria-hidden="true" />
                {rule.targets.map((target) => (
                  <FormatBadge key={target} format={target} />
                ))}
                <span className="ml-1.5 text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
                  {rule.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
