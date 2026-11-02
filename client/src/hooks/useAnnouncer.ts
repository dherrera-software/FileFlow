import { useEffect, useRef } from 'react';

export function useAnnouncer() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'sr-only';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    ref.current = el;

    return () => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
      ref.current = null;
    };
  }, []);

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (ref.current) {
      ref.current.setAttribute('aria-live', politeness);
      ref.current.textContent = '';
      setTimeout(() => {
        if (ref.current) ref.current.textContent = message;
      }, 50);
    }
  };

  return { announce, announcerNode: ref };
}
