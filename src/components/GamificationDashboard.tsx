/**
 * Gamification Dashboard Component
 * Interactive dashboard showcasing achievements, levels, streaks, and leaderboards
 */

import React, { useState, useEffect } from 'react';
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
  Unlock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  AchievementCard,
  LevelProgress,
  StreakTracker,
  Leaderboard,
  XPNotification,
  useGamification,
  Achievement,
  UserLevel,
  StreakData,
  LeaderboardEntry
} from '../utils/gamification';

interface GamificationDashboardProps {
  className?: string;
}

/**
 * Main Gamification Dashboard Component
 */
export default function GamificationDashboard({ className = '' }: GamificationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard' | 'badges'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showXPNotification, setShowXPNotification] = useState(false);

  const {
    userLevel,
    streakData,
    achievements,
    recentXP,
    processTrade
  } = useGamification();

  // Mock data for demonstration
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      userId: '1',
      displayName: 'Alex Trader',
      score: 15420,
      rank: 1,
      change: 2,
      stats: {
        level: 12,
        totalTrades: 245,
        winRate: 72.5,
        totalProfit: 15420,
        streak: 15,
        achievements: 28
      },
      badges: ['expert', 'streak-warrior', 'rule-master'],
      isCurrentUser: false
    },
    {
      userId: '2',
      displayName: 'Sarah Chen',
      score: 12890,
      rank: 2,
      change: -1,
      stats: {
        level: 10,
        totalTrades: 189,
        winRate: 68.3,
        totalProfit: 12890,
        streak: 8,
        achievements: 22
      },
      badges: ['expert', 'profit-king'],
      isCurrentUser: false
    },
    {
      userId: '3',
      displayName: 'Mike Johnson',
      score: 11200,
      rank: 3,
      change: 1,
      stats: {
        level: 9,
        totalTrades: 156,
        winRate: 71.2,
        totalProfit: 11200,
        streak: 12,
        achievements: 19
      },
      badges: ['rising-star'],
      isCurrentUser: false
    },
    {
      userId: 'current',
      displayName: 'You',
      score: 8750,
      rank: 8,
      change: 3,
      stats: {
        level: 7,
        totalTrades: 89,
        winRate: 65.4,
        totalProfit: 8750,
        streak: 5,
        achievements: 12
      },
      badges: ['consistent'],
      isCurrentUser: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Award },
    { id: 'trading', name: 'Trading', icon: Target },
    { id: 'discipline', name: 'Discipline', icon: CheckCircle },
    { id: 'progress', name: 'Progress', icon: TrendingUp },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'special', name: 'Special', icon: Sparkles }
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const completedAchievements = achievements.filter(a => a.unlockedAt).length;
  const totalAchievements = achievements.length;
  const completionRate = totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Trading Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress, unlock achievements, and compete with fellow traders
          </p>
        </motion.div>

        {/* XP Notification */}
        <AnimatePresence>
          {recentXP && (
            <XPNotification
              experienceGained={recentXP.amount}
              reason={recentXP.reason}
              onClose={() => setShowXPNotification(false)}
            />
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {userLevel.currentLevel}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {streakData.current}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {completedAchievements}/{totalAchievements}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {userLevel.lifetimeStats.totalTrades > 0
                    ? `${(userLevel.lifetimeStats.totalProfit / Math.max(userLevel.lifetimeStats.totalTrades, 1) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              {[
                { id: 'overview', name: 'Overview', icon: Target },
                { id: 'achievements', name: 'Achievements', icon: Trophy },
                { id: 'leaderboard', name: 'Leaderboard', icon: Users },
                { id: 'badges', name: 'Badges', icon: Medal }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <OverviewTab
                  userLevel={userLevel}
                  streakData={streakData}
                  achievements={achievements}
                />
              )}

              {activeTab === 'achievements' && (
                <AchievementsTab
                  achievements={filteredAchievements}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardTab
                  entries={mockLeaderboard}
                  currentUserId="current"
                />
              )}

              {activeTab === 'badges' && (
                <BadgesTab />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Overview Tab Component
 */
const OverviewTab = ({
  userLevel,
  streakData,
  achievements
}: {
  userLevel: UserLevel;
  streakData: StreakData;
  achievements: Achievement[];
}) => {
  const recentAchievements = achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <LevelProgress userLevel={userLevel} />

      {/* Streak Tracker */}
      <StreakTracker streakData={streakData} />

      {/* Recent Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Achievements
        </h3>

        {recentAchievements.length > 0 ? (
          <div className="grid gap-4">
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {achievement.rewards.map((reward, index) => (
                    <div key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                      {reward.description}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No achievements unlocked yet</p>
            <p className="text-sm">Keep trading to unlock your first achievement!</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Achievements Tab Component
 */
const AchievementsTab = ({
  achievements,
  categories,
  selectedCategory,
  onCategoryChange
}: {
  achievements: Achievement[];
  categories: Array<{ id: string; name: string; icon: any }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) => {
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <category.icon className="h-4 w-4" />
            {category.name}
          </button>
        ))}
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {unlockedAchievements.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Unlocked</div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {lockedAchievements.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Locked</div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {achievements.length > 0 ? Math.round((unlockedAchievements.length / achievements.length) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
        </div>
      </div>

      {/* Achievements Grid */}
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onClick={() => {
                // Handle achievement click
                console.log('Achievement clicked:', achievement.id);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No achievements found</p>
          <p className="text-sm">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
};

/**
 * Leaderboard Tab Component
 */
const LeaderboardTab = ({
  entries,
  currentUserId
}: {
  entries: LeaderboardEntry[];
  currentUserId: string;
}) => {
  return (
    <div className="space-y-6">
      <Leaderboard
        entries={entries}
        currentUserId={currentUserId}
      />

      {/* Additional Leaderboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Your Rank</h4>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            #{entries.find(e => e.isCurrentUser)?.rank || '?'}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Out of {entries.length} traders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">This Week</h4>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            +{entries.find(e => e.isCurrentUser)?.change || 0}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Position change
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Top 10%</h4>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {entries.length > 0 ? Math.round((1 / entries.length) * 100) : 0}%
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Achievement rate
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Badges Tab Component
 */
const BadgesTab = () => {
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Mock badges data
  const mockBadges = [
    {
      id: 'early-bird',
      name: 'Early Bird',
      description: 'Trade before market opens',
      icon: '🌅',
      rarity: 'common' as const,
      category: 'trading',
      progress: 7,
      maxProgress: 10,
      unlockedAt: new Date(),
      isVisible: true
    },
    {
      id: 'night-owl',
      name: 'Night Owl',
      description: 'Trade after hours',
      icon: '🦉',
      rarity: 'rare' as const,
      category: 'trading',
      progress: 3,
      maxProgress: 5,
      isVisible: true
    },
    {
      id: 'legendary-trader',
      name: 'Legendary Trader',
      description: 'Achieve legendary status',
      icon: '👑',
      rarity: 'legendary' as const,
      category: 'special',
      progress: 0,
      maxProgress: 1,
      isVisible: false
    }
  ];

  const filteredBadges = selectedRarity === 'all'
    ? mockBadges
    : mockBadges.filter(b => b.rarity === selectedRarity);

  const rarities = [
    { id: 'all', name: 'All', color: 'bg-gray-100 text-gray-700' },
    { id: 'common', name: 'Common', color: 'bg-gray-100 text-gray-700' },
    { id: 'rare', name: 'Rare', color: 'bg-blue-100 text-blue-700' },
    { id: 'epic', name: 'Epic', color: 'bg-purple-100 text-purple-700' },
    { id: 'legendary', name: 'Legendary', color: 'bg-yellow-100 text-yellow-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Rarity Filter */}
      <div className="flex flex-wrap gap-2">
        {rarities.map((rarity) => (
          <button
            key={rarity.id}
            onClick={() => setSelectedRarity(rarity.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedRarity === rarity.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {rarity.name}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => (
          <motion.div
            key={badge.id}
            className={`relative border-2 rounded-lg p-4 text-center transition-all duration-200 ${
              badge.unlockedAt
                ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 opacity-60'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {/* Unlock overlay */}
            {!badge.unlockedAt && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
            )}

            <div className="text-3xl mb-2">{badge.icon}</div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {badge.name}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {badge.description}
            </p>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {badge.progress} / {badge.maxProgress}
            </div>

            {badge.unlockedAt && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Medal className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No badges found</p>
          <p className="text-sm">Try selecting a different rarity</p>
        </div>
      )}
    </div>
  );
};
