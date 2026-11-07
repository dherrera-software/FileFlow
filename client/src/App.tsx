import { lazy, Suspense } from 'react'
import { useConverter } from './hooks/useConverter'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useFileLimits } from './hooks/useFileLimits'
import { useScrollSpy } from './hooks/useScrollSpy'
import { AppShell } from './components/AppShell'
import { Footer } from './components/Footer'
import { NetworkStatusBanner } from './components/NetworkStatusBanner'
import { PageSkeleton } from './components/PageSkeleton'
import { Skeleton, SkeletonText } from './components/ui/Skeleton'

const HeroSection = lazy(() => import('./components/HeroSection').then(m => ({ default: m.HeroSection })));
const PopularConversions = lazy(() => import('./components/PopularConversions').then(m => ({ default: m.PopularConversions })));
const HowItWorks = lazy(() => import('./components/HowItWorks').then(m => ({ default: m.HowItWorks })));
const PrivacySection = lazy(() => import('./components/PrivacySection').then(m => ({ default: m.PrivacySection })));
const FaqSection = lazy(() => import('./components/FaqSection').then(m => ({ default: m.FaqSection })));

const SECTION_IDS = ['convert', 'converters', 'how-it-works', 'privacy', 'faq'] as const

function HeroFallback() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
      <div className="grid gap-10 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-5">
          <SkeletonText lines={2} />
          <SkeletonText lines={1} />
        </div>
        <div className="xl:col-span-7">
          <Skeleton className="h-[360px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function PopularFallback() {
  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-3 px-5 py-8 sm:grid-cols-2 sm:px-8 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  )
}

function SectionFallback() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8">
      <SkeletonText lines={3} />
    </div>
  )
}

export default function App() {
  const converter = useConverter()
  const { isOnline, isBackendReachable } = useOnlineStatus()
  const limits = useFileLimits()
  const activeSection = useScrollSpy(SECTION_IDS, 'convert')
  const loading = !limits.loaded

  if (loading) return <PageSkeleton />

  return (
    <>
      <NetworkStatusBanner
        isOnline={isOnline}
        isBackendReachable={isBackendReachable}
        onRetry={() => window.location.reload()}
      />

      <AppShell
        activeSection={activeSection}
        isOnline={isOnline}
        isBackendReachable={isBackendReachable}
        onNewFile={converter.actions.openFilePicker}
      >
        <main id="top" className="app-ground relative min-h-[calc(100vh-60px)]">
          <Suspense fallback={<HeroFallback />}><HeroSection controller={converter} /></Suspense>
          <Suspense fallback={<PopularFallback />}><PopularConversions onSelectPair={converter.actions.requestConversion} /></Suspense>
          <Suspense fallback={<SectionFallback />}><HowItWorks /></Suspense>
          <Suspense fallback={<SectionFallback />}><PrivacySection onSelectPair={converter.actions.requestConversion} /></Suspense>
          <Suspense fallback={<SectionFallback />}><FaqSection /></Suspense>
        </main>
        <Footer statusOnline={isOnline && isBackendReachable} />
      </AppShell>
    </>
  )
}
