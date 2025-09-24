import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Calendar } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  completions: number;
  disciplineScore: number;
  streak: number;
  progressObject: 'beer' | 'wine' | 'donut' | 'diamond' | 'trophy';
  isPremium: boolean;
  rank: number;
  totalGrowth: number;
  leaderboardBadges?: string[];
}

const mockLeaderboardData: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: '👨‍💼',
    completions: 47,
    disciplineScore: 96,
    streak: 23,
    progressObject: 'diamond',
    isPremium: true,
    rank: 1,
    totalGrowth: 58.2,
    leaderboardBadges: ['🥇']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: '👩‍💼',
    completions: 43,
    disciplineScore: 94,
    streak: 18,
    progressObject: 'trophy',
    isPremium: true,
    rank: 2,
    totalGrowth: 51.8,
    leaderboardBadges: ['🥈']
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    avatar: '👨‍🚀',
    completions: 39,
    disciplineScore: 91,
    streak: 15,
    progressObject: 'wine',
    isPremium: false,
    rank: 3,
    totalGrowth: 45.1,
    leaderboardBadges: ['🥉']
  }
];

const progressObjects = {
  beer: '🍺',
  wine: '🍷',
  donut: '🍩',
  diamond: '💎',
  trophy: '🏆'
};

export default function Leaderboard() {
  const { progress } = useUser();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'monthly' | 'alltime'>('monthly');
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Calculate time until next reset (30 days)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const lastResetKey = 'leaderboard_last_reset';
      const lastReset = localStorage.getItem(lastResetKey);
      let resetDate: Date;

      if (lastReset) {
        resetDate = new Date(lastReset);
      } else {
        resetDate = new Date(now.getFullYear(), now.getMonth(), 1);
        localStorage.setItem(lastResetKey, resetDate.toISOString());
      }

      const nextReset = new Date(resetDate.getTime() + (30 * 24 * 60 * 60 * 1000));

      if (now >= nextReset) {
        handleLeaderboardReset();
        resetDate = now;
        localStorage.setItem(lastResetKey, resetDate.toISOString());
      }

      const timeLeft = nextReset.getTime() - now.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setTimeUntilReset(`${days}d ${hours}h`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const handleLeaderboardReset = () => {
    try {
      const userAchievements = JSON.parse(localStorage.getItem('user_achievements') || '[]');
      const currentUser = localStorage.getItem('display_name') || 'Trading Pro';

      mockLeaderboardData.slice(0, 3).forEach((user, index) => {
        if (user.name === currentUser) {
          const badges = ['leaderboard_1st', 'leaderboard_2nd', 'leaderboard_3rd'];
          const badgeNames = ['🥇 Champion', '🥈 Runner-up', '🥉 Third Place'];

          if (!userAchievements.includes(badges[index])) {
            userAchievements.push(badges[index]);
            addToast('success', `🏆 Leaderboard Badge Earned: ${badgeNames[index]}!`);
          }
        }
      });

      localStorage.setItem('user_achievements', JSON.stringify(userAchievements));
      addToast('info', '📅 Monthly leaderboard has been reset!');
    } catch (error) {
      console.error('Error handling leaderboard reset:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-600" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-500" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const displayName = localStorage.getItem('display_name') || 'Trading Pro';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Compete with traders worldwide</p>
            </div>
          </div>

          {/* Tabs and Reset Timer */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {[
                { id: 'monthly', label: 'Monthly', icon: Calendar },
                { id: 'alltime', label: 'All Time', icon: Trophy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-blue-600 dark:text-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            {activeTab === 'monthly' && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Resets in: {timeUntilReset}</span>
              </div>
            )}
          </div>
        </div>

        {/* Your Rank Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Your Current Rank</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">#847</span>
                  <TrendingUp className="h-5 w-5 text-green-300" />
                  <span className="text-green-300 text-sm">↑23</span>
                </div>
                <div className="text-blue-100">
                  <p className="text-sm">Discipline Score</p>
                  <p className="text-xl font-bold">{progress.disciplineScore}%</p>
                </div>
              </div>
            </div>
            <div className="text-6xl">🍺</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {activeTab === 'monthly' ? 'Monthly' : 'All Time'} Rankings
          </h3>
          
          <div className="space-y-3">
            {mockLeaderboardData.map((user, index) => (
              <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{user.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
                      {user.leaderboardBadges?.map((badge, i) => (
                        <span key={i} className="text-lg">{badge}</span>
                      ))}
                      {user.isPremium && <span className="text-yellow-500">👑</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {user.completions} completions • {user.disciplineScore}% discipline
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{progressObjects[user.progressObject]}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {user.streak} days
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +{user.totalGrowth}% growth
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
            🏆 Leaderboard Rewards
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥇</span>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">1st Place</p>
                <p className="text-blue-600 dark:text-blue-300">Champion Badge</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥈</span>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">2nd Place</p>
                <p className="text-blue-600 dark:text-blue-300">Runner-up Badge</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥉</span>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">3rd Place</p>
                <p className="text-blue-600 dark:text-blue-300">Third Place Badge</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
            * Badges are awarded at the end of each 30-day period and displayed next to your username
          </p>
        </div>
      </div>
    </div>
  );
}
