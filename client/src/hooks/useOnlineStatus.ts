import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/conversionApi';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkHealth = async () => {
      const reachable = await checkBackendHealth();
      setIsBackendReachable(reachable);
      setLastCheck(new Date());
    };

    const interval = setInterval(checkHealth, 30000);
    checkHealth();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isBackendReachable, lastCheck };
}
