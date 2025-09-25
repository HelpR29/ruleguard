/**
 * Advanced Gamification System
 * Comprehensive gamification with achievements, XP, leaderboards, and social features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Medal,
  Crown,
  Zap,
  Target,
  Flame,
  Award,
  Gift,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { Trade, UserProgress } from '../types';

// =============================================================================
// ACHIEVEMENT SYSTEM
// =============================================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  type: AchievementType;
  rarity: AchievementRarity;
  requirements: AchievementRequirement[];
  rewards: Reward[];
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  isHidden: boolean;
  prerequisites?: string[];
  tags: string[];
  metadata?: Record<string, any>;
}

export type AchievementCategory =
  | 'trading' | 'discipline' | 'progress' | 'social' | 'special' | 'milestone';

export type AchievementType =
  | 'streak' | 'completions' | 'profit' | 'discipline'
  | 'consistency' | 'learning' | 'social' | 'special' | 'collection';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementRequirement {
  type: 'trades' | 'profit' | 'streak' | 'discipline' | 'consistency' | 'social' | 'custom';
  target: number;
  operator: 'gte' | 'lte' | 'eq' | 'between';
  period?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  metadata?: Record<string, any>;
}

export interface Reward {
  type: 'experience' | 'title' | 'badge' | 'feature' | 'cosmetic' | 'currency';
  value: string | number;
  description: string;
  rarity?: AchievementRarity;
  isConsumable: boolean;
}

// =============================================================================
// XP & LEVELING SYSTEM
// =============================================================================

export interface Level {
  level: number;
  experienceRequired: number;
  title: string;
  description: string;
  rewards: Reward[];
  unlocks: string[];
}

export interface ExperienceEvent {
  id: string;
  type: 'trade' | 'achievement' | 'streak' | 'discipline' | 'social' | 'bonus';
  amount: number;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserLevel {
  currentLevel: number;
  currentExperience: number;
  totalExperience: number;
  experienceToNext: number;
  levelProgress: number; // 0-100
  lifetimeStats: {
    totalTrades: number;
    totalProfit: number;
    longestStreak: number;
    achievementsUnlocked: number;
    badgesEarned: number;
  };
}

// =============================================================================
// LEADERBOARD SYSTEM
// =============================================================================

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar?: string;
  score: number;
  rank: number;
  change: number; // Position change from last period
  stats: {
    level: number;
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    streak: number;
    achievements: number;
  };
  badges: string[];
  isCurrentUser: boolean;
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: 'global' | 'friends' | 'regional' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  scoring: 'experience' | 'profit' | 'trades' | 'discipline' | 'composite';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
  isRealTime: boolean;
}

// =============================================================================
// STREAK & PROGRESS SYSTEM
// =============================================================================

export interface StreakData {
  current: number;
  longest: number;
  lastTradeDate: Date | null;
  streakHistory: Array<{
    date: Date;
    maintained: boolean;
    reason?: string;
  }>;
  milestones: number[];
  rewards: Reward[];
}

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: 'trades' | 'profit' | 'streak' | 'discipline' | 'custom';
  rewards: Reward[];
  completedAt?: Date;
  isActive: boolean;
}

// =============================================================================
// BADGE & COLLECTION SYSTEM
// =============================================================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  category: string;
  requirements: AchievementRequirement[];
  maxProgress: number;
  progress: number;
  unlockedAt?: Date;
  isVisible: boolean;
  metadata?: Record<string, any>;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  theme: string;
  badges: Badge[];
  completedAt?: Date;
  progress: number; // 0-100
  rewards: Reward[];
}

// =============================================================================
// SOCIAL GAMIFICATION
// =============================================================================

export interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'group' | 'competitive';
  participants: string[];
  maxParticipants: number;
  startDate: Date;
  endDate: Date;
  objectives: AchievementRequirement[];
  rewards: Reward[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  maxMembers: number;
  isPrivate: boolean;
  createdAt: Date;
  createdBy: string;
  settings: GroupSettings;
  stats: GroupStats;
}

export interface GroupSettings {
  allowInvites: boolean;
  requireApproval: boolean;
  minLevelRequirement: number;
  autoKickInactivity: number; // days
}

export interface GroupStats {
  totalTrades: number;
  totalMembers: number;
  avgWinRate: number;
  totalProfit: number;
  activeStreaks: number;
  achievementsThisWeek: number;
}

// =============================================================================
// GAMIFICATION ENGINE
// =============================================================================

/**
 * Advanced Gamification Engine
 */
export class GamificationEngine {
  private static instance: GamificationEngine;
  private achievements: Map<string, Achievement> = new Map();
  private levels: Map<number, Level> = new Map();
  private badges: Map<string, Badge> = new Map();
  private collections: Map<string, Collection> = new Map();

  private constructor() {
    this.initializeAchievements();
    this.initializeLevels();
    this.initializeBadges();
  }

  static getInstance(): GamificationEngine {
    if (!GamificationEngine.instance) {
      GamificationEngine.instance = new GamificationEngine();
    }
    return GamificationEngine.instance;
  }

  /**
   * Process a trade and update gamification data
   */
  async processTrade(trade: Trade, userProgress: UserProgress): Promise<{
    experienceGained: number;
    achievements: Achievement[];
    badges: Badge[];
    levelUp: boolean;
    newStreak: number;
  }> {
    const experienceGained = this.calculateTradeExperience(trade);
    const achievements = this.checkAchievements(trade, userProgress);
    const badges = this.updateBadges(trade, userProgress);
    const levelUp = this.checkLevelUp(userProgress, experienceGained);
    const newStreak = this.updateStreak(trade, userProgress);

    return {
      experienceGained,
      achievements,
      badges,
      levelUp,
      newStreak
    };
  }

  /**
   * Calculate experience gained from a trade
   */
  private calculateTradeExperience(trade: Trade): number {
    let baseXP = 10; // Base experience for any trade

    // Bonus for rule compliance
    if (trade.ruleCompliant) {
      baseXP += 5;
    }

    // Bonus for profit
    if (trade.profitLoss && trade.profitLoss > 0) {
      baseXP += Math.floor(trade.profitLoss / 10);
    }

    // Bonus for risk management (target/stop defined)
    if (trade.target && trade.stop) {
      baseXP += 3;
    }

    // Bonus for detailed notes
    if (trade.notes && trade.notes.length > 50) {
      baseXP += 2;
    }

    // Bonus for emotional awareness
    if (trade.emotions && trade.emotions.length > 0) {
      baseXP += 1;
    }

    return Math.max(baseXP, 1); // Minimum 1 XP
  }

  /**
   * Check for newly unlocked achievements
   */
  private checkAchievements(trade: Trade, userProgress: UserProgress): Achievement[] {
    const newAchievements: Achievement[] = [];

    for (const achievement of this.achievements.values()) {
      if (achievement.unlockedAt) continue; // Already unlocked

      const progress = this.calculateAchievementProgress(achievement, trade, userProgress);

      if (progress >= achievement.maxProgress) {
        achievement.progress = progress;
        achievement.unlockedAt = new Date();
        newAchievements.push(achievement);
      } else {
        achievement.progress = progress;
      }
    }

    return newAchievements;
  }

  /**
   * Update badge progress
   */
  private updateBadges(trade: Trade, userProgress: UserProgress): Badge[] {
    const updatedBadges: Badge[] = [];

    for (const badge of this.badges.values()) {
      if (badge.unlockedAt) continue; // Already unlocked

      const progress = this.calculateBadgeProgress(badge, trade, userProgress);

      if (progress >= badge.maxProgress) {
        badge.progress = progress;
        badge.unlockedAt = new Date();
        updatedBadges.push(badge);
      } else {
        badge.progress = progress;
      }
    }

    return updatedBadges;
  }

  /**
   * Check for level up
   */
  private checkLevelUp(userProgress: UserProgress, experienceGained: number): boolean {
    const currentLevel = this.levels.get(userProgress.level);
    if (!currentLevel) return false;

    const newExperience = userProgress.experience + experienceGained;
    const nextLevel = userProgress.level + 1;
    const nextLevelData = this.levels.get(nextLevel);

    return nextLevelData ? newExperience >= nextLevelData.experienceRequired : false;
  }

  /**
   * Update streak data
   */
  private updateStreak(trade: Trade, userProgress: UserProgress): number {
    const tradeDate = new Date(trade.entryDate);
    const lastTradeDate = userProgress.lastTradeDate ? new Date(userProgress.lastTradeDate) : null;

    if (!lastTradeDate) {
      return 1; // First trade
    }

    const daysDiff = Math.floor((tradeDate.getTime() - lastTradeDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      return userProgress.streak + 1;
    } else if (daysDiff === 0) {
      // Same day
      return userProgress.streak;
    } else {
      // Streak broken
      return 1;
    }
  }

  /**
   * Calculate achievement progress
   */
  private calculateAchievementProgress(
    achievement: Achievement,
    trade: Trade,
    userProgress: UserProgress
  ): number {
    // This is a simplified implementation
    // In a real system, this would check against various metrics

    switch (achievement.type) {
      case 'completions':
        return userProgress.completions;
      case 'streak':
        return userProgress.streak;
      case 'profit':
        return userProgress.totalProfitLoss;
      case 'discipline':
        return userProgress.disciplineScore;
      default:
        return 0;
    }
  }

  /**
   * Calculate badge progress
   */
  private calculateBadgeProgress(
    badge: Badge,
    trade: Trade,
    userProgress: UserProgress
  ): number {
    // Simplified badge progress calculation
    return badge.progress + 1;
  }

  /**
   * Get user level data
   */
  getUserLevel(experience: number): UserLevel {
    const levels = Array.from(this.levels.values()).sort((a, b) => a.level - b.level);

    let currentLevel = 1;
    let experienceToNext = 0;

    for (const level of levels) {
      if (experience >= level.experienceRequired) {
        currentLevel = level.level;
        experienceToNext = level.experienceRequired;
      } else {
        experienceToNext = level.experienceRequired - experience;
        break;
      }
    }

    const nextLevel = currentLevel + 1;
    const nextLevelData = this.levels.get(nextLevel);

    return {
      currentLevel,
      currentExperience: experience,
      totalExperience: experience,
      experienceToNext: nextLevelData ? nextLevelData.experienceRequired - experience : 0,
      levelProgress: nextLevelData ? (experience / nextLevelData.experienceRequired) * 100 : 100,
      lifetimeStats: {
        totalTrades: 0, // Would be calculated from actual data
        totalProfit: 0,
        longestStreak: 0,
        achievementsUnlocked: this.achievements.size,
        badgesEarned: this.badges.size
      }
    };
  }

  /**
   * Initialize default achievements
   */
  private initializeAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-trade',
        title: 'First Steps',
        description: 'Complete your first trade',
        icon: '🎯',
        category: 'trading',
        type: 'completions',
        rarity: 'common',
        requirements: [{ type: 'trades', target: 1, operator: 'gte' }],
        rewards: [{ type: 'experience', value: 100, description: '100 XP bonus' }],
        progress: 0,
        maxProgress: 1,
        isHidden: false,
        tags: ['beginner', 'milestone']
      },
      {
        id: 'rule-master',
        title: 'Rule Master',
        description: 'Complete 50 rule-compliant trades',
        icon: '👑',
        category: 'discipline',
        type: 'discipline',
        rarity: 'rare',
        requirements: [{ type: 'trades', target: 50, operator: 'gte' }],
        rewards: [
          { type: 'title', value: 'Rule Master', description: 'Special title' },
          { type: 'experience', value: 500, description: '500 XP bonus' }
        ],
        progress: 0,
        maxProgress: 50,
        isHidden: false,
        tags: ['discipline', 'consistency']
      },
      {
        id: 'streak-warrior',
        title: 'Streak Warrior',
        description: 'Maintain a 30-day trading streak',
        icon: '🔥',
        category: 'progress',
        type: 'streak',
        rarity: 'epic',
        requirements: [{ type: 'streak', target: 30, operator: 'gte' }],
        rewards: [
          { type: 'badge', value: 'streak-warrior', description: 'Streak Warrior badge' },
          { type: 'experience', value: 1000, description: '1000 XP bonus' }
        ],
        progress: 0,
        maxProgress: 30,
        isHidden: false,
        tags: ['streak', 'consistency', 'legendary']
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Initialize levels
   */
  private initializeLevels(): void {
    const levels: Level[] = [
      {
        level: 1,
        experienceRequired: 0,
        title: 'Novice Trader',
        description: 'Just getting started',
        rewards: [{ type: 'experience', value: 0, description: 'Welcome bonus' }],
        unlocks: ['basic_trading', 'simple_analytics']
      },
      {
        level: 2,
        experienceRequired: 100,
        title: 'Apprentice Trader',
        description: 'Learning the ropes',
        rewards: [{ type: 'experience', value: 50, description: 'Level up bonus' }],
        unlocks: ['advanced_analytics', 'basic_achievements']
      },
      {
        level: 5,
        experienceRequired: 500,
        title: 'Skilled Trader',
        description: 'Developing skills',
        rewards: [{ type: 'title', value: 'Skilled Trader', description: 'New title' }],
        unlocks: ['custom_rules', 'advanced_reports']
      },
      {
        level: 10,
        experienceRequired: 2000,
        title: 'Expert Trader',
        description: 'Master of the markets',
        rewards: [
          { type: 'badge', value: 'expert', description: 'Expert badge' },
          { type: 'experience', value: 1000, description: 'Expert bonus' }
        ],
        unlocks: ['ai_insights', 'premium_features']
      }
    ];

    levels.forEach(level => {
      this.levels.set(level.level, level);
    });
  }

  /**
   * Initialize badges
   */
  private initializeBadges(): void {
    const badges: Badge[] = [
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Trade before market opens',
        icon: '🌅',
        rarity: 'common',
        category: 'trading',
        requirements: [{ type: 'custom', target: 1, operator: 'gte' }],
        maxProgress: 10,
        progress: 0,
        isVisible: true
      },
      {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Trade after hours',
        icon: '🦉',
        rarity: 'rare',
        category: 'trading',
        requirements: [{ type: 'custom', target: 5, operator: 'gte' }],
        maxProgress: 5,
        progress: 0,
        isVisible: true
      }
    ];

    badges.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }
}

// =============================================================================
// REACT COMPONENTS
// =============================================================================

/**
 * Achievement Card Component
 */
export const AchievementCard = ({
  achievement,
  onClick
}: {
  achievement: Achievement;
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getRarityColor = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity: AchievementRarity) => {
    switch (rarity) {
      case 'legendary': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'epic': return <Medal className="h-4 w-4 text-purple-500" />;
      case 'rare': return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Trophy className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <motion.div
      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${getRarityColor(achievement.rarity)} ${
        achievement.unlockedAt ? 'opacity-100' : 'opacity-60'
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Unlock overlay */}
      {!achievement.unlockedAt && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
          <Lock className="h-8 w-8 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="text-2xl">{achievement.icon}</div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
            {getRarityIcon(achievement.rarity)}
          </div>

          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{achievement.progress} / {achievement.maxProgress}</span>
            <span>{achievement.category}</span>
          </div>
        </div>
      </div>

      {/* Rewards preview */}
      {isHovered && achievement.rewards.length > 0 && (
        <motion.div
          className="absolute -bottom-2 left-4 right-4 bg-white border rounded-lg p-2 shadow-lg z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-medium text-gray-700 mb-1">Rewards:</p>
          <div className="flex flex-wrap gap-1">
            {achievement.rewards.map((reward, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {reward.description}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Level Progress Component
 */
export const LevelProgress = ({
  userLevel,
  className = ''
}: {
  userLevel: UserLevel;
  className?: string;
}) => {
  const nextLevel = userLevel.currentLevel + 1;
  const progressPercentage = Math.min(userLevel.levelProgress, 100);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Level {userLevel.currentLevel}
          </h3>
          <p className="text-sm text-gray-600">
            {userLevel.experienceToNext} XP to next level
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {userLevel.currentExperience.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total XP</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Progress:</span>
          <span className="ml-2 font-medium">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-gray-600">Next Level:</span>
          <span className="ml-2 font-medium">Level {nextLevel}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Streak Tracker Component
 */
export const StreakTracker = ({
  streakData,
  className = ''
}: {
  streakData: StreakData;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <motion.div
      className={`bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-4 text-white ${className}`}
      animate={{
        scale: streakData.current > 0 ? [1, 1.05, 1] : 1,
        transition: { duration: 0.5, repeat: streakData.current > 0 ? Infinity : 0 }
      }}
    >
      <div className="flex items-center gap-3">
        <Flame className="h-8 w-8" />
        <div>
          <div className="text-2xl font-bold">
            {streakData.current} day{streakData.current !== 1 ? 's' : ''}
          </div>
          <div className="text-sm opacity-90">
            Current streak • Best: {streakData.longest}
          </div>
        </div>
      </div>

      {streakData.current > 0 && (
        <motion.button
          className="mt-2 text-sm underline opacity-80 hover:opacity-100"
          onClick={() => setIsVisible(!isVisible)}
          whileHover={{ scale: 1.05 }}
        >
          {isVisible ? 'Hide' : 'Show'} streak details
        </motion.button>
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-white border-opacity-30"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-semibold">{streakData.current} days</span>
              </div>
              <div className="flex justify-between">
                <span>Longest:</span>
                <span className="font-semibold">{streakData.longest} days</span>
              </div>
              <div className="flex justify-between">
                <span>Milestones:</span>
                <span>{streakData.milestones.join(', ')} days</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Leaderboard Component
 */
export const Leaderboard = ({
  entries,
  currentUserId,
  className = ''
}: {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
            <p className="text-sm text-gray-600">Top performers this {timeframe}</p>
          </div>

          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  timeframe === period
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.userId}
            className={`p-4 flex items-center gap-4 ${
              entry.isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">#{entry.rank}</span>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {entry.displayName.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{entry.displayName}</span>
                  {entry.isCurrentUser && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      You
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Level {entry.stats.level}</span>
                  <span>{entry.stats.totalTrades} trades</span>
                  <span>{entry.stats.winRate.toFixed(1)}% WR</span>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {entry.score.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">points</div>
            </div>

            {/* Badges */}
            <div className="flex gap-1">
              {entry.badges.slice(0, 3).map((badge, i) => (
                <div key={i} className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-3 w-3 text-yellow-600" />
                </div>
              ))}
              {entry.badges.length > 3 && (
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">+{entry.badges.length - 3}</span>
                </div>
              )}
            </div>

            {/* Change indicator */}
            {entry.change !== 0 && (
              <div className={`flex items-center gap-1 ${
                entry.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {entry.change > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(entry.change)}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/**
 * XP Notification Component
 */
export const XPNotification = ({
  experienceGained,
  reason,
  onClose
}: {
  experienceGained: number;
  reason: string;
  onClose: () => void;
}) => {
  return (
    <motion.div
      className="fixed top-4 right-4 z-50 bg-green-500 text-white rounded-lg p-4 shadow-lg"
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-3">
        <div className="bg-white bg-opacity-20 rounded-full p-2">
          <Zap className="h-5 w-5" />
        </div>

        <div>
          <div className="font-bold text-lg">+{experienceGained} XP</div>
          <div className="text-sm opacity-90">{reason}</div>
        </div>

        <button
          onClick={onClose}
          className="text-white hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Gamification hook
 */
import { useUser } from '../context/UserContext';

export const useGamification = () => {
  const { progress } = useUser();
  const [userLevel, setUserLevel] = useState<UserLevel>({
    currentLevel: 1,
    currentExperience: 0,
    totalExperience: 0,
    experienceToNext: 100,
    levelProgress: 0,
    lifetimeStats: {
      totalTrades: 0,
      totalProfit: 0,
      longestStreak: 0,
      achievementsUnlocked: 0,
      badgesEarned: 0
    }
  });

  const [streakData, setStreakData] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastTradeDate: null,
    streakHistory: [],
    milestones: [7, 30, 100, 365],
    rewards: []
  });

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentXP, setRecentXP] = useState<{ amount: number; reason: string } | null>(null);

  const engine = GamificationEngine.getInstance();

  const processTrade = useCallback(async (trade: Trade) => {
    // Use real user progress data
    const userProgress: UserProgress = {
      userId: 'demo-user',
      completions: progress.completions,
      streak: progress.streak,
      longestStreak: progress.streak, // Use current streak as fallback
      disciplineScore: progress.disciplineScore,
      totalProfitLoss: progress.currentBalance - 100, // Calculate from starting balance
      winRate: 68, // TODO: Calculate from actual trades
      averageRiskReward: 2.1, // TODO: Calculate from actual trades
      currentBalance: progress.currentBalance,
      achievements: [],
      milestones: [],
      level: 1,
      experience: progress.completions * 10, // Simple XP calculation
      nextLevelProgress: 0,
      updatedAt: new Date()
    };

    const result = await engine.processTrade(trade, userProgress);

    setUserLevel(engine.getUserLevel(userProgress.experience + result.experienceGained));

    if (result.experienceGained > 0) {
      setRecentXP({
        amount: result.experienceGained,
        reason: 'Trade completed'
      });

      setTimeout(() => setRecentXP(null), 3000);
    }

    return result;
  }, [engine]);

  const getAchievements = useCallback(() => {
    return Array.from(engine['achievements'].values());
  }, [engine]);

  return {
    userLevel,
    streakData,
    achievements: getAchievements(),
    recentXP,
    processTrade
  };
};

// =============================================================================
// CONSTANTS
// =============================================================================

export const GAMIFICATION_CONFIG = {
  EXPERIENCE_RATES: {
    TRADE_COMPLETED: 10,
    RULE_COMPLIANT_BONUS: 5,
    PROFIT_BONUS_PER_DOLLAR: 0.1,
    RISK_MANAGEMENT_BONUS: 3,
    NOTES_BONUS: 2,
    EMOTION_AWARENESS_BONUS: 1
  },
  STREAK_MILESTONES: [7, 30, 100, 365],
  LEVEL_XP_REQUIREMENTS: [0, 100, 500, 2000, 5000, 10000],
  ACHIEVEMENT_CATEGORIES: ['trading', 'discipline', 'progress', 'social', 'special'],
  BADGE_RARITIES: ['common', 'rare', 'epic', 'legendary']
} as const;
