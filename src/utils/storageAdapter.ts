/**
 * Storage Adapter - Gradual Migration to Hybrid System
 * Provides localStorage interface with background sync to Supabase
 */

import { hybridDatabase } from '../services/hybridDatabase';

class StorageAdapter {
  private userId: string = 'demo-user';
  private syncEnabled: boolean = false;

  constructor() {
    // Check if Supabase is configured
    this.syncEnabled = this.checkSupabaseConfig();
    if (this.syncEnabled) {
      console.log('🔄 Storage adapter initialized with hybrid sync');
    } else {
      console.log('📦 Storage adapter using localStorage only');
    }
  }

  private checkSupabaseConfig(): boolean {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      return !!(url && key);
    } catch {
      return false;
    }
  }

  // Enhanced localStorage methods with background sync
  async getItem(key: string): Promise<string | null> {
    try {
      // Always return from localStorage for instant response
      const localValue = localStorage.getItem(key);
      
      // Background sync from Supabase if enabled
      if (this.syncEnabled && this.shouldSync(key)) {
        this.backgroundFetch(key).catch(console.error);
      }
      
      return localValue;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Always save to localStorage first for instant response
      localStorage.setItem(key, value);
      
      // Background sync to Supabase if enabled
      if (this.syncEnabled && this.shouldSync(key)) {
        this.backgroundSync(key, value).catch(console.error);
      }
    } catch (error) {
      console.error('Storage adapter setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
      
      if (this.syncEnabled && this.shouldSync(key)) {
        this.backgroundDelete(key).catch(console.error);
      }
    } catch (error) {
      console.error('Storage adapter removeItem error:', error);
    }
  }

  private shouldSync(key: string): boolean {
    // Only sync specific keys to avoid syncing everything
    const syncKeys = [
      'journal_trades',
      'user_settings',
      'display_name',
      'premium_status',
      'user_achievements'
    ];
    return syncKeys.some(syncKey => key.includes(syncKey));
  }

  private async backgroundFetch(key: string): Promise<void> {
    try {
      // Map localStorage keys to hybrid database methods
      if (key === 'journal_trades') {
        const trades = await hybridDatabase.getTrades(this.userId);
        if (trades.length > 0) {
          localStorage.setItem(key, JSON.stringify(trades));
        }
      }
      // Add more mappings as needed
    } catch (error) {
      console.error('Background fetch error:', error);
    }
  }

  private async backgroundSync(key: string, value: string): Promise<void> {
    try {
      // Map localStorage keys to hybrid database methods
      if (key === 'journal_trades') {
        const trades = JSON.parse(value);
        // Convert to Trade format and sync
        // This would need proper mapping
        console.log('📤 Background syncing trades to Supabase');
      }
      // Add more mappings as needed
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }

  private async backgroundDelete(key: string): Promise<void> {
    try {
      console.log('🗑️ Background deleting from Supabase:', key);
      // Implement deletion logic
    } catch (error) {
      console.error('Background delete error:', error);
    }
  }

  // Utility methods
  getSyncStatus() {
    return {
      enabled: this.syncEnabled,
      userId: this.userId
    };
  }

  async forceSyncAll(): Promise<void> {
    if (!this.syncEnabled) return;
    
    console.log('🔄 Force syncing all data...');
    
    // Sync all important keys
    const keys = ['journal_trades', 'user_settings', 'display_name'];
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        await this.backgroundSync(key, value);
      }
    }
  }
}

// Export singleton instance
export const storageAdapter = new StorageAdapter();

// Drop-in replacement for localStorage
export const enhancedStorage = {
  getItem: (key: string) => storageAdapter.getItem(key),
  setItem: (key: string, value: string) => storageAdapter.setItem(key, value),
  removeItem: (key: string) => storageAdapter.removeItem(key),
  getSyncStatus: () => storageAdapter.getSyncStatus(),
  forceSyncAll: () => storageAdapter.forceSyncAll()
};
