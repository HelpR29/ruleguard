import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions {
  data: any;
  key: string;
  delay?: number;
  enabled?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  data,
  key,
  delay = 2000,
  enabled = true,
  onSave,
  onError
}: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  const saveData = useCallback(async () => {
    if (!enabled) return;

    try {
      const dataString = JSON.stringify(data);

      // Don't save if data hasn't changed
      if (dataString === lastSavedDataRef.current) return;

      // Save to localStorage
      localStorage.setItem(key, dataString);
      lastSavedDataRef.current = dataString;

      // Call custom save handler if provided
      if (onSave) {
        await onSave(data);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [data, key, enabled, onSave, onError]);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(saveData, delay);
  }, [saveData, delay]);

  // Auto-save when data changes
  useEffect(() => {
    debouncedSave();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSave]);

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      saveData();
    };
  }, [saveData]);

  return {
    saveNow: saveData,
    hasUnsavedChanges: JSON.stringify(data) !== lastSavedDataRef.current
  };
}

// Hook for loading auto-saved data
export function useAutoLoad(key: string, defaultValue: any = {}) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  return [data, setData] as const;
}

// Hook for form auto-save with validation
export function useFormAutoSave<T extends Record<string, any>>(
  initialData: T,
  key: string,
  options: {
    delay?: number;
    enabled?: boolean;
    validate?: (data: T) => boolean;
    onSave?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { delay = 2000, enabled = true, validate, onSave, onError } = options;

  const [formData, setFormData] = useState<T>(initialData);

  const autoSave = useAutoSave({
    data: formData,
    key,
    delay,
    enabled: enabled && (!validate || validate(formData)),
    onSave: onSave ? (data) => onSave(data as T) : undefined,
    onError
  });

  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  const loadSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error);
    }
    return initialData;
  }, [key, initialData]);

  return {
    formData,
    setFormData,
    updateField,
    updateData,
    resetForm,
    loadSavedData,
    hasUnsavedChanges: autoSave.hasUnsavedChanges,
    saveNow: autoSave.saveNow
  };
}
