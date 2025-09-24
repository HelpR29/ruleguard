import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/UserContext';

export default function CompoundingChart() {
  const { settings, progress } = useUser();
  const [viewMode, setViewMode] = useState<'fiat' | 'percentage'>('fiat');

  const generateData = () => {
    const data = [];
    let currentValue = settings.startingPortfolio;
    
    for (let i = 0; i <= settings.targetCompletions; i++) {
      const isCompleted = i <= progress.completions;
      data.push({
        completion: i,
        balance: currentValue,
        percentage: ((currentValue - settings.startingPortfolio) / settings.startingPortfolio) * 100,
        isCompleted
      });
      currentValue = currentValue * (1 + settings.growthPerCompletion / 100);
    }
    
    return data;
  };

  const data = generateData();
  const currentData = data.slice(0, progress.completions + 1);
  const futureData = data.slice(progress.completions);

  return (
    <div className="space-y-4">
      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('fiat')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'fiat'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Portfolio Value ($)
        </button>
        <button
          onClick={() => setViewMode('percentage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'percentage'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Growth (%)
        </button>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="completion"
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => 
                viewMode === 'fiat' 
                  ? `$${value.toFixed(0)}` 
                  : `${value.toFixed(0)}%`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [
                viewMode === 'fiat' 
                  ? `$${value.toFixed(2)}` 
                  : `${value.toFixed(1)}%`,
                viewMode === 'fiat' ? 'Balance' : 'Growth'
              ]}
              labelFormatter={(label) => `Completion ${label}`}
            />
            
            {/* Completed line */}
            <Line
              dataKey={viewMode === 'fiat' ? 'balance' : 'percentage'}
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              data={currentData}
              connectNulls={false}
            />
            
            {/* Future projection line */}
            <Line
              dataKey={viewMode === 'fiat' ? 'balance' : 'percentage'}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#94a3b8', strokeWidth: 1, r: 2 }}
              data={futureData}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600 mb-1">Current</p>
          <p className="text-lg font-bold text-green-700">
            ${progress.currentBalance.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600 mb-1">Target</p>
          <p className="text-lg font-bold text-blue-700">
            ${(settings.startingPortfolio * Math.pow(1 + settings.growthPerCompletion / 100, settings.targetCompletions)).toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-purple-600 mb-1">Growth</p>
          <p className="text-lg font-bold text-purple-700">
            {(((progress.currentBalance - settings.startingPortfolio) / settings.startingPortfolio) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-600 mb-1">Remaining</p>
          <p className="text-lg font-bold text-amber-700">
            {settings.targetCompletions - progress.completions}
          </p>
        </div>
      </div>
    </div>
  );
}