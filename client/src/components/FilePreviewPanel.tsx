import { FileText, Film, Music, AlertTriangle } from 'lucide-react'
import { cn } from '../utils/cn'
import { formatFileSize } from '../utils/formats'
import type { FilePreview } from '../hooks/useFilePreview'

interface Props {
  preview: FilePreview
  fileName: string
  fileSize: number
  format: string
  className?: string
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function FilePreviewPanel({ preview, fileName, fileSize, format, className }: Props) {
  const { kind, src, poster, duration, width, height, pages, error } = preview

  if (kind === 'none') return null

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-line bg-surface-raised', className)}>
      <div className="relative flex aspect-[4/3] min-h-[120px] items-center justify-center overflow-hidden bg-surface-sunken">
        {error && (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-danger">
            <AlertTriangle className="size-5" aria-hidden="true" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {kind === 'image' && src && (
          <img
            src={src}
            alt={`Vista previa de ${fileName}`}
            width={width}
            height={height}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        )}

        {kind === 'pdf' && (
          <div className="flex flex-col items-center gap-2 p-4 text-ink-subtle">
            <FileText className="size-8 text-accent" aria-hidden="true" />
            <span className="text-sm font-medium">Documento PDF</span>
            {pages && (
              <span className="font-mono text-[10.5px] tabular-nums">
                · {pages} pág.{pages > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {kind === 'video' && (poster || duration) && (
          <>
            {poster ? (
              <img
                src={poster}
                alt={`Miniatura de ${fileName}`}
                width={width}
                height={height}
                className="max-h-full max-w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 pt-4 text-ink-subtle">
                <Film className="size-5 text-accent" aria-hidden="true" />
                <span className="text-sm font-medium">Video</span>
              </div>
            )}
            {duration && (
              <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10.5px] tabular-nums text-white">
                {formatDuration(duration)}
              </div>
            )}
          </>
        )}

        {kind === 'audio' && (src || duration) && (
          <div className="flex w-full flex-col items-center gap-2 p-4 text-ink-subtle">
            <Music className="size-6 text-accent" aria-hidden="true" />
            <span className="text-sm font-medium">Audio</span>
            {duration && (
              <span className="font-mono text-[10.5px] tabular-nums">{formatDuration(duration)}</span>
            )}
            {src && <audio src={src} controls className="mt-2 w-full max-w-xs" preload="metadata" />}
          </div>
        )}

        {kind === 'document' && (
          <div className="flex flex-col items-center gap-2 p-4 text-ink-subtle">
            <FileText className="size-8 text-accent" aria-hidden="true" />
            <span className="text-sm font-medium uppercase tracking-wide">{format}</span>
          </div>
        )}
      </div>

      <div className="border-t border-line bg-surface/60 p-3">
        <p className="truncate text-sm font-medium text-ink">{fileName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] tabular-nums text-ink-subtle">
          <span>{formatFileSize(fileSize)}</span>
          {width && height && <span>{width}×{height}</span>}
          {pages && <span>{pages} pág.{pages > 1 ? 's' : ''}</span>}
          {duration && <span>{formatDuration(duration)}</span>}
        </div>
      </div>
    </div>
  )
}
