/**
 * Data Reset Utility
 * Clears hardcoded demo data and ensures fresh start
 */

export const resetUserData = () => {
  try {
    // Clear all user-related localStorage data
    const keysToRemove = [
      'user_progress',
      'user_settings', 
      'user_rules',
      'display_name',
      'premium_status',
      'user_achievements',
      'journal_trades',
      'journal_notes',
      'leaderboard_last_reset',
      'leaderboard_history',
      'current_user_rank',
      'monthly_leaderboard_data'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ User data reset completed');
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
