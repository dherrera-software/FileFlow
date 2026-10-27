import { useConverter } from './hooks/useConverter'
import { Navbar, Footer } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { PopularConversions } from './components/PopularConversions'
import { HowItWorks } from './components/HowItWorks'
import { PrivacySection } from './components/PrivacySection'
import { FaqSection } from './components/FaqSection'

export default function App() {
  const converter = useConverter()

  return (
    <div id="top" className="relative min-h-screen overflow-x-clip bg-white text-ink transition-colors dark:bg-[#0c0c0e]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] hero-wash sm:h-[660px]"
      />

      <a
        href="#convert"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-[13px] focus:text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Saltar al conversor
      </a>

      <Navbar />

      <main className="relative">
        <HeroSection controller={converter} />
        <PopularConversions onSelectPair={converter.actions.requestConversion} />
        <HowItWorks />
        <PrivacySection onSelectPair={converter.actions.requestConversion} />
        <FaqSection />
      </main>

      <Footer />
    </div>
  )
}
