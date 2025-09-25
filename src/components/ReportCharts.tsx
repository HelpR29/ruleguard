import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartsProps {
  weeklyData: Array<{ day: string; completions: number; violations: number; pnl: number }>;
  emotionData: Array<{ name: string; value: number; color: string }>;
}

export const ReportCharts = React.memo(({ weeklyData, emotionData }: ChartsProps) => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Daily Performance */}
      <div className="rounded-2xl p-6 card-surface">
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
      <div className="rounded-2xl p-6 card-surface">
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
  );
});

ReportCharts.displayName = 'ReportCharts';
