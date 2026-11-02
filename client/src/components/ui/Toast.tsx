import { useEffect, useRef, useState } from 'react';
import { X, Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastProps {
  toast: {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    dismissible?: boolean;
  };
  onDismiss: (id: string) => void;
}

const iconMap: Record<ToastType, { Component: any; alt: string; className?: string }> = {
  success: { Component: CheckCircle2, alt: 'Conversión completada', className: 'text-emerald-500' },
  error: { Component: CircleAlert, alt: 'Error', className: 'text-red-500' },
  warning: { Component: AlertTriangle, alt: 'Advertencia', className: 'text-amber-500' },
  info: { Component: Info, alt: 'Información', className: 'text-sky-500' },
  loading: { Component: Loader2, alt: 'Cargando', className: 'text-violet-500 animate-spin' },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <article
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl shadow-lg max-w-sm w-full',
        reduce && 'animate-none',
        'transition-colors duration-300'
      )}
      data-type={toast.type}
      data-toast-id={toast.id}
    >
      <iconComponent
        icon={iconMap[toast.type].Component}
        className={cn('shrink-0 size-5', iconMap[toast.type].className)}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.message && <p className="mt-0.5 text-sm text-ink-subtle">{toast.message}</p>}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={() => toast.action.onClick()}
          className="shrink-0 rounded-md px-2 py-1 text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 mr-1"
        >
          {toast.action.label}
        </button>
      )}
      {toast.dismissible && (
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-ink-faint hover:text-ink flex items-center gap-1"
          aria-label="Cerrar toast"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
      {toast.duration > 0 && !reduce && (
        <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-[linear]"
            style={{ width: '100%' }}
          />
        </div>
      )}
    </article>
  );
}
