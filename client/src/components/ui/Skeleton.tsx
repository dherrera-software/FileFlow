import { cn } from '../../utils/cn';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        'rounded bg-surface-sunken ring-1 ring-line',
        !reduce && 'animate-pulse',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 1, className, ...props }: { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full max-w-[30ch]" />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('rounded-xl aspect-[4/3]', className)} {...props} />;
}

export function SkeletonBadge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('rounded-full h-6 w-20', className)} {...props} />;
}

export function SkeletonChip({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('rounded-full h-6 w-16', className)} {...props} />;
}

export function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn('rounded-lg h-10 w-24', className)} {...props} />;
}
