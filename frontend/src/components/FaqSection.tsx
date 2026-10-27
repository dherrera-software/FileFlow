import { FAQ_ITEMS } from '../lib/content'

export function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="border-y border-line bg-surface transition-colors dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6">
        <h2 id="faq-heading" className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
          Preguntas frecuentes
        </h2>

        <dl className="mt-4 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="border-t border-ink/10 pt-4 dark:border-zinc-800">
              <dt className="text-[13.5px] font-medium text-ink">{item.question}</dt>
              <dd className="mt-1.5 max-w-[46ch] text-[12.5px] leading-[1.7] text-ink-muted">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
