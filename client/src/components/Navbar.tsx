import { Moon, Sun } from 'lucide-react'
import { BRAND, FOOTER_COLUMNS, NAV_LINKS } from '../utils/content'
import { useTheme } from '../hooks/useTheme'
import { BrandMark } from './ui/BrandMark'

export function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const sectionLinks = NAV_LINKS.filter((link) => !link.isActive)

  return (
    <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
      <header className="mx-auto flex max-w-[1004px] items-center gap-4 sm:gap-8 rounded-full border border-line bg-white/75 py-2.5 pl-5 pr-2.5 shadow-nav backdrop-blur-xl transition-colors dark:border-zinc-800 dark:bg-zinc-900/80">
        <a href="#top" className="flex items-center gap-2.5 rounded-full">
          <BrandMark />
          <span className="text-[14.5px] font-semibold tracking-[-0.01em]">{BRAND.name}</span>
        </a>

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.isActive ? 'page' : undefined}
              className={
                link.isActive
                  ? 'rounded-full bg-accent-soft px-3.5 py-1.5 text-[13px] font-medium text-accent-ink'
                  : 'rounded-full px-3.5 py-1.5 text-[13px] text-ink-subtle transition-colors hover:bg-accent-soft hover:text-accent-ink'
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden text-[12.5px] text-ink-subtle lg:block">Gratis, sin cuenta</span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className="flex size-9 items-center justify-center rounded-full border border-line bg-surface text-ink-subtle transition-all hover:border-accent hover:bg-accent-soft hover:text-accent-ink active:scale-95 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300"
          >
            {isDark ? (
              <Sun className="size-4 text-amber-400" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>

          <a
            href="#convert"
            className="rounded-full border border-ink bg-ink px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:border-[#27272a] hover:bg-[#27272a] dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Comenzar a convertir
          </a>
        </div>
      </header>

      <nav aria-label="Secciones" className="mx-auto mt-3 flex max-w-[1004px] items-center gap-1 md:hidden">
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-1.5 text-[12.5px] text-ink-subtle transition-colors hover:text-accent-ink"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-white transition-colors dark:border-zinc-800/80 dark:bg-[#0c0c0e]">
      <div className="mx-auto max-w-[1120px] px-4 py-11 sm:px-6">
        <div className="flex flex-col gap-9 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[300px]">
            <a href="#top" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="text-[14.5px] font-semibold tracking-[-0.01em]">{BRAND.name}</span>
            </a>
            <p className="mt-3 text-[12.5px] leading-[1.7] text-ink-subtle">{BRAND.tagline}</p>
          </div>

          <div className="flex gap-14">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                  {column.heading}
                </h2>
                <ul className="mt-3 space-y-2 text-[12.5px]">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-ink-muted transition-colors hover:text-accent">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[12px] text-ink-subtle dark:border-zinc-800">
          <span>
            © {year} {BRAND.name} · Conversor de archivos seguro
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-subtle dark:border-zinc-800 dark:bg-zinc-900">
            <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" aria-hidden="true" />
            Motor de conversión activo
          </span>
        </div>
      </div>
    </footer>
  )
}
