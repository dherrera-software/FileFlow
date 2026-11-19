import { FolderArchive, MonitorDown, ShieldCheck, WifiOff } from 'lucide-react'
import { useTranslation } from '../i18n/context'
import { DESKTOP_DOWNLOAD, DESKTOP_RELEASES_URL } from '../utils/content'
import { DownloadDesktopButton } from './DownloadDesktopButton'

export function DesktopSection() {
  const { t } = useTranslation()

  const benefits = [
    {
      icon: WifiOff,
      title: t('desktop.benefitOfflineTitle') || '100 % offline',
      body: t('desktop.benefitOfflineBody') || 'Tus archivos nunca salen del equipo y funciona sin conexión.',
    },
    {
      icon: FolderArchive,
      title: t('desktop.benefitFormatsTitle') || '50 formatos · 476 rutas',
      body: t('desktop.benefitFormatsBody') || 'DOCX, PDF, HEIC, XLSX, PPTX, MP3, MP4, ZIP y mucho más.',
    },
    {
      icon: ShieldCheck,
      title: t('desktop.benefitEngineTitle') || 'Motor Rust nativo',
      body: t('desktop.benefitEngineBody') || 'Conversiones complejas sin depender del backend de la web.',
    },
  ]

  return (
    <section id="desktop" aria-labelledby="desktop-heading" className="scroll-mt-24 border-y border-line bg-surface">
      <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
        <div className="grid gap-10 xl:grid-cols-12 xl:items-start xl:gap-12">
          <div className="xl:col-span-5">
            <p className="eyebrow inline-flex items-center gap-2">
              <MonitorDown className="size-3.5" aria-hidden="true" />
              {t('desktop.eyebrow') || 'Versión de escritorio'}
            </p>

            <h2
              id="desktop-heading"
              className="mt-4 w-full max-w-[30ch] text-balance text-[28px] font-medium leading-[1.15] tracking-[-0.03em] text-ink sm:max-w-none sm:text-[34px]"
            >
              {t('desktop.title') || 'Cuando la conversión necesita más, usa FileFlow Desktop'}
            </h2>

            <p className="mt-4 max-w-[52ch] text-[14px] leading-[1.7] text-ink-muted">
              {t('desktop.description') ||
                'La misma experiencia FileFlow con un motor nativo en tu equipo: convierte documentos, imágenes, hojas de cálculo, presentaciones, audio, vídeo y comprimidos sin subir nada a un servidor.'}
            </p>

            <div className="mt-7">
              <DownloadDesktopButton size="lg" showGithub />
            </div>

            <p className="mt-4 max-w-[52ch] text-[11.5px] leading-[1.45] text-ink-subtle">
              {t('desktop.downloadBody', {
                platform: DESKTOP_DOWNLOAD.platform,
                size: DESKTOP_DOWNLOAD.size,
                version: DESKTOP_DOWNLOAD.version,
              }) || 'Instalador para Windows · 3,5 MB · versión 0.1.0.'}
            </p>
          </div>

          <div className="w-full min-w-0 xl:col-span-7">
            <div className="grid w-full items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {benefits.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex h-full w-full flex-col rounded-xl border border-line bg-surface-raised p-5">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-accent">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-[13px] font-medium text-ink">{title}</h3>
                  <p className="mt-1.5 text-[12px] leading-[1.6] text-ink-subtle">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 w-full rounded-xl border border-line bg-surface-raised p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-subtle">
                {t('desktop.developersTitle') || 'Para desarrolladores'}
              </p>
              <p className="mt-2 text-[12.5px] leading-[1.65] text-ink-muted">
                {t('desktop.developersBody') ||
                  'FileFlow Desktop es de código abierto: revisa la arquitectura Tauri/Rust, abre incidencias o contribuye en su repositorio.'}{' '}
                <a
                  href={DESKTOP_DOWNLOAD.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline decoration-accent-line underline-offset-4 transition-colors hover:brightness-110"
                >
                  github.com/dherrera-software/FileFlow-Desktop
                </a>
              </p>
              <a
                href={DESKTOP_RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center font-mono text-[10px] uppercase tracking-[0.12em] text-ink-subtle transition-colors hover:text-ink"
              >
                {t('desktop.releases') || 'Ver todas las versiones'} ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
