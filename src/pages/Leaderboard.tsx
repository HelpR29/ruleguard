import React, { useState } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Star, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';

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
    totalGrowth: 58.2
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
    totalGrowth: 51.8
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
    totalGrowth: 45.3
  },
  {
    id: '4',
    name: 'You',
    avatar: '👤',
    completions: 12,
    disciplineScore: 85,
    streak: 7,
    progressObject: 'beer',
    isPremium: false,
    rank: 847,
    totalGrowth: 12.7
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
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'objects'>('global');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-gray-600">Compete with traders worldwide</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'global', label: 'Global', icon: Users },
              { id: 'friends', label: 'Friends', icon: Star },
              { id: 'objects', label: 'By Object', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Timeframe */}
          <div className="flex gap-2">
            {[
              { id: 'weekly', label: 'This Week' },
              { id: 'monthly', label: 'This Month' },
              { id: 'alltime', label: 'All Time' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setTimeframe(period.id as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === period.id
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
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

        {/* Top 3 Podium */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performers</h3>
          <div className="flex justify-center items-end gap-4 mb-8">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-16 h-20 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="text-4xl mb-2">{mockLeaderboardData[1].avatar}</div>
              <p className="font-semibold text-sm">{mockLeaderboardData[1].name}</p>
              <p className="text-xs text-gray-600">{mockLeaderboardData[1].completions} completions</p>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="w-16 h-24 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="text-5xl mb-2">{mockLeaderboardData[0].avatar}</div>
              <p className="font-bold">{mockLeaderboardData[0].name}</p>
              <p className="text-sm text-gray-600">{mockLeaderboardData[0].completions} completions</p>
              {mockLeaderboardData[0].isPremium && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs mt-1">
                  <Star className="h-3 w-3" />
                  Premium
                </div>
              )}
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-t from-amber-500 to-amber-600 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="text-4xl mb-2">{mockLeaderboardData[2].avatar}</div>
              <p className="font-semibold text-sm">{mockLeaderboardData[2].name}</p>
              <p className="text-xs text-gray-600">{mockLeaderboardData[2].completions} completions</p>
            </div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Full Rankings</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockLeaderboardData.map((user, index) => (
              <div
                key={user.id}
                className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  user.name === 'You' ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(user.rank)}
                </div>
                
                <div className="text-3xl">{user.avatar}</div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    {user.isPremium && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        <Star className="h-3 w-3" />
                        Pro
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{progressObjects[user.progressObject]} {user.completions} completions</span>
                    <span>🎯 {user.disciplineScore}% discipline</span>
                    <span>🔥 {user.streak} day streak</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-green-600">+{user.totalGrowth}%</p>
                  <p className="text-xs text-gray-500">Total Growth</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Upgrade CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Unlock Premium Leaderboards</h3>
              <p className="text-purple-100 mb-4">
                Get access to advanced analytics, custom challenges, and exclusive tournaments
              </p>
              <ul className="space-y-1 text-sm text-purple-100">
                <li>• Private group leaderboards</li>
                <li>• Historical rank tracking</li>
                <li>• Advanced filtering options</li>
                <li>• Tournament participation</li>
              </ul>
            </div>
            <div className="text-6xl">👑</div>
          </div>
          <button className="mt-4 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}