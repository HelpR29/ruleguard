/**
 * Hybrid Database Hook
 * React hook for using the hybrid database service with caching and sync
 */

import { useState, useEffect, useCallback } from 'react';
import { hybridDatabase } from '../services/hybridDatabase';
import { Trade, UserProgress, AppSettings } from '../types';

// =============================================================================
// TRADES HOOK
// =============================================================================

export function useTrades(userId: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hybridDatabase.getTrades(userId);
      setTrades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveTrade = useCallback(async (trade: Trade) => {
    try {
      await hybridDatabase.saveTrade(trade);
      // Optimistically update local state
      setTrades(prev => {
        const existing = prev.findIndex(t => t.id === trade.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = trade;
          return updated;
        } else {
          return [trade, ...prev];
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trade');
      throw err;
    }
  }, []);

  const deleteTrade = useCallback(async (tradeId: string) => {
    try {
      await hybridDatabase.deleteTrade(tradeId, userId);
      // Optimistically update local state
      setTrades(prev => prev.filter(t => t.id !== tradeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trade');
      throw err;
    }
  }, [userId]);

  const refreshTrades = useCallback(() => {
    loadTrades();
  }, [loadTrades]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  return {
    trades,
    loading,
    error,
    saveTrade,
    deleteTrade,
    refreshTrades
  };
}

// =============================================================================
// USER PROGRESS HOOK
// =============================================================================

export function useUserProgress(userId: string) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hybridDatabase.getUserProgress(userId);
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveProgress = useCallback(async (newProgress: UserProgress) => {
    try {
      await hybridDatabase.saveUserProgress(newProgress);
      // Optimistically update local state
      setProgress(newProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save progress');
      throw err;
    }
  }, []);

  const updateProgress = useCallback(async (updates: Partial<UserProgress>) => {
    if (!progress) return;

    const updatedProgress = {
      ...progress,
      ...updates,
      updatedAt: new Date()
    };

    await saveProgress(updatedProgress);
  }, [progress, saveProgress]);

  const refreshProgress = useCallback(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    loading,
    error,
    saveProgress,
    updateProgress,
    refreshProgress
  };
}

// =============================================================================
// APP SETTINGS HOOK
// =============================================================================

export function useAppSettings(userId: string) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hybridDatabase.getAppSettings(userId);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await hybridDatabase.saveAppSettings(newSettings);
      // Optimistically update local state
      setSettings(newSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date()
    };

    await saveSettings(updatedSettings);
  }, [settings, saveSettings]);

  const refreshSettings = useCallback(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateSettings,
    refreshSettings
  };
}

// =============================================================================
// SYNC STATUS HOOK
// =============================================================================

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState(hybridDatabase.getSyncStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(hybridDatabase.getSyncStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const forceSyncAll = useCallback(async (userId: string) => {
    await hybridDatabase.forceSyncAll(userId);
  }, []);

  const clearCache = useCallback(async (userId?: string) => {
    await hybridDatabase.clearCache(userId);
  }, []);

  return {
    syncStatus,
    forceSyncAll,
    clearCache
  };
}

// =============================================================================
// COMBINED DATA HOOK
// =============================================================================

export function useHybridData(userId: string) {
  const trades = useTrades(userId);
  const progress = useUserProgress(userId);
  const settings = useAppSettings(userId);
  const sync = useSyncStatus();

  const isLoading = trades.loading || progress.loading || settings.loading;
  const hasError = trades.error || progress.error || settings.error;

  const refreshAll = useCallback(() => {
    trades.refreshTrades();
    progress.refreshProgress();
    settings.refreshSettings();
  }, [trades.refreshTrades, progress.refreshProgress, settings.refreshSettings]);

  return {
    // Data
    trades: trades.trades,
    progress: progress.progress,
    settings: settings.settings,

    // Loading states
    isLoading,
    tradesLoading: trades.loading,
    progressLoading: progress.loading,
    settingsLoading: settings.loading,

    // Errors
    hasError,
    tradesError: trades.error,
    progressError: progress.error,
    settingsError: settings.error,

    // Actions
    saveTrade: trades.saveTrade,
    deleteTrade: trades.deleteTrade,
    saveProgress: progress.saveProgress,
    updateProgress: progress.updateProgress,
    saveSettings: settings.saveSettings,
    updateSettings: settings.updateSettings,

    // Refresh
    refreshAll,
    refreshTrades: trades.refreshTrades,
    refreshProgress: progress.refreshProgress,
    refreshSettings: settings.refreshSettings,

    // Sync
    syncStatus: sync.syncStatus,
    forceSyncAll: sync.forceSyncAll,
    clearCache: sync.clearCache
  };
}
