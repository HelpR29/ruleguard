import React, { useMemo, useState } from 'react';
import { Award, Trophy, Target, TrendingUp, Zap, Crown, Medal, CheckCircle, Lock } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'progress' | 'discipline' | 'streak' | 'growth' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
  reward?: string;
}

const categoryColors = {
  progress: 'bg-blue-100 text-blue-800',
  discipline: 'bg-purple-100 text-purple-800',
  streak: 'bg-orange-100 text-orange-800',
  growth: 'bg-green-100 text-green-800',
  special: 'bg-yellow-100 text-yellow-800'
};

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all'|'unlocked'|'locked'>('all');
  const { progress, settings } = useUser();

  // Live stats
  const stats = useMemo(() => {
    const completions = Number(progress?.completions || 0);
    const streak = Number(progress?.streak || 0);
    const discipline = Number(progress?.disciplineScore || 0);
    const starting = Number(settings?.startingPortfolio || 0);
    const growthPer = Number(settings?.growthPerCompletion || 0) / 100;
    const current = starting ? starting * Math.pow(1 + growthPer, completions) : 0;
    const growthPct = starting ? ((current - starting) / starting) * 100 : 0;
    return { completions, streak, discipline, growthPct };
  }, [progress, settings]);

  // Build achievements dynamically from live stats
  const achievements: Achievement[] = useMemo(() => {
    return [
      {
        id: 'first_completion',
        title: 'First Steps',
        description: 'Complete your first trading rule successfully',
        icon: Target,
        category: 'progress',
        unlocked: stats.completions >= 1,
        requirement: '1 completion',
        reward: '+10 Discipline Points'
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day discipline streak - Unlocks avatar selection',
        icon: Zap,
        category: 'streak',
        unlocked: stats.streak >= 7,
        requirement: '7-day streak',
        reward: 'Avatar Selection Unlocked'
      },
      {
        id: 'ten_completions',
        title: 'Perfect Ten',
        description: 'Reach 10 successful completions',
        icon: Award,
        category: 'progress',
        unlocked: stats.completions >= 10,
        requirement: '10 completions'
      },
      {
        id: 'growth_master',
        title: 'Growth Master',
        description: 'Achieve 25% portfolio growth - Earn badge and 25% premium discount',
        icon: TrendingUp,
        category: 'growth',
        unlocked: stats.growthPct >= 25,
        requirement: '25% growth',
        reward: 'Growth Badge + 25% Premium Discount'
      },
      {
        id: 'discipline_king',
        title: 'Discipline King',
        description: 'Maintain 95% discipline score for a month - Earn crown badge and 50% premium discount',
        icon: Crown,
        category: 'discipline',
        unlocked: stats.discipline >= 95,
        requirement: '95% discipline for 30 days',
        reward: 'Crown Badge + 50% Premium Discount'
      },
      {
        id: 'halfway_hero',
        title: 'Halfway Hero',
        description: 'Complete 25 out of 50 bottles',
        icon: Medal,
        category: 'progress',
        unlocked: stats.completions >= 25,
        requirement: '25 completions'
      },
      {
        id: 'champion',
        title: 'Champion',
        description: 'Complete all 50 bottles successfully - Earn champion badge and free monthly premium access',
        icon: Trophy,
        category: 'special',
        unlocked: stats.completions >= 50,
        requirement: '50 completions',
        reward: 'Champion Badge + Free Monthly Premium'
      }
    ];
  }, [stats]);

  let filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  if (statusFilter !== 'all') {
    filteredAchievements = filteredAchievements.filter(a => statusFilter === 'unlocked' ? a.unlocked : !a.unlocked);
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

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
              <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
              <p className="text-gray-600">Track your trading discipline milestones</p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Achievement Progress</span>
              <span className="text-sm font-bold text-blue-600">{unlockedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-2 items-center">
            {['all', 'progress', 'discipline', 'streak', 'growth', 'special'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}

            <div className="ml-auto flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'unlocked', label: 'Unlocked' },
                { id: 'locked', label: 'Locked' },
              ].map((opt:any) => (
                <button
                  key={opt.id}
                  onClick={() => setStatusFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === opt.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${
                achievement.unlocked
                  ? 'border-green-200 bg-green-50/30'
                  : 'border-gray-200 opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  achievement.unlocked
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}>
                  {achievement.unlocked ? (
                    <achievement.icon className="h-8 w-8 text-green-600" />
                  ) : (
                    <Lock className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-bold ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    {achievement.unlocked && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      categoryColors[achievement.category]
                    }`}>
                      {achievement.category}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    achievement.unlocked ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Requirement</p>
                      <p className="text-sm font-medium text-gray-700">{achievement.requirement}</p>
                      {/* Progress Bar for locked achievements */}
                      {(() => {
                        // compute progress per achievement
                        let current = 0; let target = 0; let unit = '';
                        switch (achievement.id) {
                          case 'first_completion': current = stats.completions; target = 1; unit = ''; break;
                          case 'week_streak': current = stats.streak; target = 7; unit = 'days'; break;
                          case 'ten_completions': current = stats.completions; target = 10; unit = ''; break;
                          case 'growth_master': current = Math.max(0, stats.growthPct); target = 25; unit = '%'; break;
                          case 'discipline_king': current = Math.max(0, stats.discipline); target = 95; unit = '%'; break;
                          case 'halfway_hero': current = stats.completions; target = 25; unit = ''; break;
                          case 'champion': current = stats.completions; target = 50; unit = ''; break;
                        }
                        const pct = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
                        return (
                          <div className={`mt-2 ${achievement.unlocked ? 'hidden' : ''}`}>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>
                                {unit === '%'
                                  ? `${Math.min(current, target).toFixed(0)}${unit} / ${target}${unit}`
                                  : `${Math.min(current, target)} / ${target}`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            {/* Next step tip */}
                            {(() => {
                              const remaining = Math.max(0, target - current);
                              if (remaining <= 0) return null;
                              let tip = '';
                              switch (achievement.id) {
                                case 'first_completion':
                                  tip = 'Log your first compliant trade to unlock this.'; break;
                                case 'ten_completions':
                                  tip = `Complete ${remaining} more compliant trade${remaining>1?'s':''} to unlock.`; break;
                                case 'halfway_hero':
                                  tip = `Complete ${remaining} more to reach 25.`; break;
                                case 'champion':
                                  tip = `Complete ${remaining} more to reach 50.`; break;
                                case 'week_streak':
                                  tip = `Maintain your streak for ${remaining} more day${remaining>1?'s':''}.`; break;
                                case 'growth_master':
                                  tip = `Increase portfolio growth to ${target}% (current ${Math.max(0,current).toFixed(0)}%).`; break;
                                case 'discipline_king':
                                  tip = `Improve discipline to ${target}% (current ${Math.max(0,current).toFixed(0)}%).`; break;
                              }
                              return <p className="mt-2 text-xs text-gray-500">{tip}</p>;
                            })()}
                          </div>
                        );
                      })()}
                    </div>
                    
                    {achievement.reward && (
                      <div className="text-right min-w-[140px]">
                        <p className="text-xs text-gray-500 mb-1">Reward</p>
                        <p className="text-sm font-medium text-blue-600">{achievement.reward}</p>
                      </div>
                    )}
                  </div>
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-green-600">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Tips */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Achievement Tips</h3>
          <ul className="space-y-2 text-blue-100">
            <li>• Maintain consistent daily discipline to unlock streak achievements</li>
            <li>• Focus on rule compliance to earn discipline-based rewards</li>
            <li>• Track your portfolio growth for growth-based milestones</li>
            <li>• Complete the full 50-bottle challenge for special rewards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}