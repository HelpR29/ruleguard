import { useEffect, useState } from 'react';
import { Plus, BookOpen, Calendar, TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import { useTradesStorage } from '../hooks/useStorage';
import { saveAttachment, deleteAttachment } from '../utils/db';
import StockChart from '../components/StockChart';
import AIInsights from '../components/AIInsights';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import AnalyticsFilters from '../components/AnalyticsFilters';
import SymbolAutocomplete from '../components/SymbolAutocomplete';
import TradeImagesDisplay from '../components/TradeImages';
import LiveTradeChartDisplay from '../components/LiveTradeChart';
import { Tooltip } from '../components/Tooltip';

// Local interface for journal trades (matches the expected usage)
interface JournalTrade {
  id: number;
  date: string;
  symbol: string;
  type: 'Long' | 'Short';
  entry: number;
  exit: number;
  size: number;
  pnl: number;
  emotion: string;
  notes: string;
  ruleCompliant: boolean;
  target: number | null;
  stop: number | null;
  tags: string[];
  imageIds: number[];
  setup?: string;
}

function Journal() {
  const [activeTab, setActiveTab] = useState('trades');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const { addToast } = useToast();
  const { recordTradeProgress } = useUser();
  const [premiumStatus] = useState<string>(() => {
    try { return localStorage.getItem('premium_status') || 'none'; } catch { return 'none'; }
  });
  const [achievements] = useState<string[]>(() => {
    try { const a = JSON.parse(localStorage.getItem('user_achievements') || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
  });

  const mockTrades: JournalTrade[] = [
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
      ruleCompliant: true,
      target: null,
      stop: null,
      tags: ['breakout','trend'],
      imageIds: []
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
      ruleCompliant: false,
      target: null,
      stop: null,
      tags: ['momentum','reversal'],
      imageIds: []
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

  const [trades, setTrades] = useState<JournalTrade[]>(() => {
    try {
      const raw = localStorage.getItem('journal_trades');
      if (raw) return JSON.parse(raw);
    } catch {}
    return []; // Start with empty array instead of mock data
  });
  const [journals, setJournals] = useState<typeof mockJournals>(() => {
    try {
      const raw = localStorage.getItem('journal_notes');
      if (raw) return JSON.parse(raw);
    } catch {}
    return []; // Start with empty array instead of mock data
  });

  const [analyticsFilters, setAnalyticsFilters] = useState({
    dateRange: '30d' as '7d' | '30d' | '90d' | '1y' | 'custom',
    symbols: [] as string[],
    tradeTypes: [] as string[],
    emotions: [] as string[],
    ruleCompliant: undefined as boolean | undefined,
    tags: [] as string[]
  });

  const handleAnalyticsFiltersChange = (filters: any) => {
    setAnalyticsFilters(filters);
  };

  const [showAnalyticsFilters, setShowAnalyticsFilters] = useState(false);

  // One-time migration: move legacy base64 images to IndexedDB and store IDs
  useEffect(() => {
    (async () => {
      try {
        if (localStorage.getItem('journal_migrated_images_v1') === 'true') return;
        let changed = false;
        const next = await Promise.all((trades || []).map(async (t: any) => {
          if (Array.isArray(t.images) && t.images.length > 0 && (!Array.isArray(t.imageIds) || t.imageIds.length === 0)) {
            const ids: number[] = [];
            for (const dataUrl of t.images) {
              try {
                const blob = await (await fetch(dataUrl)).blob();
                const id = await saveAttachment(blob);
                ids.push(id);
              } catch {}
            }
            changed = true;
            const { images, ...rest } = t;
            return { ...rest, imageIds: ids, type: rest.type as 'Long' | 'Short' } as JournalTrade;
          }
          return t as JournalTrade;
        }));
        if (changed) {
          setTrades(next as JournalTrade[]);
          try { localStorage.setItem('journal_trades', JSON.stringify(next)); } catch {}
        }
        localStorage.setItem('journal_migrated_images_v1', 'true');
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-time cleanup: strip any leftover base64 images arrays from trades to slim localStorage
  useEffect(() => {
    try {
      if (localStorage.getItem('journal_cleanup_images_v1') === 'true') return;
      let changed = false;
      const next = (trades as any[]).map(t => {
        if (t && 'images' in t) { const { images, ...rest } = t; changed = true; return { ...rest, type: rest.type as 'Long' | 'Short' }; }
        return t;
      });
      if (changed) {
        setTrades(next as JournalTrade[]);
        try { localStorage.setItem('journal_trades', JSON.stringify(next)); } catch {}
      }
      localStorage.setItem('journal_cleanup_images_v1', 'true');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try { localStorage.setItem('journal_trades', JSON.stringify(trades)); } catch {}
  }, [trades]);
  useEffect(() => {
    try { localStorage.setItem('journal_notes', JSON.stringify(journals)); } catch {}
  }, [journals]);

  // New Entry form state
  const [form, setForm] = useState({
    setup: '',
    date: new Date().toISOString().slice(0,10),
    symbol: '',
    type: 'Long',
    entry: '',
    exit: '',
    target: '',
    stop: '',
    size: '',
    emotion: 'Neutral',
    notes: '',
    tags: '',
    ruleCompliant: true,
    imageIds: [] as number[],
    imagePreviews: [] as string[],
  });

  const [showChart, setShowChart] = useState(false);

  const resetForm = () => {
    try { form.imagePreviews.forEach(u => URL.revokeObjectURL(u)); } catch {}
    setForm({
      date: new Date().toISOString().slice(0,10),
      symbol: '',
      setup: '',
      type: 'Long',
      entry: '',
      exit: '',
      target: '',
      stop: '',
      size: '',
      emotion: 'Neutral',
      notes: '',
      tags: '',
      ruleCompliant: true,
      imageIds: [],
      imagePreviews: [],
    });
  };
  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    const maxFiles = 4;
    const allowed = ['image/png','image/jpeg','image/webp','image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const selected = Array.from(files)
      .filter(f=>{
        if (!allowed.includes(f.type)) { addToast('warning', `Unsupported type: ${f.type}`); return false; }
        if (f.size > maxSize) { addToast('warning', `${f.name} is too large (max 5MB)`); return false; }
        return true;
      })
      .slice(0, maxFiles);
    const ids: number[] = [];
    const previews: string[] = [];
    for (const f of selected) {
      try {
        const id = await saveAttachment(f);
        ids.push(id);
        previews.push(URL.createObjectURL(f));
      } catch {}
    }
    setForm(prev => ({
      ...prev,
      imageIds: [...prev.imageIds, ...ids].slice(0, maxFiles),
      imagePreviews: [...prev.imagePreviews, ...previews].slice(0, maxFiles)
    }));
  };

  // no audio support

  const saveEntry = () => {
    if (!form.symbol || !form.entry || !form.exit || !form.size) {
      addToast('warning', 'Please complete symbol, entry, exit, and size.');
      return;
    }
    const entryNum = Number(form.entry);
    const exitNum = Number(form.exit);
    const targetNum = form.target ? Number(form.target) : undefined;
    const stopNum = form.stop ? Number(form.stop) : undefined;
    const sizeNum = Number(form.size);
    if (Number.isNaN(entryNum) || Number.isNaN(exitNum) || Number.isNaN(sizeNum) ||
        (form.target && Number.isNaN(targetNum as number)) || (form.stop && Number.isNaN(stopNum as number))) {
      addToast('warning', 'Entry, Exit, Size (and optional Target/Stop) must be numbers.');
      return;
    }
    // Basic sanity checks for planned target/stop if provided
    if (targetNum !== undefined && stopNum !== undefined) {
      if (form.type === 'Long') {
        if (targetNum <= entryNum) addToast('warning', 'Target should be greater than Entry for a Long.');
        if (stopNum >= entryNum) addToast('warning', 'Stop should be less than Entry for a Long.');
      } else {
        if (targetNum >= entryNum) addToast('warning', 'Target should be less than Entry for a Short.');
        if (stopNum <= entryNum) addToast('warning', 'Stop should be greater than Entry for a Short.');
      }
    }
    if (targetNum !== undefined && targetNum === exitNum) {
      addToast('info', 'Note: Exit equals Target — treating Exit as the actual filled price and Target as your planned TP.');
    }
    const pnl = Number(((exitNum - entryNum) * sizeNum).toFixed(2));
    // Compute percent gain for contribution toward next completion
    const rawPct = ((exitNum - entryNum) / entryNum) * 100;
    const gainPct = form.type === 'Long' ? rawPct : ((entryNum - exitNum) / entryNum) * 100;
    const newTrade = {
      setup: form.setup,
      id: Date.now(),
      date: form.date,
      symbol: form.symbol.toUpperCase(),
      type: form.type as 'Long' | 'Short',
      entry: entryNum,
      exit: exitNum,
      target: targetNum ?? null,
      stop: stopNum ?? null,
      size: sizeNum,
      pnl,
      emotion: form.emotion,
      notes: form.notes,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      ruleCompliant: form.ruleCompliant,
      imageIds: form.imageIds,
    };
    setTrades(prev => [newTrade, ...prev]);
    if (form.notes.trim()) {
      setJournals(prev => [{ id: Date.now(), date: form.date, entry: form.notes.trim(), mood: form.emotion, disciplineScore: form.ruleCompliant ? 90 : 60 }, ...prev]);
    }
    if (form.ruleCompliant) {
      // Contribute positive percent toward automated progress
      if (gainPct > 0) recordTradeProgress(Number(gainPct.toFixed(2)), true);
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
            <Tooltip content="Add a new trade entry to your journal with details, charts, and notes">
              <button onClick={() => setShowNewEntry(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                <Plus className="h-4 w-4" />
                New Entry
              </button>
            </Tooltip>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Tooltip content="Total number of trades recorded in your journal">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-blue-600 text-sm mb-1">Total Trades</p>
                <p className="text-2xl font-bold text-blue-700">247</p>
              </div>
            </Tooltip>
            <Tooltip content="Percentage of profitable trades out of total trades">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-600 text-sm mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-green-700">68%</p>
              </div>
            </Tooltip>
            <Tooltip content="Average profit or loss per trade">
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-purple-600 text-sm mb-1">Avg P&L</p>
                <p className="text-2xl font-bold text-purple-700">$125</p>
              </div>
            </Tooltip>
            <Tooltip content="Percentage of trades that followed your trading rules">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-amber-600 text-sm mb-1">Rule Compliance</p>
                <p className="text-2xl font-bold text-amber-700">85%</p>
              </div>
            </Tooltip>
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
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Activity className="h-4 w-4" />
              Analytics
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
                      <div className="flex items-center gap-2 justify-end">
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
                        {typeof trade.target === 'number' && typeof trade.stop === 'number' && (
                          (() => {
                            const risk = trade.type === 'Long' ? (trade.entry - trade.stop) : (trade.stop - trade.entry);
                            const reward = trade.type === 'Long' ? (trade.target - trade.entry) : (trade.entry - trade.target);
                            const valid = risk > 0 && reward > 0;
                            if (!valid) return null;
                            const rr = reward / risk;
                            const color = rr >= 2 ? 'bg-green-100 text-green-800 border-green-200' : rr >= 1 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-red-100 text-red-800 border-red-200';
                            return (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs border ${color}`}
                                title={"R:R = |Target − Entry| ÷ |Entry − Stop| (planned levels)"}
                              >
                                R:R 1:{rr.toFixed(2)}
                              </span>
                            );
                          })()
                        )}
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

                  {/* Attachments */}
                  {Array.isArray(trade.imageIds) && trade.imageIds.length > 0 && (
                    <TradeImagesDisplay
                      ids={trade.imageIds}
                      onRemove={async (idx) => {
                        try {
                          const id = trade.imageIds?.[idx];
                          if (typeof id === 'number') await deleteAttachment(id);
                        } catch {}
                        setTrades(prev => prev.map(t => {
                          if (t.id !== trade.id) return t;
                          const ids = (t.imageIds || []).filter((_, i) => i !== idx);
                          return { ...t, imageIds: ids };
                        }));
                        addToast('success', 'Image removed.');
                      }}
                    />
                  )}

                  {/* Chart Analysis for completed trades */}
                  {trade.symbol && (
                    <div className="mt-3">
                      <details className="group">
                        <summary className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                          <BarChart3 className="h-4 w-4" />
                          <span>View Chart Analysis</span>
                          <span className="text-xs text-gray-400 group-open:hidden">(Click to expand)</span>
                        </summary>
                        <div className="mt-3">
                          <StockChart
                            symbol={trade.symbol}
                            showLevels={true}
                            entryPrice={trade.entry || undefined}
                            exitPrice={trade.exit || undefined}
                            targetPrice={trade.target || undefined}
                            stopPrice={trade.stop || undefined}
                          />
                        </div>
                      </details>
                    </div>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.ruleCompliant
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.ruleCompliant ? 'Rule Compliant' : 'Rule Violation'}
                    </span>
                    {premiumStatus === 'premium' || achievements.includes('champion') ? (
                      <button
                        className="text-xs px-2 py-1 border border-red-300 text-red-700 rounded hover:bg-red-50"
                        onClick={async () => {
                          if (!confirm('Delete this entry? This will remove its attachments.')) return;
                          // cleanup attachments
                          try {
                            if (Array.isArray(trade.imageIds)) {
                              for (const id of trade.imageIds) {
                                await deleteAttachment(id);
                              }
                            }
                          } catch {}
                          setTrades(prev => prev.filter(t => t.id !== trade.id));
                          addToast('success', 'Entry deleted.');
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <a 
                        href="/premium" 
                        className="text-[11px] px-2 py-0.5 rounded-full chip hover:no-underline" 
                        title="Delete is available with Premium or Champion badge"
                      >
                        Premium to delete
                      </a>
                    )}
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

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <AnalyticsFilters
                filters={analyticsFilters}
                onFiltersChange={handleAnalyticsFiltersChange}
                trades={trades as any}
                isOpen={showAnalyticsFilters}
                onToggle={() => setShowAnalyticsFilters(!showAnalyticsFilters)}
              />
              <AIInsights
                trades={trades as any}
                period="weekly"
                isLoading={false}
                onAnalysisComplete={(count) => {
                  console.log('Analysis complete with', count, 'insights');
                }}
              />
              <AdvancedAnalytics
                trades={trades as any}
                period="week"
                onExport={(format) => {
                  console.log('Exporting analytics as:', format);
                  // Export functionality
                  const dataStr = JSON.stringify(trades, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `trading-journal-${new Date().toISOString().split('T')[0]}.${format}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                onFilterChange={(filters: any) => {
                  console.log('Analytics filters changed:', filters);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
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
                <SymbolAutocomplete
                  value={form.symbol}
                  onChange={(value) => setForm({...form, symbol: value})}
                  placeholder="AAPL, TSLA, BTC, ETH..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Setup</label>
                <input value={form.setup} onChange={(e)=>setForm({...form, setup: e.target.value})} placeholder="Breakout, Pullback..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <input value={form.size} onChange={(e)=>setForm({...form, size: e.target.value})} placeholder="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Entry</label>
                <input value={form.entry} onChange={(e)=>setForm({...form, entry: e.target.value})} placeholder="150.25" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exit</label>
                <input value={form.exit} onChange={(e)=>setForm({...form, exit: e.target.value})} placeholder="152.75" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                <input value={form.target} onChange={(e)=>setForm({...form, target: e.target.value})} placeholder="155.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss</label>
                <input value={form.stop} onChange={(e)=>setForm({...form, stop: e.target.value})} placeholder="145.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Emotion</label>
                <select value={form.emotion} onChange={(e)=>setForm({...form, emotion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                  <option>Confident</option>
                  <option>FOMO</option>
                  <option>Fear</option>
                  <option>Neutral</option>
                  <option>Frustrated</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea rows={4} value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800" placeholder="What happened? What did you learn?" />
              </div>
              {/* Images input and previews */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Images (up to 4)</label>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={(e)=>handleImageFiles(e.target.files)} className="block w-full text-sm" />
                {form.imagePreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {form.imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img src={src} alt={`img-${idx}`} className="w-full h-16 object-cover rounded border" />
                        <button
                          type="button"
                          aria-label="Remove image"
                          onClick={async () => {
                            const id = form.imageIds[idx];
                            try { await deleteAttachment(id); } catch {}
                            URL.revokeObjectURL(src);
                            setForm(prev => {
                              const ids = prev.imageIds.filter((_, i) => i !== idx);
                              const previews = prev.imagePreviews.filter((_, i) => i !== idx);
                              return { ...prev, imageIds: ids, imagePreviews: previews };
                            });
                          }}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-gray-700 border border-gray-300 rounded-full w-6 h-6 grid place-items-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Strategy / Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={(e)=>setForm({...form, tags: e.target.value})}
                  onKeyDown={(e)=>{
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setForm(prev => {
                        const t = prev.tags.trim();
                        if (!t || t.endsWith(',') || t.endsWith(', ')) return prev;
                        return { ...prev, tags: t + ', ' };
                      });
                    }
                    if (e.key === 'Backspace') {
                      const inputEl = e.target as HTMLInputElement;
                      if (inputEl.selectionStart === 0 && inputEl.selectionEnd === 0 && inputEl.value.trim() === '') {
                        e.preventDefault();
                        setForm(prev => {
                          const arr = prev.tags.split(',').map(t=>t.trim()).filter(Boolean);
                          arr.pop();
                          return { ...prev, tags: arr.length ? arr.join(', ') + ', ' : '' };
                        });
                      }
                    }
                  }}
                  placeholder="Breakout, Risk, Momentum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                />
                {/* Live chips preview */}
                {(() => {
                  const chips = form.tags.split(',').map(t=>t.trim()).filter(Boolean);
                  if (!chips.length) return null;
                  return (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {chips.map((tag, idx) => (
                        <button
                          type="button"
                          key={`${tag}-${idx}`}
                          onClick={() => {
                            const next = chips.filter((_, i) => i !== idx);
                            setForm(prev => ({ ...prev, tags: next.length ? next.join(', ') + ', ' : '' }));
                          }}
                          className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          title="Click to remove"
                        >
                          {tag} ×
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input id="rc" type="checkbox" checked={form.ruleCompliant} onChange={(e)=>setForm({...form, ruleCompliant: e.target.checked})} />
                <label htmlFor="rc" className="text-sm text-gray-700 dark:text-gray-300">Rule Compliant</label>
              </div>
              {/* R:R Preview */}
              <div className="md:col-span-2 text-sm text-gray-700 dark:text-gray-300">
                {(() => {
                  const e = Number(form.entry), t = Number(form.target), s = Number(form.stop);
                  if (!Number.isNaN(e) && !Number.isNaN(t) && !Number.isNaN(s)) {
                    const risk = form.type === 'Long' ? e - s : s - e;
                    const reward = form.type === 'Long' ? t - e : e - t;
                    if (risk > 0 && reward > 0) {
                      const rr = (reward / risk).toFixed(2);
                      return <p>Planned R:R = <span className="font-semibold">1:{rr}</span> • Risk ${risk.toFixed(2)} • Reward ${reward.toFixed(2)} per share</p>;
                    }
                  }
                  return <p className="text-gray-700 dark:text-gray-300">Provide Entry, Target, and Stop to preview R:R.</p>;
                })()}
              </div>
              {/* Chart Toggle */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chart Analysis</label>
                  <button
                    type="button"
                    onClick={() => setShowChart(!showChart)}
                    className="flex items-center gap-2 text-xs accent-outline"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {showChart ? 'Hide Chart' : 'Show Chart'}
                  </button>
                </div>
                {showChart ? (
                  <StockChart
                    symbol={form.symbol}
                    onPriceSelect={(price) => {
                      // Auto-fill entry or exit based on current state
                      if (!form.entry) {
                        setForm(prev => ({ ...prev, entry: price.toString() }));
                      } else if (!form.exit) {
                        setForm(prev => ({ ...prev, exit: price.toString() }));
                      } else if (!form.target) {
                        setForm(prev => ({ ...prev, target: price.toString() }));
                      } else if (!form.stop) {
                        setForm(prev => ({ ...prev, stop: price.toString() }));
                      }
                    }}
                    showLevels={true}
                    entryPrice={form.entry ? parseFloat(form.entry) : undefined}
                    exitPrice={form.exit ? parseFloat(form.exit) : undefined}
                    targetPrice={form.target ? parseFloat(form.target) : undefined}
                    stopPrice={form.stop ? parseFloat(form.stop) : undefined}
                  />
                ) : (
                  <LiveTradeChartDisplay entry={form.entry} exit={form.exit} target={form.target} stop={form.stop} />
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={async ()=>{
                  // cleanup unsaved attachments and previews
                  try { for (const id of form.imageIds) { await deleteAttachment(id); } } catch {}
                  resetForm();
                  setShowNewEntry(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                Cancel
              </button>
              <button onClick={saveEntry} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Journal;
