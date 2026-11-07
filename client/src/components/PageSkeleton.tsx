import { Skeleton, SkeletonBadge, SkeletonChip, SkeletonText } from './ui/Skeleton'

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-line bg-surface p-4 lg:flex">
        <div className="flex items-center gap-2.5 px-1 py-2">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-6 h-10 w-full rounded-lg" />
        <div className="mt-7 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="flex h-14 items-center gap-3 border-b border-line bg-canvas px-4 sm:px-6 lg:h-[60px] lg:px-8">
          <Skeleton className="h-4 w-36" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </header>

        <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid gap-8 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-5">
              <Skeleton className="h-3 w-40" />
              <SkeletonText lines={2} />
              <SkeletonText lines={1} />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <div className="xl:col-span-7">
              <Skeleton className="h-[360px] w-full rounded-2xl" />
            </div>
          </div>

          <section className="mt-16">
            <Skeleton className="h-8 w-56" />
            <div className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonChip key={i} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonBadge key={i} />
              ))}
            </div>
          </section>

          <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}
