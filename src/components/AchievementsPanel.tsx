import React, { useMemo, useState } from 'react';
import { Trophy, Target, Award, Lock } from 'lucide-react';

export default function AchievementsPanel() {
  const [showAll, setShowAll] = useState(false);

  // Basic achievements storage (ids)
  const unlocked = useMemo<string[]>(() => {
    try {
      const raw = localStorage.getItem('user_achievements') || '[]';
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }, []);

  // Read progress to compute simple milestones
  const progress = useMemo(() => {
    try {
      const raw = localStorage.getItem('user_progress');
      return raw ? JSON.parse(raw) : { completions: 0, streak: 0, disciplineScore: 0 };
    } catch { return { completions: 0, streak: 0, disciplineScore: 0 }; }
  }, []);

  const milestones = useMemo(() => {
    const defs = [
      { id: 'comp-5', title: '5 Completions', desc: 'Reach 5 compliant progress completions', target: 5, current: progress.completions || 0 },
      { id: 'comp-25', title: '25 Completions', desc: 'Reach 25 compliant completions', target: 25, current: progress.completions || 0 },
      { id: 'streak-7', title: '7-Day Streak', desc: 'Maintain a 7 day trading streak', target: 7, current: progress.streak || 0 },
    ];
    return defs.map(d => ({ ...d, done: (d.current || 0) >= d.target }));
  }, [progress]);

  const achDefs = useMemo(() => {
    const defs = [
      { id: 'first-trade', title: 'First Steps', desc: 'Complete your first compliant trade', icon: '🎯' },
      { id: 'rule-master', title: 'Rule Master', desc: '50 rule-compliant trades', icon: '👑' },
      { id: 'streak-warrior', title: 'Streak Warrior', desc: '30-day trading streak', icon: '🔥' },
    ];
    const items = defs.map(d => ({ ...d, unlocked: unlocked.includes(d.id) }));
    return showAll ? items : items.slice(0, 3);
  }, [unlocked, showAll]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Trophy className="h-5 w-5"/>Achievements</h3>
        <button className="text-xs text-blue-700 hover:underline" onClick={()=>setShowAll(v=>!v)}>
          {showAll ? 'Show less' : 'View all'}
        </button>
      </div>

      {achDefs.length === 0 ? (
        <div className="text-center text-gray-500 text-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <Trophy className="h-6 w-6 text-gray-400"/>
          </div>
          <p>Start completing goals to earn achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {achDefs.map((a) => (
            <div key={a.id} className={`border rounded-lg p-3 flex items-start gap-3 ${a.unlocked? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div className="text-2xl leading-none">{a.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{a.title}</p>
                  {!a.unlocked && <Lock className="h-3.5 w-3.5 text-gray-400"/>}
                </div>
                <p className="text-xs text-gray-600">{a.desc}</p>
              </div>
              <div className="text-xs font-medium {a.unlocked ? 'text-green-700' : 'text-gray-500' }">
                {a.unlocked ? 'Unlocked' : 'Locked'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2"><Target className="h-4 w-4"/>Upcoming Milestones</h4>
        {milestones.length === 0 ? (
          <p className="text-xs text-gray-500">No milestones yet.</p>
        ) : (
          <div className="space-y-2">
            {milestones.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-600">{m.desc}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xs ${m.done? 'text-green-700' : 'text-gray-700'}`}>{Math.min(m.current, m.target)} / {m.target}</div>
                  <div className="w-28 bg-gray-200 rounded-full h-2 mt-1">
                    <div className={`h-2 rounded-full ${m.done? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (m.current/m.target)*100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
        <Award className="h-4 w-4"/>
        Rewards like titles, badges, and XP unlock as you complete achievements.
      </div>
    </div>
  );
}
