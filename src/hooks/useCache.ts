import { useState, useEffect, useCallback, useRef } from 'react';

// Generic cache hook for any data
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default TTL
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const loadData = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached && !force) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data
      const freshData = await fetcherRef.current();

      // Cache the data
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data: freshData,
        timestamp: Date.now()
      }));

      setData(freshData);
      return freshData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [key, ttl]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const invalidate = useCallback(() => {
    localStorage.removeItem(`cache_${key}`);
    loadData(true);
  }, [key, loadData]);

  return { data, loading, error, refetch: () => loadData(true), invalidate };
}

// Specialized hook for localStorage data with caching
export function useLocalStorageCache<T>(
  key: string,
  defaultValue: T,
  ttl: number = 30 * 1000 // 30 seconds for localStorage data
) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(() => {
    try {
      setLoading(true);
      const cached = localStorage.getItem(`cache_ls_${key}`);
      const raw = localStorage.getItem(key);

      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl && raw) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      if (raw) {
        const parsedData = JSON.parse(raw);
        setData(parsedData);

        // Update cache
        localStorage.setItem(`cache_ls_${key}`, JSON.stringify({
          data: parsedData,
          timestamp: Date.now()
        }));

        return parsedData;
      }

      return defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue, ttl]);

  const updateData = useCallback((newData: T) => {
    try {
      setData(newData);
      localStorage.setItem(key, JSON.stringify(newData));
      localStorage.setItem(`cache_ls_${key}`, JSON.stringify({
        data: newData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key]);

  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`cache_ls_${key}`);
      setData(defaultValue);
    } catch (error) {
      console.error(`Error clearing ${key} from localStorage:`, error);
    }
  }, [key, defaultValue]);

  // Load data on mount and when key changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, updateData, clearData, refetch: loadData };
}

// Memoized data hook for expensive computations
export function useMemoizedData<T>(
  key: string,
  computeFn: () => T,
  dependencies: React.DependencyList
) {
  const [data, setData] = useState<T | null>(null);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    const computeData = async () => {
      setComputing(true);
      try {
        const result = computeFn();
        setData(result);
      } catch (error) {
        console.error('Error computing memoized data:', error);
      } finally {
        setComputing(false);
      }
    };

    computeData();
  }, dependencies);

  return { data, computing };
}

// Debounced value hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Smart prefetch hook for related data
export function useSmartPrefetch(
  prefetchFns: Array<() => Promise<any>>,
  triggerKeys: string[]
) {
  const [prefetched, setPrefetched] = useState<Set<string>>(new Set());

  const prefetch = useCallback(async (key: string) => {
    if (prefetched.has(key)) return;

    try {
      const prefetchFn = prefetchFns.find(fn => fn.name === key);
      if (prefetchFn) {
        await prefetchFn();
        setPrefetched(prev => new Set([...prev, key]));
      }
    } catch (error) {
      console.error(`Error prefetching ${key}:`, error);
    }
  }, [prefetchFns, prefetched]);

  // Prefetch on visibility change or user interaction
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerKeys.forEach(prefetch);
      }
    };

    const handleInteraction = () => {
      // Prefetch likely next data on user interaction
      triggerKeys.forEach(prefetch);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', handleInteraction);
    };
  }, [prefetch, triggerKeys]);

  return { prefetch, prefetched };
}
