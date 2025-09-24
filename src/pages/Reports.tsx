import React, { useMemo, useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUser } from '../context/UserContext';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('weekly');
  const [showPlan, setShowPlan] = useState(false);
  const [planItems, setPlanItems] = useState<string[]>([]);
  const { progress, rules } = useUser();

  const weeklyData = useMemo(() => {
    // Build last 7 days from localStorage.daily_stats
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    let stats: Record<string, { completions: number; violations: number }>; 
    try {
      stats = JSON.parse(localStorage.getItem('daily_stats') || '{}');
    } catch {
      stats = {};
    }
    const data = [] as Array<{ day: string; completions: number; violations: number; pnl: number }>;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const entry = stats[key] || { completions: 0, violations: 0 };
      const pnl = Math.round((entry.completions - entry.violations) * 160); // simple proxy
      data.push({ day: dayNames[d.getDay()], completions: entry.completions, violations: entry.violations, pnl });
    }
    return data;
  }, []);

  const emotionData = [
    { name: 'Confident', value: 40, color: '#10b981' },
    { name: 'FOMO', value: 25, color: '#f59e0b' },
    { name: 'Fear', value: 20, color: '#ef4444' },
    { name: 'Neutral', value: 15, color: '#6b7280' },
  ];

  // Per-rule, time-of-day, and weekday-hour heatmap from activity_log
  const { perRuleData, hourlyData, heatmap, tagStats } = useMemo(() => {
    let log: Array<{ ts: number; type: 'violation' | 'completion'; ruleId?: string }> = [];
    try {
      log = JSON.parse(localStorage.getItem('activity_log') || '[]');
    } catch {}

    const ruleNameById = new Map<string, string>();
    const ruleTagsById = new Map<string, string[]>();
    rules.forEach(r => ruleNameById.set(r.id, r.text));
    rules.forEach(r => ruleTagsById.set(r.id, r.tags || []));

    const perRuleMap = new Map<string, number>();
    const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, violations: 0, completions: 0 }));
    const heat = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    const tagAgg: Record<string, number> = {};

    for (const item of log) {
      const d = new Date(item.ts);
      const h = d.getHours();
      const w = d.getDay(); // 0..6 (Sun..Sat)
      if (h >= 0 && h < 24) {
        if (item.type === 'violation') hourly[h].violations += 1;
        if (item.type === 'completion') hourly[h].completions += 1;
      }
      if (w >= 0 && w < 7 && item.type === 'violation') {
        heat[w][h] += 1;
      }
      if (item.type === 'violation' && item.ruleId) {
        const name = ruleNameById.get(item.ruleId) || 'Unknown Rule';
        perRuleMap.set(name, (perRuleMap.get(name) || 0) + 1);
        const tags = ruleTagsById.get(item.ruleId) || [];
        for (const t of tags) {
          const key = t.toLowerCase();
          tagAgg[key] = (tagAgg[key] || 0) + 1;
        }
      }
    }

    const perRule = Array.from(perRuleMap.entries()).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    return { perRuleData: perRule, hourlyData: hourly, heatmap: heat, tagStats: tagAgg };
  }, [rules]);

  // Top risky hours from heatmap
  const topRiskyHours = useMemo(() => {
    const entries: Array<{ day: string; hour: number; count: number }> = [];
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const c = heatmap?.[d]?.[h] || 0;
        if (c > 0) entries.push({ day: days[d], hour: h, count: c });
      }
    }
    return entries.sort((a,b)=>b.count-a.count).slice(0,5);
  }, [heatmap]);

  // AI-style analysis to detect weaknesses and propose actions
  const { weaknesses, recommendations } = useMemo(() => {
    const w: string[] = [];
    const r: string[] = [];

    // 1) Emotion signals
    const fomo = emotionData.find(e => e.name === 'FOMO')?.value ?? 0;
    const fear = emotionData.find(e => e.name === 'Fear')?.value ?? 0;
    if (fomo >= 20) {
      w.push('FOMO-driven decision spikes');
      r.push('Adopt a 2-minute cooldown before entries when you feel FOMO; only proceed if all checklist items are met.');
      r.push('Place alerts and use limit orders at plan levels instead of chasing breakouts.');
    }
    if (fear >= 20) {
      w.push('Elevated fear response');
      r.push('Cut position size by 25–50% after a loss and switch to A+ setups only for the next 3 trades.');
      r.push('Define a maximum daily loss and stop trading once reached.');
    }

    // 2) Daily performance & violations
    const worstDays = weeklyData
      .filter(d => d.violations > 0)
      .map(d => d.day);
    if (worstDays.length) {
      w.push(`Rule violations on: ${worstDays.join(', ')}`);
      r.push('Review the trades from those days and tag the exact violated rule. Add a pre-trade checkbox to block that error.');
      r.push('Avoid first 15 minutes on those days if your logs show early chops; trade the first clean retest instead.');
    }

    // 3) Discipline score
    if (progress.disciplineScore < 90) {
      w.push('Discipline score below 90%');
      r.push('For the next 5 sessions, require written confluence (2–3 reasons) before every trade.');
      r.push('Set a daily cap: max 3 trades/day. Journal only after each trade before looking for the next.');
    }

    // 4) PnL risk skew (simple proxy from weekly pnl)
    const totalPnl = weeklyData.reduce((s, d) => s + d.pnl, 0);
    const redDays = weeklyData.filter(d => d.pnl < 0).length;
    if (totalPnl < 0 || redDays >= 2) {
      w.push('PnL inconsistency');
      r.push('Tighten risk-per-trade to a fixed fraction (e.g., 0.5–1.0R) and avoid adding to losers.');
      r.push('Pre-define take-profit partials; move stop to breakeven at +1R to protect winners.');
    }

    // 5) Tag-aware suggestions
    const tagEntries = Object.entries(tagStats || {}).sort((a,b) => b[1]-a[1]);
    if (tagEntries.length) {
      const top = tagEntries.slice(0, 3).map(([k]) => k);
      if (top.some(t => t.includes('risk'))) {
        w.push('High violation concentration on Risk-tagged rules');
        r.push('Set fixed risk caps (e.g., 0.5–1.0R) and size ladders. Use a stop-to-breakeven playbook at +1R.');
      }
      if (top.some(t => t.includes('mindset'))) {
        w.push('Mindset-related slippage detected');
        r.push('Introduce a 2–5 minute cool-down timer after losses and add post-trade journaling prompts.');
      }
    }

    // Fallback
    if (!w.length) w.push('No critical weaknesses detected this period');
    if (!r.length) r.push('Maintain your current routine and keep journaling key lessons after each trade.');

    return { weaknesses: w, recommendations: r };
  }, [emotionData, weeklyData, progress.disciplineScore, tagStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600">Track your trading performance</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>

          {/* Report Type Selection */}
          <div className="flex gap-2">
            {['weekly', 'monthly', 'completion'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveReport(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeReport === type
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {type} Report
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Report */}
        {activeReport === 'weekly' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Completions</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
                <p className="text-green-600 text-sm">↑ 2 from last week</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">72%</p>
                  </div>
                </div>
                <p className="text-blue-600 text-sm">↑ 5% from last week</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Violations</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
                <p className="text-red-600 text-sm">↓ 1 from last week</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-gray-600 text-sm">P&L</p>
                    <p className="text-2xl font-bold text-gray-900">$1,080</p>
                  </div>
                </div>
                <p className="text-green-600 text-sm">↑ $340 from last week</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Daily Performance */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="completions" fill="#10b981" name="Completions" />
                      <Bar dataKey="violations" fill="#ef4444" name="Violations" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Emotion Analysis */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Emotional State Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={emotionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {emotionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {emotionData.map((emotion) => (
                    <div key={emotion.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: emotion.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{emotion.name}</span>
                      <span className="text-sm font-medium">{emotion.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Insights</h3>
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-medium text-blue-800 mb-2">Weekly Summary</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Strong performance this week with 8 successful rule completions. Your discipline score improved by 12% 
                  compared to last week. However, you experienced FOMO-driven trades on Tuesday and Thursday.
                </p>
                {/* Weaknesses */}
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" /> Weaknesses Detected
                  </h5>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-blue-900">
                    {weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
                {/* Action Plan */}
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Action Plan (Next 5 Sessions)
                  </h5>
                  <ol className="list-decimal pl-6 space-y-1 text-sm text-blue-900">
                    {recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Per-Rule Violations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Most Violated Rules</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perRuleData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="name" type="category" stroke="#666" width={220} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" name="Violations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time-of-Day Patterns */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Time-of-Day Patterns</h3>
              <p className="text-sm text-gray-600 mb-3">Distribution of completions and violations by hour (0–23)</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Bar dataKey="completions" fill="#10b981" name="Completions" />
                    <Bar dataKey="violations" fill="#ef4444" name="Violations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekday x Hour Heatmap */
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Heatmap (Violations)</h3>
              <div className="overflow-x-auto">
                <div className="grid" style={{ gridTemplateColumns: `80px repeat(24, minmax(14px, 1fr))` }}>
                  {/* Header Row */}
                  <div></div>
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="text-[10px] text-gray-500 text-center">{h}</div>
                  ))}
                  {/* Rows */}
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => (
                    <>
                      <div key={`${day}-label`} className="text-xs text-gray-600 flex items-center">{day}</div>
                      {Array.from({ length: 24 }, (_, h) => {
                        const v = heatmap?.[i]?.[h] || 0;
                        const level = Math.min(1, v / 5);
                        const bg = `rgba(239,68,68,${0.1 + level * 0.9})`;
                        return <div key={`${day}-${h}`} className="h-5 border border-gray-100" style={{ backgroundColor: v ? bg : '#f9fafb' }} title={`${day} ${h}:00 — ${v} violations`} />;
                      })}
                    </>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Legend:</span> lighter = fewer, darker = more violations. Focus risk controls on dark cells.
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Top Risky Hours:</span> {topRiskyHours.length ? topRiskyHours.map((e,i)=>`${e.day} ${e.hour}:00 (${e.count})`).join(', ') : 'None yet'}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  onClick={() => {
                    // Build a short, actionable weekly plan based on tags and risky hours
                    const items: string[] = [];
                    const riskHeavy = Object.keys(tagStats||{}).some(k=>k.includes('risk'));
                    const mindsetHeavy = Object.keys(tagStats||{}).some(k=>k.includes('mindset'));
                    if (riskHeavy) {
                      items.push('Adopt fixed risk cap of 0.5–1.0R per trade for the next 5 sessions.');
                      items.push('Predefine size ladders and enforce stop-to-breakeven at +1R.');
                    }
                    if (mindsetHeavy) {
                      items.push('Use a 2–5 minute cooldown after losses before any new order.');
                      items.push('Complete a 3-question micro-journal after each trade.');
                    }
                    if (topRiskyHours.length) {
                      const hours = topRiskyHours.slice(0,3).map(e=>`${e.day} ${e.hour}:00`).join(', ');
                      items.push(`Avoid first 15 minutes during peak hours (${hours}); trade only retests with full checklist.`);
                    }
                    if (!items.length) items.push('Maintain current routine; keep logging emotions and reasons pre-trade.');
                    setPlanItems(items);
                    setShowPlan(true);
                  }}
                >
                  Generate 1-Week Plan
                </button>
              </div>
            </div>
          </>
        )}

        {/* Plan Modal */}
        {showPlan && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPlan(false)}></div>
            <div className="absolute inset-0 m-auto bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg h-fit">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">1-Week Discipline Plan</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowPlan(false)}>×</button>
              </div>
              <p className="text-gray-600 mb-4">Follow this checklist over your next 5 sessions.</p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-800">
                {planItems.map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ol>
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setShowPlan(false)}>Got it</button>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Report Placeholder */}
        {activeReport === 'monthly' && (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Monthly Report Coming Soon</h3>
            <p className="text-gray-600">
              Comprehensive monthly analytics with portfolio growth tracking and discipline trends.
            </p>
          </div>
        )}

        {/* Completion Report Placeholder */}
        {activeReport === 'completion' && (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Completion Report</h3>
            <p className="text-gray-600">
              Detailed analysis of your 50-bottle challenge progress with exportable achievements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}