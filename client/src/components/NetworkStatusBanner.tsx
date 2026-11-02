import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../utils/cn';

export function NetworkStatusBanner({ isOnline, isBackendReachable, onRetry }: { isOnline: boolean; isBackendReachable: boolean; onRetry: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline || !isBackendReachable) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isBackendReachable]);

  if (!show) return null;

  const isDisconnected = !isOnline || !isBackendReachable;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-2 text-[13px] font-medium shadow-md transition-all",
        isDisconnected ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
      )}
    >
      {isDisconnected ? (
        <>
          <WifiOff className="size-4" />
          <span>Sin conexión o servidor no disponible.</span>
          <button 
            onClick={onRetry}
            className="ml-2 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[11px] hover:bg-white/30"
          >
            <RefreshCw className="size-3" /> Reintentar ahora
          </button>
        </>
      ) : (
        <>
          <Wifi className="size-4" />
          <span>Conectado</span>
        </>
      )}
    </div>
  );
}
