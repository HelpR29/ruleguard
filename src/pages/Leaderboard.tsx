import { useEffect, useMemo, useState } from 'react';
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
  leaderboardBadges?: string[];
  lastMonthRank?: number;
}

// Start with empty leaderboard - only real user data will be added
const mockLeaderboardData: LeaderboardUser[] = [];

const progressObjects = {
  beer: '🍺',
  wine: '🍷',
  donut: '🍩',
  diamond: '💎',
  trophy: '🏆'
};

export default function Leaderboard() {
  const { progress, settings } = useUser();
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'objects'>('global');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [lastReset, setLastReset] = useState(() => {
    try {
      return localStorage.getItem('leaderboard_last_reset') || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  });

  // Derived: current user's computed growth
  const currentBalance = useMemo(() => {
    try {
      // Prefer progress.currentBalance if present
      if (progress?.currentBalance != null) return progress.currentBalance;
      return Number(
        (
          settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, progress.completions)
        ).toFixed(2)
      );
    } catch {
      return 0;
    }
  }, [progress, settings]);

  const totalGrowthPct = useMemo(() => {
    if (!settings?.startingPortfolio) return 0;
    const delta = currentBalance - settings.startingPortfolio;
    return Number(((delta / settings.startingPortfolio) * 100).toFixed(1));
  }, [currentBalance, settings]);

  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  // Build leaderboard from peers + current user and compute ranks
  const buildLeaderboard = () => {
    try {
      const dn = (localStorage.getItem('display_name') || 'You').trim() || 'You';
      const you: LeaderboardUser = {
        id: 'you',
        name: dn,
        avatar: '👤',
        completions: progress?.completions || 0,
        disciplineScore: progress?.disciplineScore || 0,
        streak: progress?.streak || 0,
        progressObject: settings?.progressObject || 'beer',
        isPremium: (localStorage.getItem('premium_status') || 'none') === 'premium',
        rank: 0,
        totalGrowth: totalGrowthPct || 0,
        leaderboardBadges: JSON.parse(localStorage.getItem('user_achievements') || '[]').filter((a: string)=>/_(champion)$/.test(a))
      };

      // Merge and compute ranks
      const merged = [...mockLeaderboardData.filter(u=>u.id!=='you'), you];
      merged.sort((a,b)=>{
        // Primary: completions
        if (b.completions !== a.completions) return b.completions - a.completions;
        // Secondary: discipline
        if (b.disciplineScore !== a.disciplineScore) return b.disciplineScore - a.disciplineScore;
        // Tertiary: streak
        if (b.streak !== a.streak) return b.streak - a.streak;
        // Finally: growth
        return (b.totalGrowth || 0) - (a.totalGrowth || 0);
      });
      const ranked = merged.map((u, idx)=> ({...u, rank: idx+1}));
      setUsers(ranked);
      
      try {
        const yourRank = ranked.find(u=>u.id==='you' || u.name===dn)?.rank || ranked.length;
        localStorage.setItem('current_user_rank', String(yourRank));
        localStorage.setItem('monthly_leaderboard_data', JSON.stringify(ranked));
      } catch {}
    } catch (error) {
      console.error('Error building leaderboard:', error);
      setUsers([]);
    }
  };

  // Check if leaderboard should reset (30 days)
  const checkLeaderboardReset = () => {
    const now = new Date();
    const lastResetDate = new Date(lastReset);
    const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReset >= 30) {
      // Award badges to top 3 before reset
      awardLeaderboardBadges();
      
      // Reset leaderboard
      try {
        localStorage.setItem('leaderboard_last_reset', now.toISOString());
        // Save month history snapshot
        const snapshot = users.slice(0, 3).map(u => ({ id: u.id, name: u.name, rank: u.rank }));
        const history = JSON.parse(localStorage.getItem('leaderboard_history') || '[]');
        const monthLabel = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        history.push({ month: monthLabel, top3: snapshot, yourRank: Number(localStorage.getItem('current_user_rank')||'0') });
        localStorage.setItem('leaderboard_history', JSON.stringify(history));

        localStorage.removeItem('monthly_leaderboard_data');
        setLastReset(now.toISOString());
      } catch {}
    }
  };

  // Award badges to top 3 performers
  const awardLeaderboardBadges = () => {
    try {
      const currentAchievements = JSON.parse(localStorage.getItem('user_achievements') || '[]');
      const userRank: number = Number(localStorage.getItem('current_user_rank') || '9999');
      
      if (userRank === 1 && !currentAchievements.includes('gold_champion')) {
        currentAchievements.push('gold_champion');
        localStorage.setItem('user_achievements', JSON.stringify(currentAchievements));
      } else if (userRank === 2 && !currentAchievements.includes('silver_champion')) {
        currentAchievements.push('silver_champion');
        localStorage.setItem('user_achievements', JSON.stringify(currentAchievements));
      } else if (userRank === 3 && !currentAchievements.includes('bronze_champion')) {
        currentAchievements.push('bronze_champion');
        localStorage.setItem('user_achievements', JSON.stringify(currentAchievements));
      }
    } catch {}
  };

  // Initialize and check for reset
  useEffect(() => {
    buildLeaderboard();
    // small delay to ensure state is ready
    setTimeout(checkLeaderboardReset, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completions, progress.disciplineScore, progress.streak]);

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

  const getLeaderboardBadges = (user: LeaderboardUser) => {
    const badges = [];
    if (user.leaderboardBadges?.includes('gold_champion')) {
      badges.push({ icon: '🥇', title: 'Monthly Champion', color: 'text-yellow-500' });
    }
    if (user.leaderboardBadges?.includes('silver_champion')) {
      badges.push({ icon: '🥈', title: 'Monthly Runner-up', color: 'text-gray-400' });
    }
    if (user.leaderboardBadges?.includes('bronze_champion')) {
      badges.push({ icon: '🥉', title: 'Monthly Third Place', color: 'text-amber-600' });
    }
    return badges;
  };

  const getDaysUntilReset = () => {
    const now = new Date();
    const lastResetDate = new Date(lastReset);
    const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSinceReset);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-gray-600">Compete with traders worldwide</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Resets in</p>
              <p className="text-lg font-bold text-orange-600">{getDaysUntilReset()} days</p>
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
                  <span className="text-3xl font-bold">#{users.find(u=>u.id==='you' || /you/i.test(u.name||''))?.rank ?? '—'}</span>
                  <TrendingUp className="h-5 w-5 text-green-300" />
                  <span className="text-green-300 text-sm">Monthly</span>
                </div>
                <div className="text-blue-100">
                  <p className="text-sm">Discipline Score</p>
                  <p className="text-xl font-bold">{progress.disciplineScore}%</p>
                </div>
              </div>
            </div>
            <div className="text-6xl">{progressObjects.beer}</div>
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
            {users.map((user, index) => (
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
                    {/* Leaderboard Badges */}
                    {getLeaderboardBadges(user).map((badge, idx) => (
                      <div key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs" title={badge.title}>
                        <span>{badge.icon}</span>
                      </div>
                    ))}
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