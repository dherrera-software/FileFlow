import { Plus } from 'lucide-react'
import { FAQ_ITEMS } from '../utils/content'

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24 border-y border-line bg-surface">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
        <p className="eyebrow">Dudas frecuentes</p>
        <h2
          id="faq-heading"
          className="mt-2 text-[28px] font-medium tracking-[-0.03em] text-ink sm:text-[32px]"
        >
          Preguntas frecuentes
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
          {FAQ_ITEMS.filter((item) => item.enabled).map((item) => (
            <details key={item.question} className="group border-t border-line py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13.5px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus
                  className="size-4 shrink-0 text-ink-subtle transition-[transform,color] duration-200 group-open:rotate-45 group-open:text-accent"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-2.5 max-w-[52ch] text-[13px] leading-[1.65] text-ink-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
