/**
 * Enhanced Achievement System
 * Comprehensive milestone and gamification framework
 */

export interface EnhancedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'trading' | 'discipline' | 'growth' | 'social' | 'streak' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  progress: number;
  maxProgress: number;
  isHidden: boolean;
  unlockConditions?: string[];
  timeLimit?: number; // in days
  tags: string[];
}

export interface AchievementRequirement {
  type: 'trades' | 'streak' | 'compliance' | 'growth' | 'social' | 'time';
  target: number;
  operator: 'gte' | 'lte' | 'eq';
  category?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export interface AchievementReward {
  type: 'experience' | 'badge' | 'title' | 'avatar' | 'theme' | 'feature' | 'premium';
  value: string | number;
  description: string;
  duration?: number; // for temporary rewards
}

export interface MilestoneChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  startDate: Date;
  endDate: Date;
  participants: number;
  isActive: boolean;
}

export const ACHIEVEMENT_TIERS = {
  bronze: { color: '#CD7F32', experience: 100, threshold: 1 },
  silver: { color: '#C0C0C0', experience: 250, threshold: 5 },
  gold: { color: '#FFD700', experience: 500, threshold: 25 },
  platinum: { color: '#E5E4E2', experience: 1000, threshold: 100 },
  diamond: { color: '#B9F2FF', experience: 2500, threshold: 500 }
} as const;

export const ENHANCED_ACHIEVEMENTS: EnhancedAchievement[] = [
  // Beginner Trading Achievements
  {
    id: 'first-trade',
    title: 'First Steps',
    description: 'Complete your very first trade',
    icon: '🎯',
    category: 'trading',
    tier: 'bronze',
    rarity: 'common',
    requirements: [{ type: 'trades', target: 1, operator: 'gte' }],
    rewards: [
      { type: 'experience', value: 100, description: '100 XP bonus' },
      { type: 'badge', value: 'first-trade', description: 'First Trade badge' }
    ],
    progress: 0,
    maxProgress: 1,
    isHidden: false,
    tags: ['beginner', 'milestone']
  },
  {
    id: 'trading-apprentice',
    title: 'Trading Apprentice',
    description: 'Complete 10 trades',
    icon: '📈',
    category: 'trading',
    tier: 'bronze',
    rarity: 'common',
    requirements: [{ type: 'trades', target: 10, operator: 'gte' }],
    rewards: [
      { type: 'experience', value: 250, description: '250 XP bonus' },
      { type: 'title', value: 'Apprentice Trader', description: 'Special title' }
    ],
    progress: 0,
    maxProgress: 10,
    isHidden: false,
    tags: ['beginner', 'volume']
  },

  // Discipline & Compliance Achievements
  {
    id: 'rule-follower',
    title: 'Rule Follower',
    description: 'Maintain 90% rule compliance for 10 trades',
    icon: '✅',
    category: 'discipline',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [
      { type: 'compliance', target: 90, operator: 'gte' },
      { type: 'trades', target: 10, operator: 'gte' }
    ],
    rewards: [
      { type: 'experience', value: 500, description: '500 XP bonus' },
      { type: 'badge', value: 'rule-follower', description: 'Rule Follower badge' }
    ],
    progress: 0,
    maxProgress: 10,
    isHidden: false,
    tags: ['discipline', 'compliance']
  },
  {
    id: 'discipline-master',
    title: 'Discipline Master',
    description: 'Achieve 95% rule compliance for 50 trades',
    icon: '👑',
    category: 'discipline',
    tier: 'gold',
    rarity: 'rare',
    requirements: [
      { type: 'compliance', target: 95, operator: 'gte' },
      { type: 'trades', target: 50, operator: 'gte' }
    ],
    rewards: [
      { type: 'experience', value: 1000, description: '1000 XP bonus' },
      { type: 'title', value: 'Discipline Master', description: 'Elite title' },
      { type: 'avatar', value: 'crown-avatar', description: 'Exclusive crown avatar' }
    ],
    progress: 0,
    maxProgress: 50,
    isHidden: false,
    tags: ['discipline', 'mastery', 'elite']
  },

  // Streak Achievements
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Trade consistently for 7 days',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    rarity: 'common',
    requirements: [{ type: 'streak', target: 7, operator: 'gte', timeframe: 'daily' }],
    rewards: [
      { type: 'experience', value: 200, description: '200 XP bonus' },
      { type: 'badge', value: 'week-warrior', description: 'Week Warrior badge' }
    ],
    progress: 0,
    maxProgress: 7,
    isHidden: false,
    tags: ['consistency', 'streak']
  },
  {
    id: 'month-master',
    title: 'Month Master',
    description: 'Maintain a 30-day trading streak',
    icon: '🌟',
    category: 'streak',
    tier: 'gold',
    rarity: 'rare',
    requirements: [{ type: 'streak', target: 30, operator: 'gte', timeframe: 'daily' }],
    rewards: [
      { type: 'experience', value: 1500, description: '1500 XP bonus' },
      { type: 'title', value: 'Month Master', description: 'Consistency champion' },
      { type: 'theme', value: 'golden-theme', description: 'Exclusive golden theme' }
    ],
    progress: 0,
    maxProgress: 30,
    isHidden: false,
    tags: ['consistency', 'dedication', 'elite']
  },

  // Growth & Performance Achievements
  {
    id: 'profit-maker',
    title: 'Profit Maker',
    description: 'Achieve 10% portfolio growth',
    icon: '💰',
    category: 'growth',
    tier: 'silver',
    rarity: 'uncommon',
    requirements: [{ type: 'growth', target: 10, operator: 'gte' }],
    rewards: [
      { type: 'experience', value: 750, description: '750 XP bonus' },
      { type: 'badge', value: 'profit-maker', description: 'Profit Maker badge' }
    ],
    progress: 0,
    maxProgress: 10,
    isHidden: false,
    tags: ['performance', 'growth']
  },
  {
    id: 'growth-champion',
    title: 'Growth Champion',
    description: 'Achieve 50% portfolio growth',
    icon: '🚀',
    category: 'growth',
    tier: 'platinum',
    rarity: 'epic',
    requirements: [{ type: 'growth', target: 50, operator: 'gte' }],
    rewards: [
      { type: 'experience', value: 2500, description: '2500 XP bonus' },
      { type: 'title', value: 'Growth Champion', description: 'Performance elite' },
      { type: 'feature', value: 'advanced-analytics', description: 'Unlock advanced analytics' }
    ],
    progress: 0,
    maxProgress: 50,
    isHidden: false,
    tags: ['performance', 'elite', 'growth']
  },

  // Social Achievements
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Connect with 5 trading friends',
    icon: '🦋',
    category: 'social',
    tier: 'bronze',
    rarity: 'common',
    requirements: [{ type: 'social', target: 5, operator: 'gte' }],
    rewards: [
      { type: 'experience', value: 300, description: '300 XP bonus' },
      { type: 'feature', value: 'group-challenges', description: 'Unlock group challenges' }
    ],
    progress: 0,
    maxProgress: 5,
    isHidden: false,
    tags: ['social', 'networking']
  },

  // Hidden/Special Achievements
  {
    id: 'perfect-month',
    title: 'Perfect Month',
    description: 'Complete a month with 100% rule compliance',
    icon: '💎',
    category: 'mastery',
    tier: 'diamond',
    rarity: 'legendary',
    requirements: [
      { type: 'compliance', target: 100, operator: 'eq', timeframe: 'monthly' },
      { type: 'trades', target: 20, operator: 'gte', timeframe: 'monthly' }
    ],
    rewards: [
      { type: 'experience', value: 5000, description: '5000 XP bonus' },
      { type: 'title', value: 'Perfect Trader', description: 'Legendary status' },
      { type: 'premium', value: 30, description: '30 days premium access' },
      { type: 'avatar', value: 'diamond-crown', description: 'Exclusive diamond avatar' }
    ],
    progress: 0,
    maxProgress: 1,
    isHidden: true,
    tags: ['legendary', 'perfect', 'mastery']
  }
];

export const DAILY_CHALLENGES: MilestoneChallenge[] = [
  {
    id: 'daily-compliance',
    title: 'Daily Discipline',
    description: 'Complete 3 rule-compliant trades today',
    icon: '⚡',
    type: 'daily',
    difficulty: 'easy',
    requirements: [
      { type: 'trades', target: 3, operator: 'gte', timeframe: 'daily' },
      { type: 'compliance', target: 100, operator: 'eq', timeframe: 'daily' }
    ],
    rewards: [
      { type: 'experience', value: 150, description: '150 XP bonus' }
    ],
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    participants: 0,
    isActive: true
  }
];

export class EnhancedAchievementSystem {
  private achievements: Map<string, EnhancedAchievement> = new Map();
  private challenges: Map<string, MilestoneChallenge> = new Map();

  constructor() {
    this.initializeAchievements();
    this.initializeChallenges();
  }

  private initializeAchievements(): void {
    ENHANCED_ACHIEVEMENTS.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private initializeChallenges(): void {
    DAILY_CHALLENGES.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  /**
   * Check and update achievement progress
   */
  checkAchievements(userStats: any): EnhancedAchievement[] {
    const unlockedAchievements: EnhancedAchievement[] = [];

    this.achievements.forEach(achievement => {
      if (this.isAchievementCompleted(achievement, userStats)) {
        unlockedAchievements.push(achievement);
      }
    });

    return unlockedAchievements;
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: string): EnhancedAchievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category);
  }

  /**
   * Get achievements by tier
   */
  getAchievementsByTier(tier: string): EnhancedAchievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.tier === tier);
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(): MilestoneChallenge[] {
    const now = new Date();
    return Array.from(this.challenges.values())
      .filter(challenge => 
        challenge.isActive && 
        challenge.startDate <= now && 
        challenge.endDate >= now
      );
  }

  /**
   * Calculate total experience from achievements
   */
  calculateTotalExperience(completedAchievements: string[]): number {
    return completedAchievements.reduce((total, achievementId) => {
      const achievement = this.achievements.get(achievementId);
      if (achievement) {
        const expReward = achievement.rewards.find(r => r.type === 'experience');
        return total + (expReward ? Number(expReward.value) : 0);
      }
      return total;
    }, 0);
  }

  private isAchievementCompleted(achievement: EnhancedAchievement, userStats: any): boolean {
    return achievement.requirements.every(req => {
      switch (req.type) {
        case 'trades':
          return userStats.totalTrades >= req.target;
        case 'compliance':
          return userStats.complianceRate >= req.target;
        case 'streak':
          return userStats.currentStreak >= req.target;
        case 'growth':
          return userStats.portfolioGrowth >= req.target;
        case 'social':
          return userStats.friendsCount >= req.target;
        default:
          return false;
      }
    });
  }
}

export const enhancedAchievementSystem = new EnhancedAchievementSystem();
