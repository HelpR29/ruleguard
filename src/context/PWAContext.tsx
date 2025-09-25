/**
 * Progressive Web App (PWA) Context Provider
 * Handles offline support, service worker management, and app installation
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface PWAContextValue {
  // Installation
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: () => Promise<void>;
  dismissInstallPrompt: () => void;

  // Online/Offline status
  isOnline: boolean;

  // Service Worker
  updateAvailable: boolean;
  updateApp: () => Promise<void>;

  // Sync
  syncStatus: SyncStatus;
  syncData: () => Promise<void>;

  // Push Notifications
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, options?: NotificationOptions) => Promise<void>;

  // Data management
  cacheData: (key: string, data: any) => Promise<void>;
  getCachedData: (key: string) => Promise<any>;
  clearCache: () => Promise<void>;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: Date;
  pendingItems: number;
  isSyncing: boolean;
  errors: string[];
  conflictCount: number;
}

const PWAContext = createContext<PWAContextValue | null>(null);

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncAt: new Date(),
    pendingItems: 0,
    isSyncing: false,
    errors: [],
    conflictCount: 0
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
              setUpdateAvailable(true);
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const installPrompt = useCallback(async () => {
    if (isInstallable && 'beforeinstallprompt' in window) {
      const event = new Event('beforeinstallprompt') as any;
      window.dispatchEvent(event);
    }
  }, [isInstallable]);

  const dismissInstallPrompt = useCallback(() => {
    setIsInstallable(false);
  }, []);

  const updateApp = useCallback(async () => {
    if ('serviceWorker' in navigator && updateAvailable) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }, [updateAvailable]);

  const syncData = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus(prev => ({ ...prev, errors: [...prev.errors, 'Cannot sync while offline'] }));
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, errors: [] }));

    try {
      // TODO: Implement actual sync logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        pendingItems: 0,
        errors: []
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Sync failed']
      }));
    }
  }, [isOnline]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }, []);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (notificationPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Send push notification via service worker
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body: options?.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: options?.tag,
        requireInteraction: options?.requireInteraction,
        data: options?.data
      });
    } else {
      // Fallback to browser notification
      new Notification(title, options);
    }
  }, [notificationPermission, requestNotificationPermission]);

  const cacheData = useCallback(async (key: string, data: any) => {
    try {
      const cache = await caches.open('ruleguard-v1');
      await cache.put(`/api/cache/${key}`, new Response(JSON.stringify(data)));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  const getCachedData = useCallback(async (key: string) => {
    try {
      const cache = await caches.open('ruleguard-v1');
      const response = await cache.match(`/api/cache/${key}`);
      if (response) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }, []);

  const clearCache = useCallback(async () => {
    try {
      const cache = await caches.open('ruleguard-v1');
      await cache.delete(new Request('/api/cache/*'));
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, []);

  const contextValue: PWAContextValue = {
    isInstallable,
    isInstalled,
    installPrompt,
    dismissInstallPrompt,
    isOnline,
    updateAvailable,
    updateApp,
    syncStatus,
    syncData,
    notificationPermission,
    requestNotificationPermission,
    sendNotification,
    cacheData,
    getCachedData,
    clearCache
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
