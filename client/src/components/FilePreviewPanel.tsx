import { FileText, Film, Music, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatFileSize } from '../utils/formats';
import type { FilePreview } from '../hooks/useFilePreview';

interface Props {
  preview: FilePreview;
  fileName: string;
  fileSize: number;
  format: string;
  className?: string;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function FilePreviewPanel({ preview, fileName, fileSize, format, className }: Props) {
  const { kind, src, poster, duration, width, height, pages, error } = preview;

  if (kind === 'none') return null;

  return (
    <div className={cn('relative rounded-xl overflow-hidden border bg-white dark:bg-zinc-900', className)}>
      <div className="aspect-[4/3] relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden min-h-[120px] flex items-center justify-center">
        {error && (
          <div className="flex flex-col items-center gap-2 text-red-500 p-4 text-center">
            <AlertTriangle className="size-5" />
            <span className="text-xs">{error}</span>
          </div>
        )}

        {kind === 'image' && src && (
          <img
            src={src}
            alt={`Preview de ${fileName}`}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
          />
        )}

        {kind === 'pdf' && (
          <div className="flex flex-col items-center gap-2 text-ink-subtle p-4">
            <FileText className="size-8 text-accent" />
            <span className="text-sm font-medium">Documento PDF</span>
            {pages && <span className="text-xs">· {pages} pág.{pages > 1 ? 's' : ''}</span>}
          </div>
        )}

        {kind === 'video' && (poster || duration) && (
          <>
            {poster ? (
              <img
                src={poster}
                alt={`Poster de ${fileName}`}
                className="max-w-full max-h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-subtle pt-4">
                <Film className="size-5 text-accent" />
                <span className="text-sm font-medium">Video</span>
              </div>
            )}
            {duration && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(duration)}
              </div>
            )}
          </>
        )}

        {kind === 'audio' && (src || duration) && (
          <div className="flex flex-col items-center gap-2 text-ink-subtle w-full p-4">
            <Music className="size-6 text-accent" />
            <span className="text-sm font-medium">Audio</span>
            {duration && <span className="text-xs">{formatDuration(duration)}</span>}
            {src && (
              <audio
                src={src}
                controls
                className="w-full max-w-xs mt-2"
                preload="metadata"
              />
            )}
          </div>
        )}

        {kind === 'document' && (
          <div className="flex flex-col items-center gap-2 text-ink-subtle p-4">
            <FileText className="size-8" />
            <span className="text-sm font-medium uppercase tracking-wide">{format}</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-zinc-50/50 dark:bg-zinc-800/50">
        <p className="font-medium truncate text-sm">{fileName}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-ink-subtle">
          <span>{formatFileSize(fileSize)}</span>
          {width && height && <span>{width}×{height}</span>}
          {pages && <span>{pages} pág.{pages > 1 ? 's' : ''}</span>}
          {duration && <span>{formatDuration(duration)}</span>}
        </div>
      </div>
    </div>
  );
}
