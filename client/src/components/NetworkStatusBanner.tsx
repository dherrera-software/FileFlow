import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function NetworkStatusBanner({
  isOnline,
  isBackendReachable,
  onRetry,
}: {
  isOnline: boolean;
  isBackendReachable: boolean;
  onRetry: () => void;
}) {
  const isDisconnected = !isOnline || !isBackendReachable;
  const [showReconnected, setShowReconnected] = useState(false);
  const prevDisconnected = useRef(isDisconnected);

  useEffect(() => {
    if (prevDisconnected.current && !isDisconnected) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      prevDisconnected.current = isDisconnected;
      return () => clearTimeout(timer);
    }
    prevDisconnected.current = isDisconnected;
  }, [isDisconnected]);

  if (!isDisconnected && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 border-b border-line bg-surface/95 px-4 py-2 text-[12.5px] font-medium text-ink shadow-panel backdrop-blur-xl"
    >
      {isDisconnected ? (
        <>
          <WifiOff className="size-4 text-danger" aria-hidden="true" />
          <span>Sin conexión o servidor no disponible.</span>
          <button
            type="button"
            onClick={onRetry}
            className="ml-2 flex items-center gap-1.5 rounded-md border border-danger/30 bg-danger/10 px-2.5 py-1 text-[11px] text-danger transition-colors hover:bg-danger/20"
          >
            <RefreshCw className="size-3" aria-hidden="true" /> Reintentar ahora
          </button>
        </>
      ) : (
        <>
          <Wifi className="size-4 text-success" aria-hidden="true" />
          <span>Conectado de nuevo.</span>
        </>
      )}
    </div>
  );
}
