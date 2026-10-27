import { useState } from 'react'
import { CircleAlert, Download, FileUp, X } from 'lucide-react'
import { cn } from '../lib/cn'
import type { ConverterController } from '../hooks/useConverter'
import {
  ACCEPTED_EXTENSIONS,
  FORMAT_DESCRIPTIONS,
  MAX_FILE_SIZE_MB,
  SUPPORTED_FORMATS,
  FORMAT_CATEGORY_MAP,
  formatFileSize,
} from '../lib/formats'
import type { FormatCategory } from '../lib/formats'
import { Button } from './ui/Button'
import { FormatBadge } from './ui/FormatBadge'
import { ConversionOptions } from './ConversionOptions'
import { ConversionNotice, PendingConversionHint } from './ConversionNotice'

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

/**
 * Cuatro estados, un solo componente: vacío, arrastrando, seleccionado (con opciones
 * de conversión) y error. Soltar un segundo archivo reemplaza el actual.
 */
export function FileUploadDropzone({ controller }: { controller: ConverterController }) {
  const { file, format, error, isDragging, notice, pendingPair, actions, inputRef } = controller
  const selected = file && format ? { file, format } : null
  const [activeCategory, setActiveCategory] = useState<'Todos' | FormatCategory>('Todos')

  const displayedFormats =
    activeCategory === 'Todos'
      ? SUPPORTED_FORMATS
      : SUPPORTED_FORMATS.filter((f) => FORMAT_CATEGORY_MAP[f] === activeCategory)

  return (
    <section id="convert" aria-labelledby="convert-heading" className="scroll-mt-24">
      <h2 id="convert-heading" className="sr-only">
        Convertir un archivo
      </h2>

      <label htmlFor="file-input" className="sr-only">
        Elige un archivo para convertir
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
                aria-label={`Eliminar ${selected.file.name}`}
                className="shrink-0 rounded-full p-1 text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <ConversionOptions controller={controller} />

            {controller.conversionError && (
              <div
                role="alert"
                className="mx-4 mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/70 px-3.5 py-3 text-left dark:border-red-900/50 dark:bg-red-950/30"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-red-900 dark:text-red-200">Error en la conversión</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-red-800/90 dark:text-red-300/90">{controller.conversionError}</p>
                </div>
                <button
                  type="button"
                  onClick={actions.dismissConversionError}
                  aria-label="Cerrar aviso de error"
                  className="shrink-0 rounded-full p-1 text-red-700/60 transition-colors hover:bg-red-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-100"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
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
            <p className="mt-2.5 text-[14px] font-medium text-red-900 dark:text-red-200">No se puede convertir este archivo</p>
            <p className="mt-1 truncate text-[12.5px] font-medium text-red-900/80 dark:text-red-300/80">{error.fileName}</p>
            <p className="mx-auto mt-1 max-w-[46ch] text-[12px] leading-[1.6] text-red-800/80 dark:text-red-300/70">
              {error.message}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={actions.openFilePicker}>
                Elegir otro archivo
              </Button>
              <Button variant="ghost" size="sm" onClick={actions.dismissError}>
                Descartar
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-col items-center rounded-3xl border px-6 py-9 text-center transition-colors sm:px-8 sm:py-10',
              isDragging
                ? 'border-accent bg-accent-soft'
                : 'border-line bg-white dark:border-zinc-800 dark:bg-zinc-900',
            )}
          >
            <span className="inline-block text-accent">
              {isDragging ? (
                <Download className="size-6" aria-hidden="true" />
              ) : (
                <FileUp className="size-6" aria-hidden="true" />
              )}
            </span>

            <p className="mt-4 text-[15.5px] font-medium">
              {isDragging ? 'Suelta el archivo para seleccionarlo' : 'Arrastra un archivo aquí'}
            </p>
            <p
              className={cn(
                'mt-1.5 max-w-[40ch] text-[13px] leading-[1.55]',
                isDragging ? 'text-accent-strong dark:text-accent' : 'text-ink-subtle',
              )}
            >
              {isDragging
                ? 'Suelta para verificar el formato y ver las opciones de conversión.'
                : 'o elígelo desde tu dispositivo — soporta documentos, imágenes, datos, presentaciones, audio y video.'}
            </p>

            <Button className="mt-5" size="lg" onClick={actions.openFilePicker} aria-describedby={SUPPORTED_FORMATS_ID}>
              Seleccionar archivo
            </Button>

            {pendingPair && (
              <PendingConversionHint source={pendingPair.source} target={pendingPair.target} />
            )}
          </div>
        )}

        <div id={SUPPORTED_FORMATS_ID} className="px-4 pb-3 pt-4 text-center">
          {/* Category Chips for Format Discovery */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5">
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat}
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

          <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-[140px] overflow-y-auto py-1">
            <span className="mr-1 text-[11.5px] text-ink-subtle">Acepta</span>
            {displayedFormats.map((supported) => (
              <FormatBadge key={supported} format={supported} />
            ))}
            <span className="ml-1 text-[11.5px] text-ink-faint">hasta {MAX_FILE_SIZE_MB} MB</span>
          </div>
        </div>
      </div>
    </section>
  )
}
