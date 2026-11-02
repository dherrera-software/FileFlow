import { lazy, Suspense } from 'react'
import { useConverter } from './hooks/useConverter'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useFileLimits } from './hooks/useFileLimits'
import { Navbar, Footer } from './components/Navbar'
import { NetworkStatusBanner } from './components/NetworkStatusBanner'
import { PageSkeleton } from './components/PageSkeleton'
import { SkeletonText, SkeletonCard } from './components/ui/Skeleton'

const HeroSection = lazy(() => import('./components/HeroSection').then(m => ({ default: m.HeroSection })));
const PopularConversions = lazy(() => import('./components/PopularConversions').then(m => ({ default: m.PopularConversions })));
const HowItWorks = lazy(() => import('./components/HowItWorks').then(m => ({ default: m.HowItWorks })));
const PrivacySection = lazy(() => import('./components/PrivacySection').then(m => ({ default: m.PrivacySection })));
const FaqSection = lazy(() => import('./components/FaqSection').then(m => ({ default: m.FaqSection })));

function HeroFallback() {
  return <div className="py-12"><SkeletonText lines={2} /><SkeletonText lines={1} /></div>;
}
function PopularFallback() {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">{Array.from({length:3}).map((_,i)=><SkeletonCard key={i} />)}</div>;
}
function SectionFallback() {
  return <div className="py-8"><SkeletonText lines={3} /></div>;
}

export default function App() {
  const converter = useConverter()
  const { isOnline, isBackendReachable } = useOnlineStatus()
  const limits = useFileLimits()
  const loading = !limits.loaded

  if (loading) return <PageSkeleton />

  return (
    <>
      <div aria-live="polite" className="sr-only" />
      <div id="top" className="relative min-h-screen overflow-x-clip bg-white text-ink transition-colors dark:bg-[#0c0c0e]">
        <NetworkStatusBanner isOnline={isOnline} isBackendReachable={isBackendReachable} onRetry={() => window.location.reload()} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[520px] hero-wash sm:h-[660px]" />
        <a href="#convert" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-[13px] focus:text-white dark:bg-zinc-100 dark:text-zinc-900">
          Saltar al conversor
        </a>
        <Navbar />
        <main className="relative">
          <Suspense fallback={<HeroFallback />}><HeroSection controller={converter} /></Suspense>
          <Suspense fallback={<PopularFallback />}><PopularConversions onSelectPair={converter.actions.requestConversion} /></Suspense>
          <Suspense fallback={<SectionFallback />}><HowItWorks /></Suspense>
          <Suspense fallback={<SectionFallback />}><PrivacySection onSelectPair={converter.actions.requestConversion} /></Suspense>
          <Suspense fallback={<SectionFallback />}><FaqSection /></Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}
