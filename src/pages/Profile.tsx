import React, { useState, useMemo } from 'react';
import { User, Trophy, TrendingUp, Calendar, Target, Award, Star, Crown, Edit3, BarChart3, Brain } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { settings, progress } = useUser();
  const { addToast } = useToast();
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
    const currentBalance = settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, progress.completions);
    const targetBalance = settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, settings.targetCompletions);
    const totalGrowth = ((currentBalance - settings.startingPortfolio) / settings.startingPortfolio) * 100;
    const goalsCompleted = Math.floor(progress.completions / settings.targetCompletions);
    const daysActive = Math.max(1, progress.streak + Math.floor(Math.random() * 30)); // Simulated
    
    return {
      currentBalance,
      targetBalance,
      totalGrowth,
      goalsCompleted,
      daysActive,
      completionRate: (progress.completions / settings.targetCompletions) * 100,
      avgDiscipline: progress.disciplineScore,
      bestStreak: Math.max(progress.streak, Math.floor(Math.random() * 50) + progress.streak), // Simulated best
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
              <p className="text-2xl font-bold">${stats.currentBalance.toFixed(2)}</p>
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
                  const categoryColors = {
                    progress: 'from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700',
                    goals: 'from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700',
                    streaks: 'from-orange-50 to-red-100 border-orange-200 dark:from-orange-900/20 dark:to-red-800/20 dark:border-orange-700',
                    discipline: 'from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700',
                    growth: 'from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-700',
                    special: 'from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-700'
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
