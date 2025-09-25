/**
 * Data Reset Utility
 * Clears hardcoded demo data and ensures fresh start
 */

export const resetUserData = () => {
  try {
    // Clear all user-related localStorage data
    const keysToRemove = [
      // User data
      'user_progress',
      'user_settings', 
      'user_rules',
      'display_name',
      'premium_status',
      'user_achievements',
      
      // Journal and trades
      'journal_trades',
      'journal_notes',
      'journal_migrated_images_v1',
      'journal_cleanup_images_v1',
      'daily_stats',
      'activity_log',
      
      // Notifications
      'app_notifications',
      
      // Leaderboard
      'leaderboard_last_reset',
      'leaderboard_history',
      'current_user_rank',
      'monthly_leaderboard_data',
      
      // Any trades with user prefixes
      'trades_demo-user',
      'trades_user1'
    ];

    // Also clear any keys that match patterns
    const allKeys = Object.keys(localStorage);
    const patternKeys = allKeys.filter(key => 
      key.startsWith('trades_') || 
      key.startsWith('journal_') ||
      key.startsWith('user_') ||
      key.includes('leaderboard')
    );

    // Remove explicit keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Remove pattern-matched keys
    patternKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log(`✅ User data reset completed - removed ${keysToRemove.length + patternKeys.length} keys`);
    return true;
  } catch (error) {
    console.error('❌ Error resetting user data:', error);
    return false;
  }
};

export const initializeFreshUser = (settings?: {
  startingPortfolio?: number;
  targetCompletions?: number;
  growthPerCompletion?: number;
  progressObject?: 'beer' | 'wine' | 'donut' | 'diamond' | 'trophy';
}) => {
  try {
    // Set default settings
    const defaultSettings = {
      startingPortfolio: settings?.startingPortfolio || 100,
      targetCompletions: settings?.targetCompletions || 50,
      growthPerCompletion: settings?.growthPerCompletion || 1,
      progressObject: settings?.progressObject || 'beer',
      rules: []
    };

    // Set fresh progress
    const freshProgress = {
      completions: 0,
      currentBalance: defaultSettings.startingPortfolio,
      disciplineScore: 0,
      streak: 0,
      nextProgressPct: 0
    };

    // Save to localStorage
    localStorage.setItem('user_settings', JSON.stringify(defaultSettings));
    localStorage.setItem('user_progress', JSON.stringify(freshProgress));
    localStorage.setItem('display_name', 'Trading Pro');
    localStorage.setItem('premium_status', 'none');
    localStorage.setItem('user_achievements', JSON.stringify([]));

    console.log('✅ Fresh user initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing fresh user:', error);
    return false;
  }
};

export const validateDataConsistency = () => {
  try {
    const issues: string[] = [];

    // Check if progress matches settings
    const settings = JSON.parse(localStorage.getItem('user_settings') || '{}');
    const progress = JSON.parse(localStorage.getItem('user_progress') || '{}');

    if (progress.completions === 0 && progress.currentBalance !== settings.startingPortfolio) {
      issues.push('Current balance does not match starting portfolio for zero completions');
    }

    if (progress.completions > settings.targetCompletions) {
      issues.push('Completions exceed target completions');
    }

    if (progress.disciplineScore > 100) {
      issues.push('Discipline score exceeds maximum (100)');
    }

    if (issues.length > 0) {
      console.warn('⚠️ Data consistency issues found:', issues);
      return { valid: false, issues };
    }

    console.log('✅ Data consistency validated');
    return { valid: true, issues: [] };
  } catch (error) {
    console.error('❌ Error validating data consistency:', error);
    return { valid: false, issues: ['Error reading data'] };
  }
};

// Quick console utility for immediate data clearing
export const quickReset = () => {
  console.log('🔄 Starting quick data reset...');
  const success = resetUserData();
  if (success) {
    initializeFreshUser();
    console.log('✅ Data reset complete! Refreshing page...');
    setTimeout(() => window.location.reload(), 1000);
  }
  return success;
};

// Nuclear option - clear ALL localStorage
export const nuclearReset = () => {
  console.log('💥 NUCLEAR RESET - Clearing ALL localStorage...');
  try {
    const keyCount = localStorage.length;
    localStorage.clear();
    console.log(`✅ Cleared ${keyCount} localStorage keys`);
    initializeFreshUser();
    console.log('✅ Fresh user initialized. Refreshing page...');
    setTimeout(() => window.location.reload(), 1000);
    return true;
  } catch (error) {
    console.error('❌ Nuclear reset failed:', error);
    return false;
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).quickReset = quickReset;
  (window as any).nuclearReset = nuclearReset;
}
