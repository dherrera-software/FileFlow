import { X, Loader2, CheckCircle2, AlertTriangle, Info, CircleAlert } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Toast as ToastItem } from '../../utils/toast';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, { Component: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>; alt: string; className?: string }> = {
  success: { Component: CheckCircle2, alt: 'Conversión completada', className: 'text-emerald-500' },
  error: { Component: CircleAlert, alt: 'Error', className: 'text-red-500' },
  warning: { Component: AlertTriangle, alt: 'Advertencia', className: 'text-amber-500' },
  info: { Component: Info, alt: 'Información', className: 'text-sky-500' },
  loading: { Component: Loader2, alt: 'Cargando', className: 'text-violet-500 animate-spin' },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Icon = iconMap[toast.type]?.Component || Info;

  return (
    <article
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl shadow-lg max-w-sm w-full bg-white dark:bg-zinc-900 border border-line dark:border-zinc-800',
        reduce && 'animate-none',
        'transition-colors duration-300 pointer-events-auto'
      )}
      data-type={toast.type}
      data-toast-id={toast.id}
    >
      <Icon
        className={cn('shrink-0 size-5', iconMap[toast.type]?.className)}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-ink">{toast.title}</h4>
        {toast.message && <p className="mt-0.5 text-xs text-ink-subtle">{toast.message}</p>}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={() => toast.action?.onClick()}
          className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-accent hover:bg-zinc-100 dark:hover:bg-zinc-800 mr-1"
        >
          {toast.action.label}
        </button>
      )}
      {toast.dismissible !== false && (
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-ink-faint hover:text-ink flex items-center gap-1"
          aria-label="Cerrar notificación"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
      {(toast.duration ?? 0) > 0 && !reduce && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-[linear]"
            style={{ width: '100%' }}
          />
        </div>
      )}
    </article>
  );
}
