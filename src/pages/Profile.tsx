import React, { useState, useMemo, useEffect } from 'react';
import { User, Trophy, TrendingUp, Calendar, Target, Award, Star, Crown, Edit3, BarChart3, Brain, Link as LinkIcon, UserPlus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { settings, progress } = useUser();
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(() => {
    try { return localStorage.getItem('display_name') || 'Trading Pro'; } catch { return 'Trading Pro'; }
  });
  const [premiumStatus, setPremiumStatus] = useState(() => {
    try { return localStorage.getItem('premium_status') || 'none'; } catch { return 'none'; }
  });
  const [achievements, setAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_achievements') || '[]'); } catch { return []; }
  });

  // Invite code (server-backed)
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState<boolean>(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followInput, setFollowInput] = useState('');
  const normalizeCode = (raw: string): string | null => {
    let s = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.startsWith('RG')) s = s.slice(2);
    if (s.length === 6 || s.length === 8) return `RG-${s}`;
    return null;
  };

  useEffect(() => {
    const fetchInvite = async () => {
      if (!isSupabaseConfigured() || !user) return;
      try {
        setInviteLoading(true);
        const { data, error } = await supabase
          .from('invite_codes')
          .select('code')
          .eq('owner_user_id', (user as any).id)
          .maybeSingle();
        if (!error && data) {
          setInviteCode(data.code);
        }
      } catch {}
      finally { setInviteLoading(false); }
    };
    fetchInvite();
  }, [user]);

  // Following count sourced from local friends list (temporary until server follows)
  const [followingCount, setFollowingCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('friends') || '[]';
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    } catch { return 0; }
  });
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'friends') {
        try {
          const arr = JSON.parse(e.newValue || '[]');
          setFollowingCount(Array.isArray(arr) ? arr.length : 0);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    // Also poll immediately in case updated within same tab
    try {
      const raw = localStorage.getItem('friends') || '[]';
      const arr = JSON.parse(raw);
      setFollowingCount(Array.isArray(arr) ? arr.length : 0);
    } catch {}
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const saveDisplayName = () => {
    const canEdit = premiumStatus === 'premium' || achievements.includes('champion');
    if (!canEdit) {
      addToast('error', 'Premium required to edit profile name');
      setIsEditing(false);
      return;
    }
    try { localStorage.setItem('display_name', displayName); } catch {}
    setIsEditing(false);
    addToast('success', 'Profile name updated!');
  };

  // Calculate achievements and stats
  const stats = useMemo(() => {
    // Actual portfolio = starting + sum(PnL) to match Dashboard
    let currentBalance = settings.startingPortfolio;
    try {
      const raw = localStorage.getItem('journal_trades');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          let sum = 0;
          for (const t of arr) sum += Number(t?.pnl ?? t?.profitLoss ?? 0) || 0;
          currentBalance = settings.startingPortfolio + sum;
        }
      }
    } catch {}
    const targetBalance = settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, settings.targetCompletions);
    const totalGrowth = ((currentBalance - settings.startingPortfolio) / settings.startingPortfolio) * 100;
    const goalsCompleted = Math.floor(progress.completions / Math.max(1, settings.targetCompletions));

    // Derive Days Active and Best Streak from daily_stats
    let daysActive = 0;
    let bestStreak = 0;
    try {
      const raw = localStorage.getItem('daily_stats') || '{}';
      const obj = JSON.parse(raw) as Record<string, { completions?: number; violations?: number }>;
      const dates = Object.keys(obj).sort(); // YYYY-MM-DD strings sort lexicographically
      // Days Active: any non-zero activity
      daysActive = dates.filter(d => {
        const v = obj[d] || { completions: 0, violations: 0 };
        return (Number(v.completions || 0) > 0) || (Number(v.violations || 0) > 0);
      }).length;

      // Best Streak: longest consecutive run of days with completions > 0
      let run = 0;
      let prevDate: Date | null = null;
      for (const d of dates) {
        const v = obj[d] || { completions: 0 };
        const hasCompletion = Number(v.completions || 0) > 0;
        if (!prevDate) {
          run = hasCompletion ? 1 : 0;
          bestStreak = Math.max(bestStreak, run);
          prevDate = new Date(d);
          continue;
        }
        const curr = new Date(d);
        const diffDays = Math.floor((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          // consecutive day
          run = hasCompletion ? run + 1 : 0;
        } else if (diffDays > 1) {
          // gap -> reset
          run = hasCompletion ? 1 : 0;
        } else {
          // same day entries should not happen; keep run
          run = hasCompletion ? Math.max(run, 1) : run;
        }
        bestStreak = Math.max(bestStreak, run);
        prevDate = curr;
      }
    } catch {}

    // Fresh start defaults
    if (!Number.isFinite(daysActive)) daysActive = 0;
    if (!Number.isFinite(bestStreak)) bestStreak = progress.streak || 0;

    return {
      currentBalance,
      targetBalance,
      totalGrowth,
      goalsCompleted,
      daysActive,
      completionRate: (progress.completions / Math.max(1, settings.targetCompletions)) * 100,
      avgDiscipline: progress.disciplineScore,
      bestStreak,
    };
  }, [settings, progress]);

  // Achievement badges
  const achievementBadges = useMemo(() => {
    const badges = [];
    
    // Progress Milestones
    if (progress.completions >= 10) badges.push({ name: 'First Steps', icon: '🎯', description: 'Complete 10 actions', category: 'progress' });
    if (progress.completions >= 25) badges.push({ name: 'Quarter Master', icon: '🏆', description: 'Complete 25 actions', category: 'progress' });
    if (progress.completions >= 50) badges.push({ name: 'Goal Crusher', icon: '💎', description: 'Complete your first goal', category: 'goals' });
    if (progress.completions >= 100) badges.push({ name: 'Century Club', icon: '💯', description: 'Complete 100 actions', category: 'progress' });
    
    // Streak Achievements
    if (progress.streak >= 7) badges.push({ name: 'Week Warrior', icon: '🔥', description: '7-day streak', category: 'streaks' });
    if (progress.streak >= 14) badges.push({ name: 'Fortnight Fighter', icon: '⚡', description: '14-day streak', category: 'streaks' });
    if (progress.streak >= 30) badges.push({ name: 'Monthly Master', icon: '👑', description: '30-day streak', category: 'streaks' });
    if (stats.bestStreak >= 50) badges.push({ name: 'Streak Supreme', icon: '🌟', description: '50-day best streak', category: 'streaks' });
    if (stats.bestStreak >= 100) badges.push({ name: 'Centurion', icon: '🏛️', description: '100-day best streak', category: 'streaks' });
    
    // Discipline & Performance
    if (progress.disciplineScore >= 80) badges.push({ name: 'Disciplined', icon: '🧠', description: '80%+ discipline score', category: 'discipline' });
    if (progress.disciplineScore >= 90) badges.push({ name: 'Discipline Demon', icon: '😈', description: '90%+ discipline score', category: 'discipline' });
    if (progress.disciplineScore >= 95) badges.push({ name: 'Perfect Control', icon: '🎭', description: '95%+ discipline score', category: 'discipline' });
    
    // Growth Achievements
    if (stats.totalGrowth >= 25) badges.push({ name: 'Growth Starter', icon: '🌱', description: '25%+ portfolio growth', category: 'growth' });
    if (stats.totalGrowth >= 50) badges.push({ name: 'Growth Guru', icon: '📈', description: '50%+ portfolio growth', category: 'growth' });
    if (stats.totalGrowth >= 100) badges.push({ name: 'Double Down', icon: '💰', description: '100%+ portfolio growth', category: 'growth' });
    if (stats.totalGrowth >= 200) badges.push({ name: 'Triple Crown', icon: '👑', description: '200%+ portfolio growth', category: 'growth' });
    
    // Goal Completion Badges
    if (stats.goalsCompleted >= 1) badges.push({ name: 'Goal Getter', icon: '🎉', description: 'Complete your first goal', category: 'goals' });
    if (stats.goalsCompleted >= 2) badges.push({ name: 'Double Trouble', icon: '🎯', description: 'Complete 2 goals', category: 'goals' });
    if (stats.goalsCompleted >= 3) badges.push({ name: 'Triple Threat', icon: '⭐', description: 'Complete 3 goals', category: 'goals' });
    if (stats.goalsCompleted >= 5) badges.push({ name: 'Goal Machine', icon: '🚀', description: 'Complete 5 goals', category: 'goals' });
    if (stats.goalsCompleted >= 10) badges.push({ name: 'Legend', icon: '🏆', description: 'Complete 10 goals', category: 'goals' });
    
    // Special Achievements
    if (premiumStatus === 'premium') badges.push({ name: 'Premium Member', icon: '💎', description: 'Upgraded to Premium', category: 'special' });
    if (achievements.includes('champion')) badges.push({ name: 'Champion', icon: '🏅', description: 'Elite trader status', category: 'special' });
    if (stats.daysActive >= 30) badges.push({ name: 'Veteran', icon: '🎖️', description: '30+ days active', category: 'special' });
    if (stats.daysActive >= 100) badges.push({ name: 'Master Trader', icon: '🥇', description: '100+ days active', category: 'special' });
    
    // Leaderboard Achievements
    if (achievements.includes('gold_champion')) badges.push({ name: 'Monthly Champion', icon: '🥇', description: 'Ranked #1 on leaderboard', category: 'leaderboard' });
    if (achievements.includes('silver_champion')) badges.push({ name: 'Monthly Runner-up', icon: '🥈', description: 'Ranked #2 on leaderboard', category: 'leaderboard' });
    if (achievements.includes('bronze_champion')) badges.push({ name: 'Monthly Third Place', icon: '🥉', description: 'Ranked #3 on leaderboard', category: 'leaderboard' });
    
    return badges;
  }, [progress, stats, premiumStatus, achievements]);

  // Milestones and next goals
  const milestones = useMemo(() => {
    const next = [];
    
    if (progress.completions < settings.targetCompletions) {
      next.push({
        title: 'Complete Current Goal',
        description: `Reach ${settings.targetCompletions} ${settings.progressObject}s`,
        progress: (progress.completions / settings.targetCompletions) * 100,
        target: settings.targetCompletions,
        current: progress.completions,
        type: 'primary'
      });
    }
    
    if (progress.streak < 30) {
      next.push({
        title: '30-Day Streak',
        description: 'Build consistency with a month-long streak',
        progress: (progress.streak / 30) * 100,
        target: 30,
        current: progress.streak,
        type: 'streak'
      });
    }
    
    if (progress.disciplineScore < 95) {
      next.push({
        title: 'Discipline Master',
        description: 'Achieve 95% discipline score',
        progress: (progress.disciplineScore / 95) * 100,
        target: 95,
        current: progress.disciplineScore,
        type: 'discipline'
      });
    }
    
    if (stats.totalGrowth < 100) {
      next.push({
        title: 'Double Your Money',
        description: 'Achieve 100% portfolio growth',
        progress: Math.min(stats.totalGrowth / 100 * 100, 100),
        target: 100,
        current: stats.totalGrowth,
        type: 'growth'
      });
    }
    
    return next.slice(0, 3); // Show top 3 milestones
  }, [progress, settings, stats]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/70"
                      placeholder="Enter your name"
                    />
                    <button onClick={saveDisplayName} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg">
                      ✓
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{displayName}</h1>
                    <button 
                      onClick={() => {
                        const canEdit = premiumStatus === 'premium' || achievements.includes('champion');
                        if (canEdit) {
                          setIsEditing(true);
                        } else {
                          addToast('error', 'Premium required to edit profile name');
                        }
                      }}
                      className={`p-2 rounded-lg ${
                        premiumStatus === 'premium' || achievements.includes('champion')
                          ? 'bg-white/20 hover:bg-white/30'
                          : 'bg-white/10 opacity-50 cursor-not-allowed'
                      }`}
                      title={premiumStatus === 'premium' || achievements.includes('champion') ? 'Edit name' : 'Premium required'}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <p className="text-blue-100">Trading Discipline Champion</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Member since</p>
              <p className="text-xl font-semibold">Jan 2024</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Portfolio</p>
              <p className="text-2xl font-bold">${Math.round(stats.currentBalance)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Growth</p>
              <p className="text-2xl font-bold">{stats.totalGrowth.toFixed(1)}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Streak</p>
              <p className="text-2xl font-bold">{progress.streak} days</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-blue-100 text-sm">Discipline</p>
              <p className="text-2xl font-bold">{progress.disciplineScore}%</p>
            </div>
          </div>
        </div>

        {/* Following Count */}
        <div className="mt-4 grid grid-cols-1">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-blue-100 text-sm">Following</p>
            <p className="text-2xl font-bold">{followingCount}</p>
          </div>
        </div>

        {/* Invite Friends */}
        <div className="mt-4 grid grid-cols-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><LinkIcon className="h-4 w-4"/> Invite Friends</h3>
              {inviteCode && (
                <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Your code</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                readOnly
                value={inviteCode || (inviteLoading ? 'Loading...' : (isSupabaseConfigured() ? 'No code yet' : 'Supabase not configured'))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  if (!inviteCode) { addToast('info', 'No invite code available.'); return; }
                  const url = `${window.location.origin}/invite/${encodeURIComponent(inviteCode)}`;
                  navigator.clipboard.writeText(url).then(() => addToast('success', 'Invite link copied!')).catch(()=>addToast('error','Copy failed'));
                }}
                className="px-3 py-2 rounded bg-gray-900 text-white hover:bg-black"
              >
                Copy Invite Link
              </button>
              <button
                type="button"
                onClick={() => setShowFollowModal(true)}
                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4"/> Follow via Code
              </button>
            </div>
            {!isSupabaseConfigured() && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded mt-2 px-2 py-1">Supabase not configured; showing local placeholder only.</p>
            )}
          </div>
        </div>

        {showFollowModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Follow via Code</h3>
              <input
                value={followInput}
                onChange={e=>setFollowInput(e.target.value)}
                placeholder="RG-ABC12345 or ABC12345"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2 rounded"
              />
              {(() => {
                const norm = normalizeCode(followInput);
                if (!followInput) return null;
                return <p className={`text-xs mt-2 ${norm? 'text-emerald-700 bg-emerald-50 border border-emerald-200':'text-amber-700 bg-amber-50 border border-amber-200'} rounded px-2 py-1`}>{norm ? `Looks good: ${norm}` : 'Code must be RG-XXXXXX or RG-XXXXXXXX'}</p>;
              })()}
              <div className="flex gap-3 mt-4">
                <button onClick={()=>setShowFollowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl">Cancel</button>
                <button
                  onClick={() => {
                    const norm = normalizeCode(followInput);
                    if (!norm) { addToast('warning', 'Please enter a valid code'); return; }
                    setShowFollowModal(false);
                    navigate('/friends', { state: { addedCode: norm } });
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Add Friend
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column - Stats & Progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Detailed Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Current Goal Progress</span>
                    <span className="font-semibold">{progress.completions}/{settings.targetCompletions}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Discipline Score</span>
                    <span className="font-semibold">{progress.disciplineScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                      style={{ width: `${progress.disciplineScore}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400">Goals Completed</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.goalsCompleted}</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Best Streak</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.bestStreak} days</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm text-purple-600 dark:text-purple-400">Days Active</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.daysActive}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Milestones */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Next Milestones
              </h3>
              
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{milestone.description}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {milestone.type === 'growth' 
                          ? `${milestone.current.toFixed(1)}%/${milestone.target}%`
                          : `${Math.floor(milestone.current)}/${milestone.target}`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          milestone.type === 'primary' ? 'bg-gradient-to-r from-blue-500 to-green-500' :
                          milestone.type === 'streak' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                          milestone.type === 'discipline' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Achievements */}
          <div className="space-y-6">
            
            {/* Achievement Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {achievementBadges.map((achievement, index) => {
                  const categoryColors: Record<string, string> = {
                    progress: 'from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700',
                    goals: 'from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700',
                    streaks: 'from-orange-50 to-red-100 border-orange-200 dark:from-orange-900/20 dark:to-red-800/20 dark:border-orange-700',
                    discipline: 'from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700',
                    growth: 'from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-700',
                    special: 'from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-700',
                    leaderboard: 'from-rose-50 to-pink-100 border-rose-200 dark:from-rose-900/20 dark:to-pink-800/20 dark:border-rose-700'
                  };
                  
                  return (
                    <div key={index} className={`bg-gradient-to-br ${categoryColors[achievement.category]} border rounded-lg p-3 text-center`}>
                      <div className="text-2xl mb-1">{achievement.icon}</div>
                      <h4 className="font-semibold text-xs text-gray-900 dark:text-white">{achievement.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{achievement.description}</p>
                    </div>
                  );
                })}
              </div>
              
              {achievementBadges.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Start completing goals to earn achievements!</p>
                </div>
              )}
            </div>

            {/* Monthly Badge History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Monthly Badge History
              </h3>
              {(() => {
                let history: Array<{month:string; top3: Array<{id:string;name:string;rank:number}>; yourRank:number}> = [];
                try { history = JSON.parse(localStorage.getItem('leaderboard_history') || '[]'); } catch {}
                if (!history || history.length === 0) {
                  return (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No monthly history yet. Complete a cycle to see your badges here.</p>
                  );
                }
                const getBadge = (rank:number) => {
                  if (rank === 1) return { icon:'🥇', label:'Monthly Champion', color:'text-yellow-500' };
                  if (rank === 2) return { icon:'🥈', label:'Monthly Runner-up', color:'text-gray-400' };
                  if (rank === 3) return { icon:'🥉', label:'Monthly Third Place', color:'text-amber-600' };
                  return { icon:'', label:'', color:'' };
                };
                return (
                  <div className="space-y-4">
                    {history.slice().reverse().map((m, idx) => {
                      const badge = getBadge(m.yourRank);
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-xl">
                              {badge.icon || '📊'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{m.month}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Your Rank: {m.yourRank > 0 ? `#${m.yourRank}` : '—'}</p>
                            </div>
                          </div>
                          {badge.icon && (
                            <div className={`text-sm font-medium ${badge.color}`}>{badge.label}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Trading Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Profile Insights
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Trading Style</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {progress.disciplineScore >= 80 ? 'Disciplined Trader' : 
                     progress.disciplineScore >= 60 ? 'Developing Trader' : 'Beginner Trader'}
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Consistency</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {progress.streak >= 14 ? 'Highly Consistent' :
                     progress.streak >= 7 ? 'Building Consistency' : 'Needs Improvement'}
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Growth Focus</h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {settings.progressObject} Specialist - {settings.growthPerCompletion}% per completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
