/**
 * Database Service
 * Unified interface for data persistence with Supabase and localStorage fallback
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Trade, User, UserProgress, AppSettings } from '../types';

export class DatabaseService {
  private useSupabase: boolean;

  constructor() {
    this.useSupabase = isSupabaseConfigured();
    console.log(`Database service initialized with ${this.useSupabase ? 'Supabase' : 'localStorage'}`);
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Clear all local data (for switching to Supabase)
   */
  async clearLocalData(): Promise<void> {
    try {
      // Clear all localStorage data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('trades_') ||
          key.startsWith('user_') ||
          key.startsWith('progress_') ||
          key.startsWith('settings_') ||
          key.includes('onboarding') ||
          key.includes('discipline')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cleared ${keysToRemove.length} localStorage items`);
    } catch (error) {
      console.error('Error clearing local data:', error);
      throw error;
    }
  }

  /**
   * Switch to Supabase if configured
   */
  switchToSupabase(): boolean {
    if (isSupabaseConfigured()) {
      this.useSupabase = true;
      return true;
    }
    return false;
  }

  // =============================================================================
  // TRADES
  // =============================================================================

  async getTrades(userId: string): Promise<Trade[]> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return this.mapSupabaseTradesToTrades(data || []);
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        return this.getTradesFromLocalStorage(userId);
      }
    } else {
      return this.getTradesFromLocalStorage(userId);
    }
  }

  async saveTrade(trade: Trade): Promise<void> {
    if (this.useSupabase) {
      try {
        const supabaseTrade = this.mapTradeToSupabase(trade);
        const { error } = await supabase
          .from('trades')
          .upsert(supabaseTrade);

        if (error) throw error;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        this.saveTradeToLocalStorage(trade);
      }
    } else {
      this.saveTradeToLocalStorage(trade);
    }
  }

  async deleteTrade(tradeId: string): Promise<void> {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('id', tradeId);

        if (error) throw error;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        this.deleteTradeFromLocalStorage(tradeId);
      }
    } else {
      this.deleteTradeFromLocalStorage(tradeId);
    }
  }

  // =============================================================================
  // USER PROGRESS
  // =============================================================================

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
        return data ? this.mapSupabaseProgressToProgress(data) : null;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        return this.getUserProgressFromLocalStorage(userId);
      }
    } else {
      return this.getUserProgressFromLocalStorage(userId);
    }
  }

  async saveUserProgress(progress: UserProgress): Promise<void> {
    if (this.useSupabase) {
      try {
        const supabaseProgress = this.mapProgressToSupabase(progress);
        const { error } = await supabase
          .from('user_progress')
          .upsert(supabaseProgress);

        if (error) throw error;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        this.saveUserProgressToLocalStorage(progress);
      }
    } else {
      this.saveUserProgressToLocalStorage(progress);
    }
  }

  // =============================================================================
  // APP SETTINGS
  // =============================================================================

  async getAppSettings(userId: string): Promise<AppSettings | null> {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? this.mapSupabaseSettingsToSettings(data) : null;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        return this.getAppSettingsFromLocalStorage(userId);
      }
    } else {
      return this.getAppSettingsFromLocalStorage(userId);
    }
  }

  async saveAppSettings(settings: AppSettings): Promise<void> {
    if (this.useSupabase) {
      try {
        const supabaseSettings = this.mapSettingsToSupabase(settings);
        const { error } = await supabase
          .from('app_settings')
          .upsert(supabaseSettings);

        if (error) throw error;
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
        this.saveAppSettingsToLocalStorage(settings);
      }
    } else {
      this.saveAppSettingsToLocalStorage(settings);
    }
  }

  // =============================================================================
  // LOCALSTORAGE FALLBACK METHODS
  // =============================================================================

  private getTradesFromLocalStorage(userId: string): Trade[] {
    try {
      const stored = localStorage.getItem(`trades_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveTradeToLocalStorage(trade: Trade): void {
    try {
      const trades = this.getTradesFromLocalStorage(trade.userId);
      const existingIndex = trades.findIndex(t => t.id === trade.id);
      
      if (existingIndex >= 0) {
        trades[existingIndex] = trade;
      } else {
        trades.push(trade);
      }
      
      localStorage.setItem(`trades_${trade.userId}`, JSON.stringify(trades));
    } catch (error) {
      console.error('Error saving trade to localStorage:', error);
    }
  }

  private deleteTradeFromLocalStorage(tradeId: string): void {
    try {
      // We need to find which user this trade belongs to
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('trades_')) {
          const trades = JSON.parse(localStorage.getItem(key) || '[]');
          const filteredTrades = trades.filter((t: Trade) => t.id !== tradeId);
          if (filteredTrades.length !== trades.length) {
            localStorage.setItem(key, JSON.stringify(filteredTrades));
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error deleting trade from localStorage:', error);
    }
  }

  private getUserProgressFromLocalStorage(userId: string): UserProgress | null {
    try {
      const stored = localStorage.getItem(`progress_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveUserProgressToLocalStorage(progress: UserProgress): void {
    try {
      localStorage.setItem(`progress_${progress.userId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  }

  private getAppSettingsFromLocalStorage(userId: string): AppSettings | null {
    try {
      const stored = localStorage.getItem(`settings_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveAppSettingsToLocalStorage(settings: AppSettings): void {
    try {
      localStorage.setItem(`settings_${settings.userId}`, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  // =============================================================================
  // MAPPING METHODS
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
export const databaseService = new DatabaseService();
