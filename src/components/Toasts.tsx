import React from 'react';
import { useToast } from '../context/ToastContext';

export default function Toasts() {
  const { toasts, removeToast } = useToast();
  const color = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-600';
      case 'info': return 'bg-blue-600';
      case 'warning': return 'bg-amber-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`${color(t.type)} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm`}> 
          <div className="flex-1 text-sm">{t.message}</div>
          {t.actionLabel && (
            <button
              className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
              onClick={() => { t.onAction?.(); removeToast(t.id); }}
            >
              {t.actionLabel}
            </button>
          )}
          <button className="text-white/80 hover:text-white text-sm" onClick={() => removeToast(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
