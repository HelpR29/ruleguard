/**
 * PWA Install Prompt Component
 * Provides an interface for users to install the RuleGuard PWA
 */

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Wifi, Zap } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

interface PWAInstallProps {
  variant?: 'banner' | 'modal' | 'inline';
  className?: string;
  onDismiss?: () => void;
}

/**
 * PWA Install Prompt Component
 *
 * Provides users with an interface to install the RuleGuard application
 * as a Progressive Web App on their device.
 *
 * @param variant - Display variant: 'banner', 'modal', or 'inline'
 * @param className - Additional CSS classes
 * @param onDismiss - Callback when user dismisses the prompt
 */
export default function PWAInstall({ variant = 'banner', className = '', onDismiss }: PWAInstallProps) {
  const { isInstallable, isInstalled, installPrompt, dismissInstallPrompt, isOnline } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isInstallable && !isInstalled) {
      // Show install prompt after a delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    try {
      await installPrompt();
      setIsVisible(false);
      onDismiss?.();
    } catch (error) {
      console.error('Failed to install PWA:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismissInstallPrompt();
    onDismiss?.();
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  const baseClasses = "bg-white border border-gray-200 rounded-lg shadow-lg";

  if (variant === 'banner') {
    return (
      <div className={`${baseClasses} ${className} p-4 max-w-md`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Install RuleGuard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Get the full app experience with offline support and push notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-700:text-blue-300"
            >
              Details
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600:text-gray-300"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Fast loading</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <span>Native app experience</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4 inline mr-2" />
            Install App
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className={`${baseClasses} ${className} max-w-md w-full`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Install RuleGuard
              </h2>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600:text-gray-300"
                aria-label="Close install modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get the Full Experience
              </h3>
              <p className="text-gray-600">
                Install RuleGuard on your device for the best trading discipline experience.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wifi className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Offline Support</h4>
                  <p className="text-sm text-gray-600">Access your data even without internet</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Lightning Fast</h4>
                  <p className="text-sm text-gray-600">Quick loading and smooth performance</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Native Feel</h4>
                  <p className="text-sm text-gray-600">Like a native app on your device</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="h-5 w-5 inline mr-2" />
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50:bg-gray-700 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`${baseClasses} ${className} p-4`}>
      <div className="flex items-center gap-3">
        <Smartphone className="h-8 w-8 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            Install RuleGuard
          </h3>
          <p className="text-sm text-gray-600">
            Get offline support and push notifications
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Install
        </button>
      </div>
    </div>
  );
}

/**
 * PWA Status Indicator Component
 *
 * Shows the current PWA and connectivity status
 */
export function PWAStatus() {
  const { isOnline, isInstalled, syncStatus } = usePWA();

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-gray-600">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {isInstalled && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-gray-600">App</span>
        </div>
      )}

      {syncStatus.isSyncing && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-gray-600">Syncing</span>
        </div>
      )}

      {syncStatus.pendingItems > 0 && (
        <span className="text-orange-600">
          {syncStatus.pendingItems} pending
        </span>
      )}
    </div>
  );
}
