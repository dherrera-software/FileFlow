import { useRef, useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export function ToastViewport({ toasts, position = 'top-right' }: { toasts: any; position?: Position }) {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onMouseDown = (e: React.MouseEvent) => {
      setDragStart({ x: e.clientX, y: e.clientY });
      setIsDragging(true);
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        // simple drag to reposition (optional)
      };
      const onMouseUp = () => setIsDragging(false);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const gap = 8;
  const padding = typeof window !== 'undefined' ? (window.innerWidth < 640 ? 'p-3' : 'p-6') : 'p-6';

  const classes = cn(
    'z-50 flex flex-col items-start gap-4 pointer-events-none',
    { 'top-4 right-4': position === 'top-right',
       'top-4 left-4': position === 'top-left',
       'bottom-4 right-4': position === 'bottom-right',
       'bottom-4 left-4': position === 'bottom-left',
       'top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2': position === 'top-center',
       'bottom-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2': position === 'bottom-center' }
  );

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'animate-slide-in flex items-center gap-3 p-3.5 rounded-xl shadow-lg max-w-sm w-full',
            'transition-transform duration-300',
            isDragging && 'transition-none'
          )}
          style={{ transitionDuration: isDragging ? '0s' : '0.3s' }}
        >
          {/* Toast content rendered by parent on dropzone */}
        </div>
      ))}
    </div>
  );
}
