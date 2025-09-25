import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Windowed list component for very large datasets
interface WindowedListProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function WindowedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 10
}: WindowedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [measurements, setMeasurements] = useState<Map<number, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Calculate item heights and positions
  const { totalHeight, visibleRange } = React.useMemo(() => {
    let offset = 0;
    const offsets: number[] = [];
    const heights: number[] = [];

    for (let i = 0; i < items.length; i++) {
      offsets[i] = offset;
      const height = typeof itemHeight === 'function'
        ? itemHeight(items[i], i)
        : itemHeight;
      heights[i] = height;
      offset += height;
    }

    const visibleStart = Math.max(0,
      offsets.findIndex(offset => offset + heights[0] > scrollTop) - overscan
    );
    const visibleEnd = Math.min(items.length - 1,
      offsets.findIndex((offset, index) =>
        offset > scrollTop + containerHeight, offsets.length
      ) + overscan
    );

    return {
      totalHeight: offset,
      visibleRange: { start: visibleStart, end: visibleEnd }
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  const visibleItems = items.slice(
    visibleRange.start,
    Math.min(visibleRange.end + 1, items.length)
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.start + index;
          const offset = measurements.get(actualIndex) || 0;

          return (
            <div
              key={actualIndex}
              ref={(el) => {
                if (el) {
                  itemRefs.current.set(actualIndex, el);
                  // Measure actual height if different from estimated
                  const rect = el.getBoundingClientRect();
                  if (Math.abs(rect.height - (typeof itemHeight === 'function' ? itemHeight(item, actualIndex) : itemHeight)) > 1) {
                    setMeasurements(prev => new Map(prev.set(actualIndex, rect.height)));
                  }
                }
              }}
              style={{
                position: 'absolute',
                top: offset,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Infinite scroll hook
export function useInfiniteScroll(
  loadMore: () => void,
  hasNextPage: boolean,
  threshold: number = 100
) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isLoading) {
          setIsLoading(true);
          loadMore();
          // Reset loading after a short delay to prevent rapid calls
          setTimeout(() => setIsLoading(false), 1000);
        }
      },
      { threshold: 0.1, rootMargin: `${threshold}px` }
    );

    const currentRef = loadingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, hasNextPage, isLoading, threshold]);

  return { loadingRef, isLoading };
}
