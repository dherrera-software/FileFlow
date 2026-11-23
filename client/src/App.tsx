import { lazy, Suspense, useEffect, useState } from 'react'
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
const DesktopSection = lazy(() => import('./components/DesktopSection').then(m => ({ default: m.DesktopSection })));
const FeedbackSection = lazy(() => import('./components/FeedbackSection').then(m => ({ default: m.FeedbackSection })));
const HowItWorks = lazy(() => import('./components/HowItWorks').then(m => ({ default: m.HowItWorks })));
const PrivacySection = lazy(() => import('./components/PrivacySection').then(m => ({ default: m.PrivacySection })));
const FaqSection = lazy(() => import('./components/FaqSection').then(m => ({ default: m.FaqSection })));

const SECTION_IDS = ['convert', 'converters', 'desktop', 'how-it-works', 'privacy', 'faq'] as const

type Route = 'home' | 'feedback'

function getRouteFromLocation(): Route {
  if (typeof window === 'undefined') return 'home'
  const hash = window.location.hash.toLowerCase()
  const path = window.location.pathname.toLowerCase()
  if (
    hash.startsWith('#/feedback') ||
    hash.startsWith('#/comentarios') ||
    path.endsWith('/feedback') ||
    path.endsWith('/comentarios')
  ) {
    return 'feedback'
  }
  return 'home'
}

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
  const [currentRoute, setCurrentRoute] = useState<Route>(getRouteFromLocation)
  const loading = !limits.loaded

  useEffect(() => {
    const onRouteCheck = () => {
      const nextRoute = getRouteFromLocation()
      setCurrentRoute((prev) => {
        if (prev !== nextRoute) {
          if (nextRoute === 'feedback') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          return nextRoute
        }
        return prev
      })
    }

    window.addEventListener('hashchange', onRouteCheck)
    window.addEventListener('popstate', onRouteCheck)
    return () => {
      window.removeEventListener('hashchange', onRouteCheck)
      window.removeEventListener('popstate', onRouteCheck)
    }
  }, [])

  // When returning from feedback route to home with an anchor (or direct link with anchor)
  useEffect(() => {
    if (currentRoute === 'home') {
      const rawHash = window.location.hash.replace(/^#\/?/, '')
      if (rawHash && rawHash !== 'top' && rawHash !== 'feedback' && rawHash !== 'comentarios') {
        let timer: ReturnType<typeof setTimeout> | undefined
        const attemptScroll = (count = 0) => {
          const el = document.getElementById(rawHash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else if (count < 15) {
            timer = setTimeout(() => attemptScroll(count + 1), 60)
          }
        }
        timer = setTimeout(attemptScroll, 60)
        return () => {
          if (timer) clearTimeout(timer)
        }
      }
    }
  }, [currentRoute])

  if (loading) return <PageSkeleton />

  return (
    <>
      <NetworkStatusBanner
        isOnline={isOnline}
        isBackendReachable={isBackendReachable}
        onRetry={() => window.location.reload()}
      />

      <AppShell
        activeSection={currentRoute === 'feedback' ? 'feedback' : activeSection}
        isOnline={isOnline}
        isBackendReachable={isBackendReachable}
        onNewFile={converter.actions.openFilePicker}
      >
        <main id="top" className="app-ground relative min-h-[calc(100vh-60px)]">
          {currentRoute === 'feedback' ? (
            <Suspense fallback={<SectionFallback />}>
              <FeedbackSection
                isStandalone
                onBack={() => {
                  window.location.hash = '#/'
                }}
              />
            </Suspense>
          ) : (
            <>
              <Suspense fallback={<HeroFallback />}><HeroSection controller={converter} /></Suspense>
              <Suspense fallback={<PopularFallback />}><PopularConversions onSelectPair={converter.actions.requestConversion} /></Suspense>
              <Suspense fallback={<SectionFallback />}><DesktopSection /></Suspense>
              <Suspense fallback={<SectionFallback />}><HowItWorks /></Suspense>
              <Suspense fallback={<SectionFallback />}><PrivacySection onSelectPair={converter.actions.requestConversion} /></Suspense>
              <Suspense fallback={<SectionFallback />}><FaqSection /></Suspense>
            </>
          )}
        </main>
        <Footer statusOnline={isOnline && isBackendReachable} />
      </AppShell>
    </>
  )
}
