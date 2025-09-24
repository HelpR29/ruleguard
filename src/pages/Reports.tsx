import React, { useMemo, useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUser } from '../context/UserContext';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('weekly');
  const { progress } = useUser();

  const weeklyData = [
    { day: 'Mon', completions: 2, violations: 0, pnl: 450 },
    { day: 'Tue', completions: 1, violations: 1, pnl: -120 },
    { day: 'Wed', completions: 3, violations: 0, pnl: 680 },
    { day: 'Thu', completions: 0, violations: 2, pnl: -250 },
    { day: 'Fri', completions: 2, violations: 0, pnl: 320 },
  ];

  const emotionData = [
    { name: 'Confident', value: 40, color: '#10b981' },
    { name: 'FOMO', value: 25, color: '#f59e0b' },
    { name: 'Fear', value: 20, color: '#ef4444' },
    { name: 'Neutral', value: 15, color: '#6b7280' },
  ];

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

    // Fallback
    if (!w.length) w.push('No critical weaknesses detected this period');
    if (!r.length) r.push('Maintain your current routine and keep journaling key lessons after each trade.');

    return { weaknesses: w, recommendations: r };
  }, [emotionData, weeklyData, progress.disciplineScore]);

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
          </>
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