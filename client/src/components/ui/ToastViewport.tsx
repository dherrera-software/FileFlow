import { cn } from '../../utils/cn';
import { Toast } from './Toast';
import type { Toast as ToastItem } from '../../utils/toast';

type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastViewportProps {
  toasts: ToastItem[];
  position?: Position;
  onDismiss?: (id: string) => void;
}

export function ToastViewport({ toasts, position = 'top-right', onDismiss = () => {} }: ToastViewportProps) {
  const getPositionClasses = (pos: Position) => {
    switch (pos) {
      case 'top-left':
        return 'top-4 left-4 items-start';
      case 'bottom-right':
        return 'bottom-4 right-4 items-end';
      case 'bottom-left':
        return 'bottom-4 left-4 items-start';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2 items-center';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
      case 'top-right':
      default:
        return 'top-4 right-4 items-end';
    }
  };

  const classes = cn(
    'fixed z-50 flex flex-col gap-3 pointer-events-none p-4',
    getPositionClasses(position)
  );

  return (
    <div
      className={classes}
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto transition-transform duration-300"
        >
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
