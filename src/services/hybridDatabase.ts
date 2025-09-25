/**
 * Hybrid Database Service
 * Cache-first approach with localStorage + Supabase sync for optimal performance
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Trade, User, UserProgress, AppSettings } from '../types';

interface CacheMetadata {
  lastSync: number;
  version: number;
  isDirty: boolean; // Has local changes not synced to Supabase
}

interface CachedData<T> {
  data: T;
  metadata: CacheMetadata;
}

export class HybridDatabaseService {
  private syncInProgress = false;
  private syncQueue: Set<string> = new Set();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly SYNC_RETRY_DELAY = 30 * 1000; // 30 seconds

  constructor() {
    // Start background sync if Supabase is configured
    if (isSupabaseConfigured()) {
      this.startBackgroundSync();
      this.setupOnlineListener();
    }
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  private getCacheKey(type: string, userId: string, id?: string): string {
    return `cache_${type}_${userId}${id ? `_${id}` : ''}`;
  }

  private getMetadataKey(cacheKey: string): string {
    return `${cacheKey}_meta`;
  }

  private getCachedData<T>(cacheKey: string): CachedData<T> | null {
    try {
      const data = localStorage.getItem(cacheKey);
      const metadataStr = localStorage.getItem(this.getMetadataKey(cacheKey));
      
      if (!data || !metadataStr) return null;

      const metadata: CacheMetadata = JSON.parse(metadataStr);
      return {
        data: JSON.parse(data),
        metadata
      };
    } catch {
      return null;
    }
  }

  private setCachedData<T>(cacheKey: string, data: T, isDirty = false): void {
    try {
      const metadata: CacheMetadata = {
        lastSync: Date.now(),
        version: Date.now(),
        isDirty
      };

      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(this.getMetadataKey(cacheKey), JSON.stringify(metadata));

      // Add to sync queue if dirty and Supabase is configured
      if (isDirty && isSupabaseConfigured()) {
        this.syncQueue.add(cacheKey);
        this.triggerSync();
      }
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  private isCacheValid(metadata: CacheMetadata): boolean {
    return Date.now() - metadata.lastSync < this.CACHE_DURATION;
  }

  private markCacheDirty(cacheKey: string): void {
    try {
      const metadataStr = localStorage.getItem(this.getMetadataKey(cacheKey));
      if (metadataStr) {
        const metadata: CacheMetadata = JSON.parse(metadataStr);
        metadata.isDirty = true;
        localStorage.setItem(this.getMetadataKey(cacheKey), JSON.stringify(metadata));
        
        if (isSupabaseConfigured()) {
          this.syncQueue.add(cacheKey);
          this.triggerSync();
        }
      }
    } catch (error) {
      console.error('Error marking cache dirty:', error);
    }
  }

  // =============================================================================
  // TRADES
  // =============================================================================

  async getTrades(userId: string): Promise<Trade[]> {
    const cacheKey = this.getCacheKey('trades', userId);
    const cached = this.getCachedData<Trade[]>(cacheKey);

    // Return cached data if valid
    if (cached && this.isCacheValid(cached.metadata)) {
      console.log('📦 Returning cached trades');
      return cached.data;
    }

    // Try to fetch from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        console.log('☁️ Fetching trades from Supabase');
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const trades = this.mapSupabaseTradesToTrades(data || []);
        this.setCachedData(cacheKey, trades, false);
        return trades;
      } catch (error) {
        console.error('Supabase fetch error:', error);
        // Fall back to cached data even if expired
        if (cached) {
          console.log('📦 Returning expired cached trades due to Supabase error');
          return cached.data;
        }
      }
    }

    // Fall back to cached data or empty array
    return cached?.data || [];
  }

  async saveTrade(trade: Trade): Promise<void> {
    const cacheKey = this.getCacheKey('trades', trade.userId);
    
    // Update cache immediately for instant UI response
    const cached = this.getCachedData<Trade[]>(cacheKey);
    const trades = cached?.data || [];
    
    const existingIndex = trades.findIndex(t => t.id === trade.id);
    if (existingIndex >= 0) {
      trades[existingIndex] = trade;
    } else {
      trades.unshift(trade); // Add to beginning for newest first
    }

    // Cache with dirty flag for sync
    this.setCachedData(cacheKey, trades, true);
    console.log('💾 Trade cached locally, queued for sync');

    // Try immediate sync if online
    if (isSupabaseConfigured() && navigator.onLine) {
      this.syncTradeToSupabase(trade);
    }
  }

  async deleteTrade(tradeId: string, userId: string): Promise<void> {
    const cacheKey = this.getCacheKey('trades', userId);
    
    // Update cache immediately
    const cached = this.getCachedData<Trade[]>(cacheKey);
    if (cached) {
      const filteredTrades = cached.data.filter(t => t.id !== tradeId);
      this.setCachedData(cacheKey, filteredTrades, true);
    }

    // Try immediate sync if online
    if (isSupabaseConfigured() && navigator.onLine) {
      try {
        await supabase.from('trades').delete().eq('id', tradeId);
        console.log('☁️ Trade deleted from Supabase');
      } catch (error) {
        console.error('Error deleting from Supabase:', error);
      }
    }
  }

  // =============================================================================
  // USER PROGRESS
  // =============================================================================

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const cacheKey = this.getCacheKey('progress', userId);
    const cached = this.getCachedData<UserProgress>(cacheKey);

    if (cached && this.isCacheValid(cached.metadata)) {
      console.log('📦 Returning cached progress');
      return cached.data;
    }

    if (isSupabaseConfigured()) {
      try {
        console.log('☁️ Fetching progress from Supabase');
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        const progress = data ? this.mapSupabaseProgressToProgress(data) : null;
        if (progress) {
          this.setCachedData(cacheKey, progress, false);
        }
        return progress;
      } catch (error) {
        console.error('Supabase progress fetch error:', error);
        if (cached) return cached.data;
      }
    }

    return cached?.data || null;
  }

  async saveUserProgress(progress: UserProgress): Promise<void> {
    const cacheKey = this.getCacheKey('progress', progress.userId);
    this.setCachedData(cacheKey, progress, true);
    console.log('💾 Progress cached locally, queued for sync');

    if (isSupabaseConfigured() && navigator.onLine) {
      this.syncProgressToSupabase(progress);
    }
  }

  // =============================================================================
  // APP SETTINGS
  // =============================================================================

  async getAppSettings(userId: string): Promise<AppSettings | null> {
    const cacheKey = this.getCacheKey('settings', userId);
    const cached = this.getCachedData<AppSettings>(cacheKey);

    if (cached && this.isCacheValid(cached.metadata)) {
      console.log('📦 Returning cached settings');
      return cached.data;
    }

    if (isSupabaseConfigured()) {
      try {
        console.log('☁️ Fetching settings from Supabase');
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        const settings = data ? this.mapSupabaseSettingsToSettings(data) : null;
        if (settings) {
          this.setCachedData(cacheKey, settings, false);
        }
        return settings;
      } catch (error) {
        console.error('Supabase settings fetch error:', error);
        if (cached) return cached.data;
      }
    }

    return cached?.data || null;
  }

  async saveAppSettings(settings: AppSettings): Promise<void> {
    const cacheKey = this.getCacheKey('settings', settings.userId);
    this.setCachedData(cacheKey, settings, true);
    console.log('💾 Settings cached locally, queued for sync');

    if (isSupabaseConfigured() && navigator.onLine) {
      this.syncSettingsToSupabase(settings);
    }
  }

  // =============================================================================
  // BACKGROUND SYNC
  // =============================================================================

  private startBackgroundSync(): void {
    // Sync every 2 minutes
    setInterval(() => {
      if (!this.syncInProgress && this.syncQueue.size > 0) {
        this.performBackgroundSync();
      }
    }, 2 * 60 * 1000);
  }

  private triggerSync(): void {
    // Debounced sync trigger
    setTimeout(() => {
      if (!this.syncInProgress && this.syncQueue.size > 0 && navigator.onLine) {
        this.performBackgroundSync();
      }
    }, 1000);
  }

  private async performBackgroundSync(): Promise<void> {
    if (this.syncInProgress || !isSupabaseConfigured() || !navigator.onLine) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting background sync...');

    const syncPromises: Promise<void>[] = [];

    for (const cacheKey of this.syncQueue) {
      if (cacheKey.includes('_trades_')) {
        syncPromises.push(this.syncTradesFromCache(cacheKey));
      } else if (cacheKey.includes('_progress_')) {
        syncPromises.push(this.syncProgressFromCache(cacheKey));
      } else if (cacheKey.includes('_settings_')) {
        syncPromises.push(this.syncSettingsFromCache(cacheKey));
      }
    }

    try {
      await Promise.allSettled(syncPromises);
      console.log('✅ Background sync completed');
    } catch (error) {
      console.error('Background sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncTradesFromCache(cacheKey: string): Promise<void> {
    const cached = this.getCachedData<Trade[]>(cacheKey);
    if (!cached || !cached.metadata.isDirty) return;

    try {
      for (const trade of cached.data) {
        await this.syncTradeToSupabase(trade);
      }
      
      // Mark as clean
      cached.metadata.isDirty = false;
      localStorage.setItem(this.getMetadataKey(cacheKey), JSON.stringify(cached.metadata));
      this.syncQueue.delete(cacheKey);
    } catch (error) {
      console.error('Error syncing trades:', error);
    }
  }

  private async syncTradeToSupabase(trade: Trade): Promise<void> {
    try {
      const supabaseTrade = this.mapTradeToSupabase(trade);
      const { error } = await supabase.from('trades').upsert(supabaseTrade);
      if (error) throw error;
      console.log(`☁️ Trade ${trade.id} synced to Supabase`);
    } catch (error) {
      console.error('Error syncing trade to Supabase:', error);
      throw error;
    }
  }

  private async syncProgressFromCache(cacheKey: string): Promise<void> {
    const cached = this.getCachedData<UserProgress>(cacheKey);
    if (!cached || !cached.metadata.isDirty) return;

    try {
      await this.syncProgressToSupabase(cached.data);
      
      cached.metadata.isDirty = false;
      localStorage.setItem(this.getMetadataKey(cacheKey), JSON.stringify(cached.metadata));
      this.syncQueue.delete(cacheKey);
    } catch (error) {
      console.error('Error syncing progress:', error);
    }
  }

  private async syncProgressToSupabase(progress: UserProgress): Promise<void> {
    try {
      const supabaseProgress = this.mapProgressToSupabase(progress);
      const { error } = await supabase.from('user_progress').upsert(supabaseProgress);
      if (error) throw error;
      console.log(`☁️ Progress synced to Supabase`);
    } catch (error) {
      console.error('Error syncing progress to Supabase:', error);
      throw error;
    }
  }

  private async syncSettingsFromCache(cacheKey: string): Promise<void> {
    const cached = this.getCachedData<AppSettings>(cacheKey);
    if (!cached || !cached.metadata.isDirty) return;

    try {
      await this.syncSettingsToSupabase(cached.data);
      
      cached.metadata.isDirty = false;
      localStorage.setItem(this.getMetadataKey(cacheKey), JSON.stringify(cached.metadata));
      this.syncQueue.delete(cacheKey);
    } catch (error) {
      console.error('Error syncing settings:', error);
    }
  }

  private async syncSettingsToSupabase(settings: AppSettings): Promise<void> {
    try {
      const supabaseSettings = this.mapSettingsToSupabase(settings);
      const { error } = await supabase.from('app_settings').upsert(supabaseSettings);
      if (error) throw error;
      console.log(`☁️ Settings synced to Supabase`);
    } catch (error) {
      console.error('Error syncing settings to Supabase:', error);
      throw error;
    }
  }

  // =============================================================================
  // ONLINE/OFFLINE HANDLING
  // =============================================================================

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Back online - triggering sync');
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline - using cache only');
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async forceSyncAll(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !navigator.onLine) {
      throw new Error('Supabase not configured or offline');
    }

    console.log('🔄 Force syncing all data...');

    // Mark all cached data as dirty to force sync
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(`cache_`) && key.includes(userId) && !key.endsWith('_meta')) {
        this.markCacheDirty(key);
      }
    }

    await this.performBackgroundSync();
  }

  async clearCache(userId?: string): Promise<void> {
    const keys = Object.keys(localStorage);
    const keysToRemove = keys.filter(key => {
      if (!key.startsWith('cache_')) return false;
      return userId ? key.includes(userId) : true;
    });

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(this.getMetadataKey(key));
    });

    console.log(`🗑️ Cleared ${keysToRemove.length} cache entries`);
  }

  getSyncStatus(): { 
    isOnline: boolean; 
    syncQueueSize: number; 
    syncInProgress: boolean;
    supabaseConfigured: boolean;
  } {
    return {
      isOnline: navigator.onLine,
      syncQueueSize: this.syncQueue.size,
      syncInProgress: this.syncInProgress,
      supabaseConfigured: isSupabaseConfigured()
    };
  }

  // =============================================================================
  // MAPPING METHODS (same as before)
  // =============================================================================

  private mapSupabaseTradesToTrades(supabaseTrades: any[]): Trade[] {
    return supabaseTrades.map(trade => ({
      id: trade.id,
      userId: trade.user_id,
      symbol: trade.symbol,
      type: trade.type,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      quantity: trade.quantity,
      entryDate: new Date(trade.entry_date),
      exitDate: trade.exit_date ? new Date(trade.exit_date) : undefined,
      profitLoss: trade.profit_loss,
      profitLossPercent: trade.profit_loss_percent,
      fees: trade.fees,
      notes: trade.notes,
      tags: trade.tags || [],
      screenshots: trade.screenshots || [],
      ruleCompliant: trade.rule_compliant,
      emotions: trade.emotions || [],
      setup: trade.setup,
      strategy: trade.strategy,
      status: trade.status,
      aiAnalysis: trade.ai_analysis,
      createdAt: new Date(trade.created_at),
      updatedAt: new Date(trade.updated_at)
    }));
  }

  private mapTradeToSupabase(trade: Trade): any {
    return {
      id: trade.id,
      user_id: trade.userId,
      symbol: trade.symbol,
      type: trade.type,
      entry_price: trade.entryPrice,
      exit_price: trade.exitPrice,
      quantity: trade.quantity,
      entry_date: trade.entryDate.toISOString(),
      exit_date: trade.exitDate?.toISOString(),
      profit_loss: trade.profitLoss,
      profit_loss_percent: trade.profitLossPercent,
      fees: trade.fees,
      notes: trade.notes,
      tags: trade.tags,
      screenshots: trade.screenshots,
      rule_compliant: trade.ruleCompliant,
      emotions: trade.emotions,
      setup: trade.setup,
      strategy: trade.strategy,
      status: trade.status,
      ai_analysis: trade.aiAnalysis,
      created_at: trade.createdAt.toISOString(),
      updated_at: trade.updatedAt.toISOString()
    };
  }

  private mapSupabaseProgressToProgress(data: any): UserProgress {
    return {
      userId: data.user_id,
      completions: data.completions,
      streak: data.streak,
      longestStreak: data.longest_streak,
      disciplineScore: data.discipline_score,
      totalProfitLoss: data.total_profit_loss,
      winRate: data.win_rate,
      averageRiskReward: data.average_risk_reward,
      currentBalance: data.current_balance,
      achievements: data.achievements || [],
      milestones: data.milestones || [],
      level: data.level,
      experience: data.experience,
      nextLevelProgress: data.next_level_progress,
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapProgressToSupabase(progress: UserProgress): any {
    return {
      user_id: progress.userId,
      completions: progress.completions,
      streak: progress.streak,
      longest_streak: progress.longestStreak,
      discipline_score: progress.disciplineScore,
      total_profit_loss: progress.totalProfitLoss,
      win_rate: progress.winRate,
      average_risk_reward: progress.averageRiskReward,
      current_balance: progress.currentBalance,
      achievements: progress.achievements,
      milestones: progress.milestones,
      level: progress.level,
      experience: progress.experience,
      next_level_progress: progress.nextLevelProgress,
      updated_at: progress.updatedAt.toISOString()
    };
  }

  private mapSupabaseSettingsToSettings(data: any): AppSettings {
    return {
      userId: data.user_id,
      startingPortfolio: data.starting_portfolio,
      targetCompletions: data.target_completions,
      growthPerCompletion: data.growth_per_completion,
      progressObject: data.progress_object,
      rules: data.rules || [],
      notifications: data.notifications || {},
      privacy: data.privacy || {},
      trading: data.trading || {},
      ui: data.ui || {},
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapSettingsToSupabase(settings: AppSettings): any {
    return {
      user_id: settings.userId,
      starting_portfolio: settings.startingPortfolio,
      target_completions: settings.targetCompletions,
      growth_per_completion: settings.growthPerCompletion,
      progress_object: settings.progressObject,
      rules: settings.rules,
      notifications: settings.notifications,
      privacy: settings.privacy,
      trading: settings.trading,
      ui: settings.ui,
      updated_at: settings.updatedAt.toISOString()
    };
  }
}

// Export singleton instance
export const hybridDatabase = new HybridDatabaseService();
