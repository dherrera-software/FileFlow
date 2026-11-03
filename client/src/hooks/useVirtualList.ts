import { useState, useEffect, useCallback } from 'react';

export function useVirtualList(
  containerRef: React.RefObject<HTMLDivElement>,
  itemsCount: number,
  itemHeight: number = 24
) {
  const [range, setRange] = useState({ startIndex: 0, stopIndex: 0 });

  const container = containerRef?.current;

  const updateVisible = useCallback(() => {
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const height = containerRect.height;
    let offset = 0;
    let start = 0;
    for (let i = 0; i < itemsCount; i++) {
      offset += itemHeight;
      if (offset > height + 20) {
        start = Math.max(i - 5, 0);
        break;
      }
    }
    const stop = Math.min(start + 15, itemsCount);
    setRange({ startIndex: start, stopIndex: stop });
  }, [container, itemsCount, itemHeight]);

  useEffect(() => {
    const handler = () => {
      updateVisible();
    };
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, { passive: true });
    const timer = setTimeout(updateVisible, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler);
    };
  }, [updateVisible]);

  return range;
}
