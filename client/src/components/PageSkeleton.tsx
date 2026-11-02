import { Skeleton, SkeletonButton, SkeletonText, SkeletonCard, SkeletonChip, SkeletonBadge } from './ui/Skeleton';

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0c0e] text-ink">
      <header className="h-16 border-b border-line dark:border-zinc-800 flex items-center px-4">
        <Skeleton className="h-8 w-24 rounded-full" />
        <div className="ml-auto flex gap-2">
          <SkeletonButton />
          <SkeletonButton />
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="mb-12">
          <SkeletonText lines={2} />
          <SkeletonText lines={1} />
          <SkeletonButton className="mt-4" />
        </section>

        <section className="mb-12 rounded-3xl border border-line p-6">
          <Skeleton className="h-32 w-full rounded-2xl mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonChip key={i} />)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonBadge key={i} />)}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </section>
      </main>
    </div>
  );
}
