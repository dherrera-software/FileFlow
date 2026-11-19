import { Download, GitBranch } from 'lucide-react'
import { cn } from '../utils/cn'
import { DESKTOP_DOWNLOAD } from '../utils/content'
import { useTranslation } from '../i18n/context'

type DownloadDesktopButtonProps = {
  label?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  showGithub?: boolean
  className?: string
}

const BASE =
  'inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.98]'

const VARIANTS = {
  primary:
    'border border-accent-line bg-accent-fill text-accent-on shadow-primary hover:brightness-110',
  secondary:
    'border border-line bg-surface-raised text-ink hover:border-line-strong hover:bg-surface-sunken',
} as const

const SIZES = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[12.5px]',
  lg: 'px-5 py-2.5 text-[13px]',
} as const

export function DownloadDesktopButton({
  label,
  variant = 'primary',
  size = 'md',
  showDetails = true,
  showGithub = false,
  className,
}: DownloadDesktopButtonProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', className)}>
      <a
        href={DESKTOP_DOWNLOAD.url}
        download={DESKTOP_DOWNLOAD.fileName}
        className={cn(BASE, VARIANTS[variant], SIZES[size])}
      >
        <Download className="size-4 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">
          {label ?? (t('desktop.download') || 'Descargar FileFlow Desktop')}
        </span>
        {showDetails && (
          <>
            <span aria-hidden="true" className="mx-0.5 h-3.5 w-px shrink-0 bg-current opacity-40" />
            <span className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.1em] opacity-75">
              {DESKTOP_DOWNLOAD.platform} · {DESKTOP_DOWNLOAD.size} · v{DESKTOP_DOWNLOAD.version}
            </span>
          </>
        )}
      </a>

      {showGithub && (
        <a
          href={DESKTOP_DOWNLOAD.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 self-center py-1 text-[12.5px] leading-none text-ink-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
        >
          <GitBranch className="size-4" aria-hidden="true" />
          {t('desktop.github') || 'Ver código en GitHub'}
        </a>
      )}
    </div>
  )
}
