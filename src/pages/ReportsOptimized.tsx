import React, { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useReportData } from '../hooks/useReportData';
import { ReportMetrics } from '../components/ReportMetrics';
import { ReportCharts } from '../components/ReportCharts';
import { ExportShare } from '../components/ExportShare';
import { TagFilter } from '../components/TagFilter';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('weekly');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { progress, rules } = useUser() as any;

  // Use the new data hook
  const {
    trades,
    averageRR,
    weeklyData,
    monthlyData,
    completionData,
    weeklyMetrics,
    weeklyProfitFactor
  } = useReportData();

  // Emotion data (could be moved to a separate hook later)
  const emotionData = [
    { name: 'Confident', value: 40, color: '#10b981' },
    { name: 'FOMO', value: 25, color: '#f59e0b' },
    { name: 'Fear', value: 20, color: '#ef4444' },
    { name: 'Neutral', value: 15, color: '#6b7280' },
  ];

  // Tag filtering logic
  const allTags = useMemo(() => {
    const ruleTags = (rules as any[]).flatMap((r: any) => (r.tags||[]).map((t: string)=>t.toLowerCase()));
    let tradeTags: string[] = [];
    try {
      const raw = localStorage.getItem('journal_trades');
      const ts: any[] = raw ? JSON.parse(raw) : [];
      tradeTags = ts.flatMap(t => (t.tags||[]).map((x: string)=>x.toLowerCase()));
    } catch {}
    return Array.from(new Set([...ruleTags, ...tradeTags]));
  }, [rules, trades]);

  const toggleTag = (t: string) => {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  const totalPnl = useMemo(() => weeklyData.reduce((s, d) => s + d.pnl, 0), [weeklyData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6 card-surface">
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
            <ExportShare
              weeklyData={weeklyData}
              monthlyData={monthlyData}
              completionData={completionData}
              averageRR={averageRR}
              progress={progress}
              topRiskyHours={[]}
              topTags={[]}
            />
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
            <TagFilter
              allTags={allTags}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              onClearTags={clearTags}
            />

            <ReportMetrics
              weeklyCompletions={weeklyMetrics.weeklyCompletions}
              weeklyViolations={weeklyMetrics.weeklyViolations}
              weeklyWinRate={weeklyMetrics.weeklyWinRate}
              averageRR={averageRR}
              weeklyProfitFactor={weeklyProfitFactor}
              totalPnl={totalPnl}
            />

            <ReportCharts
              weeklyData={weeklyData}
              emotionData={emotionData}
            />

            {/* AI Insights placeholder - can be expanded later */}
            <div className="rounded-2xl p-6 card-surface">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Insights</h3>
              <p className="text-gray-600">AI-powered analysis coming soon...</p>
            </div>
          </>
        )}

        {/* Monthly Report placeholder */}
        {activeReport === 'monthly' && (
          <div className="rounded-2xl p-6 card-surface">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Report</h3>
            <p className="text-gray-600">Monthly analytics coming soon...</p>
          </div>
        )}

        {/* Completion Report placeholder */}
        {activeReport === 'completion' && (
          <div className="rounded-2xl p-6 card-surface">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Completion Report</h3>
            <p className="text-gray-600">Completion analytics coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
