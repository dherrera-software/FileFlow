import { useState, useRef } from 'react'
import { CircleAlert, Download, FileUp, X } from 'lucide-react'
import { cn } from '../utils/cn'
import type { ConverterController } from '../hooks/useConverter'
import { useFilePreview } from '../hooks/useFilePreview'
import { FilePreviewPanel } from './FilePreviewPanel'
import {
  ACCEPTED_EXTENSIONS,
  FORMAT_CATEGORY_MAP,
  FORMAT_DESCRIPTIONS,
  SUPPORTED_FORMATS,
  formatFileSize,
} from '../utils/formats'
import type { FormatCategory } from '../utils/formats'
import { Button } from './ui/Button'
import { FormatBadge } from './ui/FormatBadge'
import { ConversionOptions } from './ConversionOptions'
import { ConversionNotice, PendingConversionHint } from './ConversionNotice'
import { useTranslation } from '../i18n/context'

const SUPPORTED_FORMATS_ID = 'supported-formats'

/** Only categories with at least one Worker-convertible source format. */
const CATEGORY_CHIPS: ('Todos' | FormatCategory)[] = [
  'Todos',
  ...Array.from(
    new Set<FormatCategory>(SUPPORTED_FORMATS.map((format) => FORMAT_CATEGORY_MAP[format])),
  ),
]

const CATEGORY_DOT: Record<FormatCategory, string> = {
  Documentos: 'bg-accent',
  Imágenes: 'bg-amber-400',
  'Hojas de cálculo': 'bg-sky-400',
  Presentaciones: 'bg-orange-400',
  Audio: 'bg-fuchsia-400',
  Video: 'bg-rose-400',
}

type StatusTone = 'muted' | 'accent' | 'danger'

const STATUS_STYLES: Record<StatusTone, { pill: string; dot: string }> = {
  muted: { pill: 'border-line bg-surface-raised text-ink-subtle', dot: 'bg-ink-faint' },
  accent: { pill: 'border-accent-line bg-accent-soft text-accent', dot: 'bg-accent' },
  danger: { pill: 'border-danger/40 bg-danger/10 text-danger', dot: 'bg-danger' },
}

export function FileUploadDropzone({ controller }: { controller: ConverterController }) {
  const { file, format, error, isDragging, notice, pendingPair, actions, inputRef, limitsReady, limits } = controller
  const selected = file && format ? { file, format } : null
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<'Todos' | FormatCategory>('Todos')
  const preview = useFilePreview(file)
  const previewRef = useRef<HTMLDivElement>(null)

  const displayedFormats =
    activeCategory === 'Todos'
      ? SUPPORTED_FORMATS
      : SUPPORTED_FORMATS.filter((f) => FORMAT_CATEGORY_MAP[f] === activeCategory)

  const status: { label: string; tone: StatusTone } = controller.isConverting
    ? { label: 'Convirtiendo', tone: 'accent' }
    : error
      ? { label: 'Revisar archivo', tone: 'danger' }
      : selected
        ? { label: 'Archivo cargado', tone: 'accent' }
        : isDragging
          ? { label: 'Suelta para cargar', tone: 'accent' }
          : { label: 'Listo', tone: 'muted' }

  const handleKeyActivate = () => actions.openFilePicker()

  return (
    <section id="convert" aria-labelledby="convert-heading" className="scroll-mt-24">
      <label htmlFor="file-input" className="sr-only">
        {t('dropzone.selectFile') || 'Elige un archivo para convertir'}
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

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
              Archivo
            </p>
            <h2
              id="convert-heading"
              className="mt-0.5 truncate text-[15px] font-medium tracking-[-0.01em] text-ink"
            >
              {t('common.convertFile') || 'Convertir un archivo'}
            </h2>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em]',
              STATUS_STYLES[status.tone].pill,
            )}
          >
            <span className={cn('size-1.5 rounded-full', STATUS_STYLES[status.tone].dot)} aria-hidden="true" />
            {status.label}
          </span>
        </header>

        <div
          className="p-3 sm:p-4"
          onDragEnter={actions.onDragEnter}
          onDragOver={actions.onDragOver}
          onDragLeave={actions.onDragLeave}
          onDrop={actions.onDrop}
        >
          <div aria-live="polite" className="sr-only" id="drop-announcer" />
          {selected ? (
            <div ref={previewRef} className="overflow-hidden rounded-xl border border-line bg-surface-raised">
              <div className="flex items-start gap-3 border-b border-line px-4 py-3.5 text-left">
                <FormatBadge format={selected.format} size="sm" className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">{selected.file.name}</p>
                  <p className="mt-0.5 text-[11.5px] tabular-nums text-ink-subtle">
                    {formatFileSize(selected.file.size)}
                    <span aria-hidden="true"> · </span>
                    {FORMAT_DESCRIPTIONS[selected.format]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={actions.removeFile}
                  aria-label={t('dropzone.removeFile', { fileName: selected.file.name }) || `Eliminar ${selected.file.name}`}
                  className="shrink-0 rounded-md p-1 text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <FilePreviewPanel
                preview={preview}
                fileName={selected.file.name}
                fileSize={selected.file.size}
                format={selected.format}
                className="mx-3 mt-3 mb-0"
              />

              <ConversionOptions controller={controller} />

              {controller.conversionError && (
                <div
                  role="alert"
                  className="mx-4 mb-4 flex flex-col gap-2.5 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-3 text-left"
                >
                  <div className="flex items-start gap-2.5">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium text-danger">
                        {t('errors.conversionFailed') || 'Error en la conversión'}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                        {controller.conversionError.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={actions.dismissConversionError}
                      aria-label="Cerrar aviso de error"
                      className="shrink-0 rounded-md p-1 text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  {controller.conversionError.retryable && (
                    <div className="flex justify-end">
                      <Button variant="secondary" size="sm" onClick={actions.convert}>
                        {t('common.retry') || 'Reintentar'}
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
              className="rounded-xl border border-dashed border-danger/40 bg-danger/5 px-5 py-7 text-center"
            >
              <CircleAlert className="mx-auto size-5 text-danger" aria-hidden="true" />
              <p className="mt-2.5 text-[14px] font-medium text-ink">
                {t('errors.fileConversionFailed') || 'No se puede convertir este archivo'}
              </p>
              <p className="mt-1 truncate text-[12.5px] font-medium text-ink-muted">{error.fileName}</p>
              <p className="mx-auto mt-1 max-w-[46ch] text-[12px] leading-[1.6] text-ink-subtle">
                {error.message}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button variant="secondary" size="sm" onClick={actions.openFilePicker}>
                  {t('common.chooseAnotherFile') || 'Elegir otro archivo'}
                </Button>
                <Button variant="ghost" size="sm" onClick={actions.dismissError}>
                  {t('common.dismiss') || 'Descartar'}
                </Button>
              </div>
            </div>
          ) : (
            <div
              role="region"
              aria-label={t('dropzone.dropzoneLabel') || 'Zona para arrastrar y soltar archivos'}
              aria-describedby="drop-instructions supported-formats"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleKeyActivate()
                }
              }}
              className={cn(
                'flex flex-col items-center rounded-xl border border-dashed px-5 py-8 text-center transition-[background-color,border-color] duration-200 sm:px-7 sm:py-10',
                isDragging
                  ? 'border-accent bg-accent-soft'
                  : 'border-line-strong bg-surface-raised/60 hover:border-line-strong',
              )}
            >
              <span
                className={cn(
                  'flex size-11 items-center justify-center rounded-xl border transition-colors',
                  isDragging
                    ? 'border-accent-line bg-accent-soft text-accent'
                    : 'border-line bg-surface text-accent',
                )}
              >
                {isDragging ? (
                  <Download className="size-5 animate-drop-bob" aria-hidden="true" />
                ) : (
                  <FileUp className="size-5" aria-hidden="true" />
                )}
              </span>

              <p className="mt-4 text-[16px] font-medium tracking-[-0.01em] text-ink">
                {isDragging
                  ? (t('dropzone.dragDrop') || 'Suelta el archivo para seleccionarlo')
                  : (t('dropzone.dropHere') || 'Arrastra un archivo aquí')}
              </p>
              <p
                id="drop-instructions"
                className={cn(
                  'mt-1.5 max-w-[42ch] text-[13px] leading-[1.6]',
                  isDragging ? 'text-accent' : 'text-ink-subtle',
                )}
              >
                {isDragging
                  ? (t('dropzone.dropToCheck') || 'Suelta para verificar el formato y ver las opciones de conversión.')
                  : (t('dropzone.dropSupports', { formats: 'documentos de texto, imágenes y hojas de cálculo/datos' }) ||
                    'o elígelo desde tu dispositivo — soporta documentos de texto, imágenes y hojas de cálculo/datos.')}
              </p>

              {!limitsReady && (
                <p className="mt-4 text-[13px] text-ink-subtle">{t('common.loading') || 'Cargando'}…</p>
              )}
              <Button
                className="mt-5 w-full sm:w-auto"
                size="lg"
                onClick={actions.openFilePicker}
                disabled={!limitsReady}
                aria-describedby={SUPPORTED_FORMATS_ID}
              >
                {t('common.selectFile') || 'Seleccionar archivo'}
              </Button>

              {pendingPair && (
                <PendingConversionHint source={pendingPair.source} target={pendingPair.target} />
              )}
            </div>
          )}
        </div>

        <div id={SUPPORTED_FORMATS_ID} className="border-t border-line px-4 pb-4 pt-3.5 text-center">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-subtle">Formatos</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-subtle">
              hasta {limits?.maxFileSizeMB ?? 25} MB
            </p>
          </div>

          {/* Category filters: a plain button group, not a tablist. */}
          <div
            role="group"
            aria-label={t('dropzone.formatCategories') || 'Categorías de formato'}
            className="mt-2 flex flex-wrap items-center justify-center gap-1.5"
          >
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={cn(
                  'rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors',
                  activeCategory === cat
                    ? 'border-accent-line bg-accent-soft text-accent'
                    : 'border-line bg-surface-sunken text-ink-subtle hover:border-line-strong hover:text-ink',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <ul
            role="list"
            className="mt-2.5 flex max-h-[140px] flex-wrap content-start items-center justify-center gap-1.5 overflow-y-auto py-0.5"
          >
            <li className="mr-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-subtle">
              {t('dropzone.accepts') || 'Acepta'}
            </li>
            {displayedFormats.map((supported) => (
              <li key={supported} className="inline-flex items-center gap-1">
                <span
                  className={cn('size-1.5 rounded-full', CATEGORY_DOT[FORMAT_CATEGORY_MAP[supported]])}
                  aria-hidden="true"
                />
                <FormatBadge format={supported} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
