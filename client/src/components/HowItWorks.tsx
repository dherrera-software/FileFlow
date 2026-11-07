import { Download, SlidersHorizontal, Upload } from 'lucide-react'
import { HOW_IT_WORKS_STEPS } from '../utils/content'

const STEP_ICONS = [Upload, SlidersHorizontal, Download] as const

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-heading" className="scroll-mt-24 border-y border-line bg-surface">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
        <p className="eyebrow">Flujo de trabajo</p>
        <h2
          id="how-it-works-heading"
          className="mt-2 text-[28px] font-medium tracking-[-0.03em] text-ink sm:text-[32px]"
        >
          Cómo funciona
        </h2>

        <ol className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Upload
            return (
              <li key={step.title} className="bg-surface-raised p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[28px] leading-none tracking-[-0.04em] text-ink-faint">
                    0{index + 1}
                  </span>
                  <Icon className="size-5 text-accent" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-[15px] font-medium tracking-[-0.01em] text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-ink-muted">{step.body}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
