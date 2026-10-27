import { ArrowRight, Info, X } from 'lucide-react'
import { CONVERSION_NOTICE } from '../utils/content'

export function ConversionNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-4 mb-4 flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3 text-left dark:border-zinc-800 dark:bg-zinc-800/60"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium text-ink">{CONVERSION_NOTICE.title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{CONVERSION_NOTICE.body}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar aviso de conversión"
        className="shrink-0 rounded-full p-1 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export function PendingConversionHint({ source, target }: { source: string; target: string }) {
  return (
    <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-accent-ink">
      <ArrowRight className="size-3" aria-hidden="true" />
      El próximo archivo {source} se convertirá a {target}
    </p>
  )
}
