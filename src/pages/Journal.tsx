import React, { useState } from 'react';
import { Plus, BookOpen, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function Journal() {
  const [activeTab, setActiveTab] = useState('trades');
  
  const mockTrades = [
    {
      id: 1,
      date: '2024-01-15',
      symbol: 'AAPL',
      type: 'Long',
      entry: 150.25,
      exit: 152.75,
      size: 100,
      pnl: 250,
      emotion: 'Confident',
      notes: 'Clean breakout above resistance. Followed rules perfectly.',
      ruleCompliant: true
    },
    {
      id: 2,
      date: '2024-01-14',
      symbol: 'TSLA',
      type: 'Short',
      entry: 245.80,
      exit: 248.20,
      size: 50,
      pnl: -120,
      emotion: 'FOMO',
      notes: 'Entered without proper setup. Should have waited.',
      ruleCompliant: false
    }
  ];

  const mockJournals = [
    {
      id: 1,
      date: '2024-01-15',
      entry: 'Great trading day today. Stuck to my rules and waited for good setups. The AAPL trade was textbook - clear breakout with volume. Need to keep this discipline up.',
      mood: 'Positive',
      disciplineScore: 95
    },
    {
      id: 2,
      date: '2024-01-14',
      entry: 'Made a mistake on TSLA. Got caught up in the momentum and entered without my usual checklist. Lost money but more importantly broke my rules. Need to be more patient.',
      mood: 'Frustrated',
      disciplineScore: 60
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trading Journal</h1>
                <p className="text-gray-600">Track your trades and thoughts</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              New Entry
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-blue-600 text-sm mb-1">Total Trades</p>
              <p className="text-2xl font-bold text-blue-700">247</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-green-600 text-sm mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-green-700">68%</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-purple-600 text-sm mb-1">Avg P&L</p>
              <p className="text-2xl font-bold text-purple-700">$125</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-amber-600 text-sm mb-1">Rule Compliance</p>
              <p className="text-2xl font-bold text-amber-700">85%</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'trades'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Trade Log
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Daily Journal
            </button>
          </div>

          {/* Trade Log Tab */}
          {activeTab === 'trades' && (
            <div className="space-y-4">
              {mockTrades.map((trade) => (
                <div key={trade.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${trade.ruleCompliant ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{trade.symbol} - {trade.type}</h3>
                        <p className="text-sm text-gray-600">{trade.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${trade.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl > 0 ? '+' : ''}${trade.pnl}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        {trade.pnl > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-gray-600">
                          {((trade.exit - trade.entry) / trade.entry * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Entry:</span>
                      <span className="ml-2 font-medium">${trade.entry}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Exit:</span>
                      <span className="ml-2 font-medium">${trade.exit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Size:</span>
                      <span className="ml-2 font-medium">{trade.size} shares</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Emotion:</span>
                      <span className="ml-2 font-medium">{trade.emotion}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{trade.notes}</p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.ruleCompliant
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.ruleCompliant ? 'Rule Compliant' : 'Rule Violation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Daily Journal Tab */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              {mockJournals.map((journal) => (
                <div key={journal.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{journal.date}</h3>
                        <p className="text-sm text-gray-600">Mood: {journal.mood}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Discipline Score</p>
                      <p className="text-lg font-bold text-blue-600">{journal.disciplineScore}%</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{journal.entry}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}