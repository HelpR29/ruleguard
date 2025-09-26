import React from 'react';
import { Plus, BookOpen, Share2, Target, TrendingUp, Award } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const { settings, progress, updateProgress } = useUser();
  const navigate = useNavigate();

  const addCompletion = () => {
    const rate = settings.growthPerCompletion / 100;
    const newCompletions = Math.min(progress.completions + 1, settings.targetCompletions);
    const newBalance = progress.currentBalance * (1 + rate);
    const newDiscipline = Math.min(100, progress.disciplineScore + 1);
    const newStreak = progress.streak + 1;
    updateProgress({
      completions: newCompletions,
      currentBalance: Number(newBalance.toFixed(2)),
      disciplineScore: newDiscipline,
      streak: newStreak,
    });
  };

  const actions = [
    {
      icon: Plus,
      label: 'Add Completion',
      description: 'Mark a successful rule follow',
      color: 'bg-green-500 hover:bg-green-600',
      action: addCompletion
    },
    {
      icon: BookOpen,
      label: 'Journal Entry',
      description: 'Log your trading thoughts',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => navigate('/journal')
    },
    {
      icon: Share2,
      label: 'Share Progress',
      description: 'Create social card',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => navigate('/reports')
    },
    {
      icon: Target,
      label: 'View Rules',
      description: 'Check your discipline rules',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => navigate('/rules')
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`w-full flex items-center gap-3 p-4 rounded-xl text-white transition-colors ${action.color}`}
          >
            <action.icon className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="font-medium">{action.label}</p>
              <p className="text-xs opacity-80">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Achievement Badges (dynamic) */}
      {(() => {
        try {
          const raw = localStorage.getItem('user_achievements') || '[]';
          const arr = JSON.parse(raw);
          const recent = Array.isArray(arr) ? arr.slice(-3).reverse() : [];
          if (recent.length === 0) return null;
          const iconFor = (id: string) => id === 'rule-master' ? <Award className="h-5 w-5 text-yellow-600"/> : id === 'streak-warrior' ? <Target className="h-5 w-5 text-blue-600"/> : <TrendingUp className="h-5 w-5 text-green-600"/>;
          const labelFor = (id: string) => id==='first-trade'? 'First Trade' : id==='rule-master'? 'Rule Master' : id==='streak-warrior'? 'Streak Warrior' : id;
          const bgFor = (id: string) => id==='rule-master'? 'bg-yellow-50 hover:bg-yellow-100' : id==='streak-warrior'? 'bg-blue-50 hover:bg-blue-100' : 'bg-green-50 hover:bg-green-100';
          return (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Achievements</h4>
              <div className="grid grid-cols-3 gap-3">
                {recent.map((id: string) => (
                  <div key={id} className={`flex flex-col items-center p-3 rounded-xl transition-colors ${bgFor(id)}`}>
                    {iconFor(id)}
                    <span className="text-xs mt-1 text-gray-800">{labelFor(id)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        } catch { return null; }
      })()}
    </div>
  );
}