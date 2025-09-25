import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback((options: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/badge-72x72.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        actions: options.actions,
        data: options.data,
      });

      // Auto-close notification after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  const scheduleNotification = useCallback((
    options: NotificationOptions,
    delay: number
  ) => {
    if (delay <= 0) {
      return showNotification(options);
    }

    const timeoutId = setTimeout(() => {
      showNotification(options);
    }, delay);

    return timeoutId;
  }, [showNotification]);

  const clearScheduledNotification = useCallback((timeoutId: number) => {
    clearTimeout(timeoutId);
  }, []);

  // Predefined notification types
  const showSuccessNotification = useCallback((message: string, title = 'Success') => {
    return showNotification({
      title,
      body: message,
      icon: '/icons/success.png',
    });
  }, [showNotification]);

  const showErrorNotification = useCallback((message: string, title = 'Error') => {
    return showNotification({
      title,
      body: message,
      icon: '/icons/error.png',
    });
  }, [showNotification]);

  const showWarningNotification = useCallback((message: string, title = 'Warning') => {
    return showNotification({
      title,
      body: message,
      icon: '/icons/warning.png',
    });
  }, [showNotification]);

  const showInfoNotification = useCallback((message: string, title = 'Info') => {
    return showNotification({
      title,
      body: message,
      icon: '/icons/info.png',
    });
  }, [showNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    clearScheduledNotification,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
  };
}

// Hook for managing notification subscriptions
export function useNotificationSubscription() {
  const [subscriptions, setSubscriptions] = useState<Map<string, number>>(new Map());

  const subscribe = useCallback((
    key: string,
    options: NotificationOptions,
    interval: number
  ) => {
    // Clear existing subscription
    unsubscribe(key);

    const intervalId = window.setInterval(() => {
      // This would typically check for new data and show notifications
      console.log(`Checking for updates: ${key}`);
    }, interval);

    setSubscriptions(prev => new Map(prev.set(key, intervalId)));
    return intervalId;
  }, []);

  const unsubscribe = useCallback((key: string) => {
    const intervalId = subscriptions.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      setSubscriptions(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, [subscriptions]);

  const unsubscribeAll = useCallback(() => {
    subscriptions.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    setSubscriptions(new Map());
  }, [subscriptions]);

  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  return {
    subscriptions: Array.from(subscriptions.keys()),
    subscribe,
    unsubscribe,
    unsubscribeAll,
  };
}
