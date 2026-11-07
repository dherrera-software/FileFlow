import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ChevronRight,
  FileInput,
  FilePlus2,
  HelpCircle,
  LayoutGrid,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Workflow,
  X,
} from 'lucide-react'
import { APP_VERSION, BRAND } from '../utils/content'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../utils/cn'
import { BrandMark } from './ui/BrandMark'

const NAV_ITEMS = [
  { section: 'convert', href: '#convert', label: 'Conversor', icon: FileInput },
  { section: 'converters', href: '#converters', label: 'Conversiones', icon: LayoutGrid },
  { section: 'how-it-works', href: '#how-it-works', label: 'Cómo funciona', icon: Workflow },
  { section: 'privacy', href: '#privacy', label: 'Privacidad', icon: ShieldCheck },
  { section: 'faq', href: '#faq', label: 'FAQ', icon: HelpCircle },
] as const

type AppShellProps = {
  activeSection: string
  isOnline: boolean
  isBackendReachable: boolean
  onNewFile: () => void
  children: ReactNode
}

function BrandTile() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-fill text-accent-on">
      <BrandMark />
    </span>
  )
}

export function AppShell({
  activeSection,
  isOnline,
  isBackendReachable,
  onNewFile,
  children,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const activeItem = NAV_ITEMS.find((item) => item.section === activeSection) ?? NAV_ITEMS[0]
  const statusOnline = isOnline && isBackendReachable

  useEffect(() => {
    if (!menuOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        return
      }

      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), summary, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    desktopQuery.addEventListener('change', onDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      desktopQuery.removeEventListener('change', onDesktop)
      previouslyFocused?.focus()
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#convert"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-accent-fill focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-accent-on"
      >
        Saltar al conversor
      </a>

      <Sidebar activeSection={activeSection} statusOnline={statusOnline} onNewFile={onNewFile} />

      <div className="lg:pl-[260px]">
        <Topbar
          activeLabel={activeItem.label}
          menuOpen={menuOpen}
          statusOnline={statusOnline}
          onOpenMenu={() => setMenuOpen(true)}
          onNewFile={onNewFile}
        />
        {children}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="absolute inset-y-0 left-0 flex w-[min(88vw,340px)] animate-slide-in-from-left flex-col border-r border-line bg-surface shadow-panel"
          >
            <div className="flex h-16 items-center justify-between gap-3 border-b border-line px-4">
              <a
                href="#top"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg"
              >
                <BrandTile />
                <span className="flex flex-col leading-tight">
                  <span className="text-[14px] font-medium tracking-[-0.01em]">{BRAND.name}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-subtle">
                    Conversor
                  </span>
                </span>
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface-raised text-ink-subtle transition-colors hover:border-line-strong hover:text-ink"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="px-4 pt-5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onNewFile()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-fill px-3 py-2.5 text-[13px] font-medium text-accent-on shadow-primary transition-colors hover:brightness-105 active:scale-[0.98]"
              >
                <FilePlus2 className="size-4" aria-hidden="true" />
                Nuevo archivo
              </button>
            </div>

            <nav aria-label="Navegación móvil" className="mt-6 flex-1 px-3">
              <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
                Secciones
              </p>
              <ul className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = item.section === activeSection
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? 'location' : undefined}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13px] transition-colors',
                          isActive
                            ? 'bg-accent-soft text-accent'
                            : 'text-ink-subtle hover:bg-surface-raised hover:text-ink',
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        {item.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="border-t border-line p-4">
              <p className="flex items-center gap-2 text-[11.5px] text-ink-subtle">
                <span
                  className={cn('size-1.5 rounded-full', statusOnline ? 'bg-success' : 'bg-danger')}
                  aria-hidden="true"
                />
                {statusOnline ? 'Motor activo' : 'Sin conexión'} · Gratis, sin cuenta
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                v{APP_VERSION}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Sidebar({
  activeSection,
  statusOnline,
  onNewFile,
}: {
  activeSection: string
  statusOnline: boolean
  onNewFile: () => void
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
        <a href="#top" className="flex items-center gap-2.5 rounded-lg">
          <BrandTile />
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-medium tracking-[-0.01em]">{BRAND.name}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-subtle">
              Conversor
            </span>
          </span>
        </a>
      </div>

      <div className="px-4 pt-5">
        <button
          type="button"
          onClick={onNewFile}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-fill px-3 py-2.5 text-[13px] font-medium text-accent-on shadow-primary transition-colors hover:brightness-105 active:scale-[0.98]"
        >
          <FilePlus2 className="size-4" aria-hidden="true" />
          Nuevo archivo
        </button>
      </div>

      <nav aria-label="Navegación principal" className="mt-6 flex-1 overflow-y-auto px-3">
        <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
          Secciones
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.section === activeSection
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-ink-subtle hover:bg-surface-raised hover:text-ink',
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent"
                    />
                  )}
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <p className="flex items-center gap-2 text-[11.5px] text-ink-subtle">
          <span
            className={cn('size-1.5 rounded-full', statusOnline ? 'bg-success' : 'bg-danger')}
            aria-hidden="true"
          />
          {statusOnline ? 'Motor activo' : 'Sin conexión'}
        </p>
        <p className="mt-1.5 text-[11.5px] text-ink-subtle">Gratis · sin cuenta</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          v{APP_VERSION}
        </p>
      </div>
    </aside>
  )
}

function Topbar({
  activeLabel,
  menuOpen,
  statusOnline,
  onOpenMenu,
  onNewFile,
}: {
  activeLabel: string
  menuOpen: boolean
  statusOnline: boolean
  onOpenMenu: () => void
  onNewFile: () => void
}) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:h-[60px] lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-subtle transition-colors hover:border-line-strong hover:text-ink lg:hidden"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>

        <a href="#top" className="flex items-center gap-2 rounded-lg lg:hidden">
          <BrandTile />
          <span className="text-[13.5px] font-medium tracking-[-0.01em]">{BRAND.name}</span>
        </a>

        <nav
          aria-label="Migas de pan"
          className="hidden items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-subtle lg:flex"
        >
          <span>{BRAND.name}</span>
          <ChevronRight className="size-3" aria-hidden="true" />
          <span className="text-ink">{activeLabel}</span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span
            className={cn(
              'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] sm:inline-flex',
              statusOnline
                ? 'border-line bg-surface text-ink-subtle'
                : 'border-danger/40 bg-danger/10 text-danger',
            )}
          >
            <span
              className={cn('size-1.5 rounded-full', statusOnline ? 'bg-success' : 'bg-danger')}
              aria-hidden="true"
            />
            {statusOnline ? 'En línea' : 'Sin conexión'}
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className="flex size-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-subtle transition-colors hover:border-line-strong hover:text-ink active:scale-95"
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onNewFile}
            className="rounded-lg bg-accent-fill px-3 py-1.5 text-[12px] font-medium text-accent-on transition-colors hover:brightness-105 active:scale-[0.98] lg:hidden"
          >
            Convertir
          </button>
        </div>
      </div>
    </header>
  )
}
