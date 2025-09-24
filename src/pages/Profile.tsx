import React, { useState, useMemo } from 'react';
import { User, Trophy, TrendingUp, Calendar, Target, Award, Star, Crown, Edit3, BarChart3, Brain } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Profile() {
  const { settings, progress } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(() => {
    try { return localStorage.getItem('display_name') || 'Trading Pro'; } catch { return 'Trading Pro'; }
  });

  const saveDisplayName = () => {
    try { localStorage.setItem('display_name', displayName); } catch {}
    setIsEditing(false);
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
  const achievements = useMemo(() => {
    const badges = [];
    
    if (progress.completions >= 10) badges.push({ name: 'First Steps', icon: '🎯', description: 'Complete 10 actions' });
    if (progress.completions >= 25) badges.push({ name: 'Quarter Master', icon: '🏆', description: 'Complete 25 actions' });
    if (progress.completions >= 50) badges.push({ name: 'Goal Crusher', icon: '💎', description: 'Complete your first goal' });
    if (progress.streak >= 7) badges.push({ name: 'Week Warrior', icon: '🔥', description: '7-day streak' });
    if (progress.streak >= 30) badges.push({ name: 'Monthly Master', icon: '👑', description: '30-day streak' });
    if (progress.disciplineScore >= 90) badges.push({ name: 'Discipline Demon', icon: '🧠', description: '90%+ discipline score' });
    if (stats.totalGrowth >= 50) badges.push({ name: 'Growth Guru', icon: '📈', description: '50%+ portfolio growth' });
    if (stats.goalsCompleted >= 1) badges.push({ name: 'Goal Getter', icon: '🎉', description: 'Complete a full goal' });
    if (stats.goalsCompleted >= 3) badges.push({ name: 'Triple Threat', icon: '⭐', description: 'Complete 3 goals' });
    if (stats.bestStreak >= 50) badges.push({ name: 'Streak Supreme', icon: '🌟', description: '50-day best streak' });
    
    return badges;
  }, [progress, stats]);

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
                      onClick={() => setIsEditing(true)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg"
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
                {achievements.map((achievement, index) => (
                  <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <h4 className="font-semibold text-xs text-gray-900 dark:text-white">{achievement.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
              
              {achievements.length === 0 && (
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
