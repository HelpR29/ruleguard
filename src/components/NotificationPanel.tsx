import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, TrendingUp, Award, Calendar } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'achievement',
    title: 'Completion Milestone!',
    message: 'Congratulations! You\'ve completed 10 bottles. Only 40 more to go!',
    time: '2 hours ago',
    read: false
  },
  {
    id: '2',
    type: 'success',
    title: 'Rule Compliance',
    message: 'Perfect trading day! All rules followed successfully.',
    time: '1 day ago',
    read: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Rule Violation',
    message: 'You exceeded your daily trade limit. Remember: maximum 3 trades per day.',
    time: '2 days ago',
    read: true
  },
  {
    id: '4',
    type: 'info',
    title: 'Weekly Report Ready',
    message: 'Your weekly discipline report is now available for review.',
    time: '3 days ago',
    read: true
  },
  {
    id: '5',
    type: 'achievement',
    title: 'Streak Achievement',
    message: 'Amazing! You\'ve maintained a 7-day discipline streak.',
    time: '1 week ago',
    read: true
  }
];

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('app_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(notif => notif.id === id ? { ...notif, read: true } : notif);
      try {
        localStorage.setItem('app_notifications', JSON.stringify(next));
        window.dispatchEvent(new Event('rg:notifications-change'));
      } catch {}
      return next;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const next = prev.map(notif => ({ ...notif, read: true }));
      try {
        localStorage.setItem('app_notifications', JSON.stringify(next));
        window.dispatchEvent(new Event('rg:notifications-change'));
      } catch {}
      return next;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'achievement':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600">
              {notifications.filter(n => !n.read).length} unread
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Info className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No notifications</p>
              <p className="text-sm text-center">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm ${
                        !notification.read ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button className="w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}