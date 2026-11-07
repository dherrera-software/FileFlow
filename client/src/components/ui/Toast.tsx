import { X, Loader2, CheckCircle2, AlertTriangle, Info, CircleAlert } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Toast as ToastItem } from '../../utils/toast';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, { Component: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>; alt: string; className?: string }> = {
  success: { Component: CheckCircle2, alt: 'Conversión completada', className: 'text-success' },
  error: { Component: CircleAlert, alt: 'Error', className: 'text-danger' },
  warning: { Component: AlertTriangle, alt: 'Advertencia', className: 'text-amber-500' },
  info: { Component: Info, alt: 'Información', className: 'text-info' },
  loading: { Component: Loader2, alt: 'Cargando', className: 'text-accent animate-spin' },
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
        'relative flex items-center gap-3 p-3.5 rounded-xl max-w-sm w-full overflow-hidden border border-line bg-surface-raised shadow-panel',
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
          className="mr-1 shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-accent hover:bg-surface-sunken"
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
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-linear"
            style={{ width: '100%' }}
          />
        </div>
      )}
    </article>
  );
}
