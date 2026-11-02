import { useState } from 'react'
import { CircleAlert, Download, FileUp, X } from 'lucide-react'
import { cn } from '../utils/cn'
import type { ConverterController } from '../hooks/useConverter'
import { useFilePreview } from '../hooks/useFilePreview'
import { FilePreviewPanel } from './FilePreviewPanel'
import {
  ACCEPTED_EXTENSIONS,
  FORMAT_DESCRIPTIONS,
  SUPPORTED_FORMATS,
  FORMAT_CATEGORY_MAP,
  formatFileSize,
} from '../utils/formats'
import type { FormatCategory } from '../utils/formats'
import { Button } from './ui/Button'
import { FormatBadge } from './ui/FormatBadge'
import { ConversionOptions } from './ConversionOptions'
import { ConversionNotice, PendingConversionHint } from './ConversionNotice'
import { useTranslation } from '../i18n/context'

const SUPPORTED_FORMATS_ID = 'supported-formats'

const CATEGORY_CHIPS: ('Todos' | FormatCategory)[] = [
  'Todos',
  'Documentos',
  'Imágenes',
  'Hojas de cálculo',
  'Presentaciones',
  'Audio',
  'Video',
]

export function FileUploadDropzone({ controller }: { controller: ConverterController }) {
  const { file, format, error, isDragging, notice, pendingPair, actions, inputRef, limitsReady, limits } = controller
  const selected = file && format ? { file, format } : null
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<'Todos' | FormatCategory>('Todos')
  const preview = useFilePreview(file)
  const previewRef = useRef<HTMLDivElement>(null)

  const fileCardClasses = cn(
    'rounded-[10px] border border-line bg-white transition-all duration-normal ease-out-expo dark:border-zinc-800 dark:bg-zinc-900'
  )

  const displayedFormats =
    activeCategory === 'Todos'
      ? SUPPORTED_FORMATS
      : SUPPORTED_FORMATS.filter((f) => FORMAT_CATEGORY_MAP[f] === activeCategory)

  const handleKeyActivate = () => actions.openFilePicker();

  return (
    <section id="convert" aria-labelledby="convert-heading" className="scroll-mt-24">
      <h2 id="convert-heading" className="sr-only">
        {t('common.convertFile')}
      </h2>

      <label htmlFor="file-input" className="sr-only">
        {t('dropzone.selectFile')}
      </label>
      <input
        id="file-input"
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        onChange={actions.onFileInputChange}
        tabIndex={-1}
        className="sr-only"
      />

      <div
        onDragEnter={actions.onDragEnter}
        onDragOver={actions.onDragOver}
        onDragLeave={actions.onDragLeave}
        onDrop={actions.onDrop}
      >
        <div aria-live="polite" className="sr-only" id="drop-announcer" />
        {selected ? (
          <div className="rounded-[10px] border border-line bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-3 px-4 pb-3.5 pt-4 text-left sm:px-5">
              <FormatBadge format={selected.format} size="sm" className="mt-[3px] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{selected.file.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-subtle">
                  {formatFileSize(selected.file.size)}
                  <span aria-hidden="true"> · </span>
                  {FORMAT_DESCRIPTIONS[selected.format]}
                </p>
              </div>
              <button
                type="button"
                onClick={actions.removeFile}
                aria-label={t('dropzone.removeFile', { fileName: selected.file.name })}
                className="shrink-0 rounded-full p-1 text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <FilePreviewPanel
              preview={preview}
              fileName={selected.file.name}
              fileSize={selected.file.size}
              format={selected.format}
              className="mx-3 mt-3 mb-0 rounded-lg"
            />

            <ConversionOptions controller={controller} />

            {controller.conversionError && (
              <div
                role="alert"
                className="mx-4 mb-4 flex flex-col gap-2.5 rounded-lg border border-red-200 bg-red-50/70 px-3.5 py-3 text-left dark:border-red-900/50 dark:bg-red-950/30"
              >
                <div className="flex items-start gap-2.5">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-red-900 dark:text-red-200">{t('errors.conversionFailed')}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-red-800/90 dark:text-red-300/90">{controller.conversionError.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={actions.dismissConversionError}
                    aria-label="Cerrar aviso de error"
                    className="shrink-0 rounded-full p-1 text-red-700/60 transition-colors hover:bg-red-100 hover:text-red-900 dark:text-red-300/90 dark:hover:bg-red-900/40 dark:hover:text-red-100"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                {controller.conversionError.retryable && (
                  <div className="flex justify-end">
                    <Button variant="secondary" size="sm" onClick={actions.convert}>
                      {t('common.retry')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {notice && <ConversionNotice onDismiss={actions.dismissNotice} />}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-5 py-7 text-center dark:border-red-900/50 dark:bg-red-950/30"
          >
            <CircleAlert className="mx-auto size-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            <p className="mt-2.5 text-[14px] font-medium text-red-900 dark:text-red-200">{t('errors.fileConversionFailed')}</p>
            <p className="mt-1 truncate text-[12.5px] font-medium text-red-900/80 dark:text-red-300/80">{error.fileName}</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-[12px] leading-[1.6] text-red-800/80 dark:text-red-300/70">
              {error.message}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={actions.openFilePicker}>
                {t('common.chooseAnotherFile')}
              </Button>
              <Button variant="ghost" size="sm" onClick={actions.dismissError}>
                {t('common.dismiss')}
              </Button>
            </div>
          </div>
        ) : (
          <div
            role="region"
            aria-label={t('dropzone.dropzoneLabel')}
            aria-describedby="drop-instructions supported-formats"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleKeyActivate(); } }}
            className={cn(
              'flex flex-col items-center rounded-3xl border px-6 py-9 text-center transition-all duration-normal ease-out-expo sm:px-8 sm:py-10',
              isDragging
                ? 'border-accent bg-accent-soft'
                : 'border-line bg-white dark:border-zinc-800 dark:bg-zinc-900',
            )}
          >
            <span className="inline-block text-accent">
              {isDragging ? (
                <Download className="size-6 animate-bounce-subtle" aria-hidden="true" />
              ) : (
                <FileUp className="size-6" aria-hidden="true" />
              )}
            </span>

            <p className="mt-4 text-[15.5px] font-medium">
              {isDragging ? t('dropzone.dragDrop') : t('dropzone.dropHere')}
            </p>
            <p
              id="drop-instructions"
              className={cn(
                'mt-1.5 max-w-[40ch] text-[13px] leading-[1.55]',
                isDragging ? 'text-accent-strong dark:text-accent' : 'text-ink-subtle',
              )}
            >
              {isDragging
                ? t('dropzone.dropToCheck')
                : t('dropzone.dropSupports', { formats: 'documentos, imágenes, hojas de cálculo, presentaciones, audio y video' })}
            </p>

            {!limitsReady && (
            <p className="mt-4 text-[13px] text-ink-subtle">{t('common.loading')}…</p>
          )}
          <Button className="mt-5" size="lg" onClick={actions.openFilePicker} disabled={!limitsReady} aria-describedby={SUPPORTED_FORMATS_ID}>
            {t('common.selectFile')}
          </Button>

          {pendingPair && (
            <PendingConversionHint source={pendingPair.source} target={pendingPair.target} />
          )}
        </div>
      </div>

      <div id={SUPPORTED_FORMATS_ID} className="px-4 pb-3 pt-4 text-center">
        {/* Category Chips for Format Discovery */}
        <div role="tablist" aria-label={t('dropzone.formatCategories')} className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
          {CATEGORY_CHIPS.map((cat, idx) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              tabIndex={activeCategory === cat ? 0 : -1}
              onKeyDown={(e) => {
                const items = CATEGORY_CHIPS.length;
                let newIndex = idx;
                if (e.key === 'ArrowRight') { newIndex = (idx + 1) % items; }
                if (e.key === 'ArrowLeft') { newIndex = (idx - 1 + items) % items; }
                if (newIndex !== idx) { setActiveCategory(CATEGORY_CHIPS[newIndex]); }
              }}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <ul role="list" className="flex flex-wrap items-center justify-center gap-1.5 max-h-[140px] overflow-y-auto py-1">
          <li className="mr-1 text-[11.5px] text-ink-subtle">{t('dropzone.accepts')}</li>
          {displayedFormats.map((supported) => (
            <li key={supported}><FormatBadge format={supported} /></li>
          ))}
          <li className="ml-1 text-[11.5px] text-ink-faint">{t('dropzone.maxSize', {maxMB: limits?.maxFileSizeMB || 50})}</li>
        </ul>
      </div>

      <div id={SUPPORTED_FORMATS_ID} className="px-4 pb-3 pt-4 text-center">
      </div>
    </section>
  )
}
