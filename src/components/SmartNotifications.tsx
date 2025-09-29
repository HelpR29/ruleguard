/**
 * Smart Notifications System
 * Intelligent notification management with push notifications, email alerts, and in-app notifications
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Mail,
  Smartphone,
  Settings,
  X,
  Check,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Volume2,
  VolumeX,
  Moon,
  Sun
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'trading' | 'system' | 'achievement' | 'social';
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  enabled: boolean;
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  categories: {
    trading: boolean;
    system: boolean;
    achievement: boolean;
    social: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  doNotDisturb: boolean;
}

interface NotificationPreferences {
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  maxNotifications: number;
  groupSimilar: boolean;
  showPreviews: boolean;
  smartSchedule: boolean;
}

/**
 * Smart Notifications Panel
 * Intelligent notification management with multiple channels and smart scheduling
 */
export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    channels: {
      inApp: true,
      push: false,
      email: false,
      sms: false
    },
    categories: {
      trading: true,
      system: true,
      achievement: true,
      social: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    soundEnabled: true,
    vibrationEnabled: true,
    doNotDisturb: false
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    frequency: 'realtime',
    maxNotifications: 10,
    groupSimilar: true,
    showPreviews: true,
    smartSchedule: true
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        addToast('success', 'Notifications enabled successfully!');
      } else {
        addToast('warning', 'Notification permission denied');
      }
    }
  }, [addToast]);

  // Send browser notification
  const sendBrowserNotification = useCallback((notification: NotificationItem) => {
    if ('Notification' in window && Notification.permission === 'granted' && settings.channels.push) {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.category,
        requireInteraction: notification.priority === 'high',
        silent: !settings.soundEnabled,
        data: notification.metadata
      };

      const browserNotification = new Notification(notification.title, options);

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }, [settings.channels.push, settings.soundEnabled]);

  // Check if in quiet hours
  const isInQuietHours = useCallback(() => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const start = settings.quietHours.start;
    const end = settings.quietHours.end;

    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }, [settings.quietHours]);

  // Smart notification scheduling
  const shouldSendNotification = useCallback((notification: NotificationItem): boolean => {
    // Check if notifications are enabled
    if (!settings.enabled) return false;

    // Check category filter
    if (!settings.categories[notification.category]) return false;

    // Check quiet hours
    if (isInQuietHours() && settings.doNotDisturb) return false;

    // Check do not disturb
    if (settings.doNotDisturb) return false;

    // Check if too many notifications (rate limiting)
    const recentNotifications = notifications.filter(n =>
      new Date(n.timestamp).getTime() > Date.now() - 60000 // Last minute
    );

    if (recentNotifications.length >= preferences.maxNotifications) return false;

    return true;
  }, [settings, preferences.maxNotifications, notifications, isInQuietHours]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications

    if (shouldSendNotification(newNotification)) {
      sendBrowserNotification(newNotification);

      // Play sound if enabled
      if (settings.soundEnabled && soundEnabled) {
        playNotificationSound(notification.type);
      }

      // Trigger vibration if enabled
      if (settings.vibrationEnabled && vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [shouldSendNotification, sendBrowserNotification, settings.soundEnabled, settings.vibrationEnabled, soundEnabled, vibrationEnabled]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    addToast('success', 'All notifications marked as read');
  }, [addToast]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast('success', 'Notification deleted');
  }, [addToast]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    addToast('success', 'All notifications cleared');
  }, [addToast]);

  // Play notification sound
  const playNotificationSound = useCallback((type: NotificationItem['type']) => {
    // Create audio context for notification sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const frequencies = {
      info: [523.25, 659.25, 783.99],      // C5, E5, G5
      success: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6
      warning: [440, 440, 440, 392],        // A4, A4, A4, G4
      error: [294, 262, 233, 208]          // D4, C4, B3, A3
    };

    frequencies[type].forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, index * 100);
    });
  }, []);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.read;
      case 'settings':
        return false;
      default:
        return true;
    }
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Auto-cleanup expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications(prev =>
        prev.filter(notification =>
          !notification.expiresAt || notification.expiresAt > now
        )
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="h-5 w-5 text-gray-600" />

        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            className="absolute right-0 mt-2 w-96 max-h-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700:text-blue-300"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === 'unread' ? 'all' : 'unread')}
                  className={`text-sm px-2 py-1 rounded ${
                    activeTab === 'unread'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600'
                  }`}
                >
                  {activeTab === 'unread' ? 'All' : 'Unread'}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-1 text-gray-400 hover:text-gray-600:text-gray-300"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'settings' ? (
              <NotificationSettingsPanel
                settings={settings}
                preferences={preferences}
                onSettingsChange={setSettings}
                onPreferencesChange={setPreferences}
                onRequestPermission={requestPermission}
              />
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map((notification) => (
                      <NotificationItemComponent
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {activeTab !== 'settings' && notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={clearAll}
                  className="w-full text-sm text-red-600 hover:text-red-700:text-red-300"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Notification Item Component
 */
const NotificationItemComponent = ({
  notification,
  onMarkAsRead,
  onDelete
}: {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <motion.div
      className={`p-4 hover:bg-gray-50:bg-gray-700 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50/20' : ''
      }`}
      onClick={() => onMarkAsRead(notification.id)}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                  {getTimeAgo(notification.timestamp)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  notification.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : notification.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {notification.priority}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {notification.actionText && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                  }
                }}
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {notification.actionText}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Notification Settings Panel
 */
const NotificationSettingsPanel = ({
  settings,
  preferences,
  onSettingsChange,
  onPreferencesChange,
  onRequestPermission
}: {
  settings: NotificationSettings;
  preferences: NotificationPreferences;
  onSettingsChange: (settings: NotificationSettings) => void;
  onPreferencesChange: (preferences: NotificationPreferences) => void;
  onRequestPermission: () => void;
}) => {
  return (
    <div className="p-4 space-y-6 max-h-80 overflow-y-auto">
      {/* Channels */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Channels</h4>
        <div className="space-y-3">
          {[
            { key: 'inApp', label: 'In-App Notifications', icon: Bell },
            { key: 'push', label: 'Push Notifications', icon: Smartphone },
            { key: 'email', label: 'Email Notifications', icon: Mail }
          ].map(({ key, label, icon: Icon }) => (
            <label key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{label}</span>
              </div>
              <input
                type="checkbox"
                checked={settings.channels[key as keyof typeof settings.channels]}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  channels: {
                    ...settings.channels,
                    [key]: e.target.checked
                  }
                })}
                className="rounded border-gray-300"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
        <div className="space-y-3">
          {[
            { key: 'trading', label: 'Trading Alerts' },
            { key: 'system', label: 'System Updates' },
            { key: 'achievement', label: 'Achievements' },
            { key: 'social', label: 'Social Activity' }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={settings.categories[key as keyof typeof settings.categories]}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  categories: {
                    ...settings.categories,
                    [key]: e.target.checked
                  }
                })}
                className="rounded border-gray-300"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quiet Hours</h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable Quiet Hours</span>
            <input
              type="checkbox"
              checked={settings.quietHours.enabled}
              onChange={(e) => onSettingsChange({
                ...settings,
                quietHours: {
                  ...settings.quietHours,
                  enabled: e.target.checked
                }
              })}
              className="rounded border-gray-300"
            />
          </label>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start</label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    quietHours: {
                      ...settings.quietHours,
                      start: e.target.value
                    }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End</label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    quietHours: {
                      ...settings.quietHours,
                      end: e.target.value
                    }
                  })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preferences</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Frequency</label>
            <select
              value={preferences.frequency}
              onChange={(e) => onPreferencesChange({
                ...preferences,
                frequency: e.target.value as NotificationPreferences['frequency']
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
            >
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Notifications</label>
            <input
              type="number"
              min="1"
              max="50"
              value={preferences.maxNotifications}
              onChange={(e) => onPreferencesChange({
                ...preferences,
                maxNotifications: parseInt(e.target.value)
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white"
            />
          </div>
        </div>
      </div>

      {/* Permission Request */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onRequestPermission}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Request Notification Permission
        </button>
      </div>
    </div>
  );
};

// Export utility functions for use in other components
export const notificationUtils = {
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    // This would be handled by the SmartNotifications component
    console.log('Adding notification:', notification);
  },

  sendTestNotification: () => {
    const testNotification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> = {
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      priority: 'low',
      category: 'system'
    };

    console.log('Sending test notification:', testNotification);
  }
};
