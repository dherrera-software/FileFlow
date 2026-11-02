import { useRef, useEffect, useCallback } from 'react';

export function useVirtualList(
  containerRef: React.RefObject<HTMLDivElement>,
  itemsCount: number,
  itemHeight: number = 24
) {
  const startIndexRef = useRef(0);
  const stopIndexRef = useRef(0);

  const container = containerRef?.current;

  const updateVisible = useCallback(() => {
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const height = containerRect.height;
    // compute first index whose bottom is within viewport
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
    startIndexRef.current = start;
    stopIndexRef.current = stop;
  }, [container, itemsCount, itemHeight]);

  useEffect(() => {
    updateVisible();
    const handler = () => {
      updateVisible();
    };
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler);
    };
  }, [updateVisible]);

  return {
    startIndex: startIndexRef.current,
    stopIndex: stopIndexRef.current,
  };
}
