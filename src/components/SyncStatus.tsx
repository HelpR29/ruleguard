/**
 * Sync Status Component
 * Shows current sync status and provides manual sync controls
 */

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Database
} from 'lucide-react';
import { hybridDatabase } from '../services/hybridDatabase';

interface SyncStatusProps {
  userId: string;
  compact?: boolean;
}

export default function SyncStatus({ userId, compact = false }: SyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState(hybridDatabase.getSyncStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Update sync status every 5 seconds
    const interval = setInterval(() => {
      setSyncStatus(hybridDatabase.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    if (!syncStatus.supabaseConfigured || !syncStatus.isOnline) return;

    setIsManualSyncing(true);
    try {
      await hybridDatabase.forceSyncAll(userId);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (!syncStatus.supabaseConfigured) return 'text-gray-500';
    if (!syncStatus.isOnline) return 'text-red-500';
    if (syncStatus.syncInProgress || isManualSyncing) return 'text-blue-500';
    if (syncStatus.syncQueueSize > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!syncStatus.supabaseConfigured) return Database;
    if (!syncStatus.isOnline) return WifiOff;
    if (syncStatus.syncInProgress || isManualSyncing) return RefreshCw;
    if (syncStatus.syncQueueSize > 0) return Clock;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (!syncStatus.supabaseConfigured) return 'Local only';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.syncInProgress || isManualSyncing) return 'Syncing...';
    if (syncStatus.syncQueueSize > 0) return `${syncStatus.syncQueueSize} pending`;
    return 'Synced';
  };

  const StatusIcon = getStatusIcon();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StatusIcon 
          className={`h-4 w-4 ${getStatusColor()} ${
            (syncStatus.syncInProgress || isManualSyncing) ? 'animate-spin' : ''
          }`} 
        />
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Sync Status</h3>
        {syncStatus.supabaseConfigured && syncStatus.isOnline && (
          <button
            onClick={handleManualSync}
            disabled={isManualSyncing || syncStatus.syncInProgress}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-700">
              Connection
            </span>
          </div>
          <span className={`text-sm font-medium ${
            syncStatus.isOnline ? 'text-green-600' : 'text-red-600'
          }`}>
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Cloud Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {syncStatus.supabaseConfigured ? (
              <Cloud className="h-4 w-4 text-blue-500" />
            ) : (
              <CloudOff className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm text-gray-700">
              Cloud Sync
            </span>
          </div>
          <span className={`text-sm font-medium ${
            syncStatus.supabaseConfigured ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {syncStatus.supabaseConfigured ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon 
              className={`h-4 w-4 ${getStatusColor()} ${
                (syncStatus.syncInProgress || isManualSyncing) ? 'animate-spin' : ''
              }`} 
            />
            <span className="text-sm text-gray-700">
              Status
            </span>
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Last Sync Time */}
        {lastSyncTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Last Sync
            </span>
            <span className="text-sm text-gray-500">
              {lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Pending Changes */}
        {syncStatus.syncQueueSize > 0 && (
          <div className="bg-yellow-50/20 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {syncStatus.syncQueueSize} change{syncStatus.syncQueueSize !== 1 ? 's' : ''} pending sync
              </span>
            </div>
          </div>
        )}

        {/* Offline Notice */}
        {!syncStatus.isOnline && syncStatus.supabaseConfigured && (
          <div className="bg-red-50/20 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                Working offline. Changes will sync when connection is restored.
              </span>
            </div>
          </div>
        )}

        {/* No Cloud Sync Notice */}
        {!syncStatus.supabaseConfigured && (
          <div className="bg-gray-50/20 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                Using local storage only. Set up Supabase for cloud sync.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
