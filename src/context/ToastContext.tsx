import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, actionLabel?: string, onAction?: () => void) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: ToastType, message: string, actionLabel?: string, onAction?: () => void) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item: ToastItem = { id, type, message, actionLabel, onAction };
    setToasts((prev) => [...prev, item]);
    setTimeout(() => removeToast(id), 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
