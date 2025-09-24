import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';

export default function Journal() {
  const [activeTab, setActiveTab] = useState('trades');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const { addToast } = useToast();
  const { recordCompletion } = useUser();

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

  const [trades, setTrades] = useState<typeof mockTrades>(() => {
    try {
      const raw = localStorage.getItem('journal_trades');
      if (raw) return JSON.parse(raw);
    } catch {}
    return mockTrades;
  });
  const [journals, setJournals] = useState<typeof mockJournals>(() => {
    try {
      const raw = localStorage.getItem('journal_notes');
      if (raw) return JSON.parse(raw);
    } catch {}
    return mockJournals;
  });

  useEffect(() => {
    try { localStorage.setItem('journal_trades', JSON.stringify(trades)); } catch {}
  }, [trades]);
  useEffect(() => {
    try { localStorage.setItem('journal_notes', JSON.stringify(journals)); } catch {}
  }, [journals]);

  // New Entry form state
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0,10),
    symbol: '',
    type: 'Long',
    entry: '',
    exit: '',
    size: '',
    emotion: 'Neutral',
    notes: '',
    ruleCompliant: true,
  });

  const resetForm = () => setForm({
    date: new Date().toISOString().slice(0,10),
    symbol: '', type: 'Long', entry: '', exit: '', size: '', emotion: 'Neutral', notes: '', ruleCompliant: true,
  });

  const saveEntry = () => {
    if (!form.symbol || !form.entry || !form.exit || !form.size) {
      addToast('warning', 'Please complete symbol, entry, exit, and size.');
      return;
    }
    const entryNum = Number(form.entry);
    const exitNum = Number(form.exit);
    const sizeNum = Number(form.size);
    if (Number.isNaN(entryNum) || Number.isNaN(exitNum) || Number.isNaN(sizeNum)) {
      addToast('warning', 'Entry, Exit, and Size must be numbers.');
      return;
    }
    const pnl = Number(((exitNum - entryNum) * sizeNum).toFixed(2));
    const newTrade = {
      id: Date.now(),
      date: form.date,
      symbol: form.symbol.toUpperCase(),
      type: form.type,
      entry: entryNum,
      exit: exitNum,
      size: sizeNum,
      pnl,
      emotion: form.emotion,
      notes: form.notes,
      ruleCompliant: form.ruleCompliant,
    };
    setTrades(prev => [newTrade, ...prev]);
    if (form.notes.trim()) {
      setJournals(prev => [{ id: Date.now(), date: form.date, entry: form.notes.trim(), mood: form.emotion, disciplineScore: form.ruleCompliant ? 90 : 60 }, ...prev]);
    }
    if (form.ruleCompliant) {
      recordCompletion();
    }
    addToast('success', 'Journal entry added.');
    setShowNewEntry(false);
    resetForm();
  };

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
            <button onClick={() => setShowNewEntry(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
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
              {trades.map((trade) => (
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
              {journals.map((journal) => (
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

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">New Journal Entry</h3>
              <button onClick={() => setShowNewEntry(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input type="date" value={form.date} onChange={(e)=>setForm({...form, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                <input value={form.symbol} onChange={(e)=>setForm({...form, symbol: e.target.value})} placeholder="AAPL" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <input value={form.size} onChange={(e)=>setForm({...form, size: e.target.value})} placeholder="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry</label>
                <input value={form.entry} onChange={(e)=>setForm({...form, entry: e.target.value})} placeholder="150.25" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exit</label>
                <input value={form.exit} onChange={(e)=>setForm({...form, exit: e.target.value})} placeholder="152.75" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Emotion</label>
                <select value={form.emotion} onChange={(e)=>setForm({...form, emotion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Confident</option>
                  <option>FOMO</option>
                  <option>Fear</option>
                  <option>Neutral</option>
                  <option>Frustrated</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea rows={4} value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="What happened? What did you learn?" />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input id="rc" type="checkbox" checked={form.ruleCompliant} onChange={(e)=>setForm({...form, ruleCompliant: e.target.checked})} />
                <label htmlFor="rc" className="text-sm text-gray-700">Rule Compliant</label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={()=>setShowNewEntry(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={saveEntry} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}