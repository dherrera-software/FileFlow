import { APP_VERSION, BRAND, FOOTER_COLUMNS } from '../utils/content'
import { BrandMark } from './ui/BrandMark'

export function Footer({ statusOnline = true }: { statusOnline?: boolean }) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[280px]">
            <a href="#top" className="flex items-center gap-2.5 rounded-lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-fill text-accent-on">
                <BrandMark />
              </span>
              <span className="text-[14px] font-medium tracking-[-0.01em]">{BRAND.name}</span>
            </a>
            <p className="mt-3 text-[12.5px] leading-[1.7] text-ink-subtle">{BRAND.tagline}</p>
          </div>

          <nav aria-label="Enlaces del pie de página" className="grid grid-cols-2 gap-10">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-subtle">
                  {column.heading}
                </h2>
                <ul className="mt-3 space-y-2 text-[12.5px]">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="relative inline-block text-ink-muted transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-all after:duration-200 hover:text-ink hover:after:w-full"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-subtle">
              <span
                className={`size-1.5 rounded-full ${statusOnline ? 'bg-success' : 'bg-danger'}`}
                aria-hidden="true"
              />
              {statusOnline ? 'Motor activo' : 'Sin conexión'}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              v{APP_VERSION}
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[11.5px] text-ink-subtle">
          <span>
            © {year} {BRAND.name} · Conversor de archivos seguro
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Hecho para ser rápido
          </span>
        </div>
      </div>
    </footer>
  )
}
