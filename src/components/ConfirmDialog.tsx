import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          buttonText: 'text-white'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
          buttonText: 'text-white'
        };
      case 'info':
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-500',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'text-white'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          buttonText: 'text-white'
        };
    }
  };

  const styles = getVariantStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${styles.iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${styles.buttonColor} ${styles.buttonText} rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Convenience hook for managing confirmation dialogs
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<ConfirmDialogProps>>({});

  const showConfirm = (options: Omit<ConfirmDialogProps, 'isOpen' | 'onConfirm' | 'onCancel'>) => {
    setConfig(options);
    setIsOpen(true);
  };

  const hideConfirm = () => {
    setIsOpen(false);
    setConfig({});
  };

  const confirm = (onConfirm: () => void, onCancel?: () => void) => {
    return new Promise<boolean>((resolve) => {
      const handleConfirm = () => {
        onConfirm();
        hideConfirm();
        resolve(true);
      };

      const handleCancel = () => {
        onCancel?.();
        hideConfirm();
        resolve(false);
      };

      setConfig({
        ...config,
        onConfirm: handleConfirm,
        onCancel: handleCancel
      });
      setIsOpen(true);
    });
  };

  const ConfirmComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onConfirm={() => {}}
      onCancel={() => {}}
      {...config}
    />
  );

  return {
    showConfirm,
    hideConfirm,
    confirm,
    ConfirmComponent,
    isOpen
  };
}
