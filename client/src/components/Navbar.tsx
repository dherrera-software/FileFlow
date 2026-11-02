import { useTranslation } from '../i18n/context';
import { Moon, Sun } from 'lucide-react';
import { BrandMark } from './ui/BrandMark';
import { useTheme } from '../hooks/useTheme';

const MemoNavbar = ({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) => {
  const { t } = useTranslation();
  const sectionLinks = [
    { label: t('common.home'), href: '#top', isActive: true },
    { label: t('common.converters'), href: '#converters', isActive: false },
    { label: t('common.howItWorks'), href: '#how-it-works', isActive: false },
  ];

  return (
    <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
      <header className="mx-auto flex max-w-[1004px] items-center gap-4 sm:gap-8 rounded-full border border-line bg-white/75 py-2.5 pl-5 pr-2.5 shadow-nav backdrop-blur-xl transition-colors dark:border-zinc-800 dark:bg-zinc-900/80">
        <a href="#top" className="flex items-center gap-2.5 rounded-full">
          <BrandMark />
          <span className="text-[14.5px] font-semibold tracking-[-0.01em]">FileFlow</span>
        </a>

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
          {sectionLinks.map((link) => (
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
          <span className="hidden text-[12.5px] text-ink-subtle lg:block">{t('navbar.freeTag')}</span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('navbar.toggleThemeDark')}
            title={t('navbar.toggleThemeLight')}
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
            {t('navbar.startConverting')}
          </a>
        </div>
      </header>

      <nav aria-label="Secciones" className="mx-auto mt-3 flex max-w-[1004px] items-center gap-1 md:hidden">
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={link.isActive ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

export default React.memo(MemoNavbar);
