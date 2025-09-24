import React, { useMemo, useState } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUser } from '../context/UserContext';
import PnlCard from '../components/PnlCard';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('weekly');
  const [showPlan, setShowPlan] = useState(false);
  const [planItems, setPlanItems] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState<string>('');
  const { progress, rules, settings } = useUser() as any;
  const [progressMode, setProgressMode] = useState<'percent'|'counts'>('percent');
  const [premiumStatus] = useState<string>(() => {
    try { return localStorage.getItem('premium_status') || 'none'; } catch { return 'none'; }
  });
  const [achievements] = useState<string[]>(() => {
    try { const a = JSON.parse(localStorage.getItem('user_achievements') || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
  });

  // Load trades from Journal for R:R and tag analytics
  const trades = useMemo(() => {
    try {
      const raw = localStorage.getItem('journal_trades');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const averageRR = useMemo(() => {
    const items = (trades || []).filter((t: any) => typeof t.entry === 'number' && typeof t.target === 'number' && typeof t.stop === 'number');
    if (!items.length) return 0;
    let sum = 0, count = 0;
    for (const t of items) {
      const risk = t.type === 'Long' ? (t.entry - t.stop) : (t.stop - t.entry);
      const reward = t.type === 'Long' ? (t.target - t.entry) : (t.entry - t.target);
      if (risk > 0 && reward > 0) { sum += reward / risk; count++; }
    }
    return count ? sum / count : 0;
  }, [trades]);

  const weeklyData = useMemo(() => {
    // Build last 7 days; PnL from journal_trades if present for the day, else proxy fallback from daily_stats
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    let stats: Record<string, { completions: number; violations: number }>; 
    try { stats = JSON.parse(localStorage.getItem('daily_stats') || '{}'); } catch { stats = {}; }
    let trades: Array<{ date: string; pnl: number }>; 
    try {
      const raw = localStorage.getItem('journal_trades');
      const arr = raw ? JSON.parse(raw) : [];
      trades = Array.isArray(arr) ? arr.map((t:any)=>({ date: (t.date||'').slice(0,10), pnl: Number(t.pnl)||0 })) : [];
    } catch { trades = []; }
    const pnlByDate = trades.reduce((m: Record<string, number>, t) => { if (t.date) m[t.date] = (m[t.date]||0) + t.pnl; return m; }, {} as Record<string, number>);

    const data = [] as Array<{ day: string; completions: number; violations: number; pnl: number }>;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const entry = stats[key] || { completions: 0, violations: 0 };
      const hasTrades = Object.prototype.hasOwnProperty.call(pnlByDate, key);
      const fallbackPnl = Math.round((entry.completions - entry.violations) * 160);
      const pnl = hasTrades ? Math.round(pnlByDate[key]) : fallbackPnl;
      data.push({ day: dayNames[d.getDay()], completions: entry.completions, violations: entry.violations, pnl });
    }
    return data;
  }, []);

  const totalPnl = useMemo(() => weeklyData.reduce((s, d) => s + d.pnl, 0), [weeklyData]);
  const avatar = useMemo(() => {
    try {
      return localStorage.getItem('user_avatar') || '👤';
    } catch {
      return '👤';
    }
  }, []);

  const emotionData = [
    { name: 'Confident', value: 40, color: '#10b981' },
    { name: 'FOMO', value: 25, color: '#f59e0b' },
    { name: 'Fear', value: 20, color: '#ef4444' },
    { name: 'Neutral', value: 15, color: '#6b7280' },
  ];

  // Per-rule, time-of-day, and weekday-hour heatmap from activity_log
  const { perRuleData, hourlyData, heatmap, tagStats, maxHeat, topTags } = useMemo(() => {
    let log: Array<{ ts: number; type: 'violation' | 'completion'; ruleId?: string }> = [];
    try {
      log = JSON.parse(localStorage.getItem('activity_log') || '[]');
    } catch {}

    const ruleNameById = new Map<string, string>();
    const ruleTagsById = new Map<string, string[]>();
    (rules as any[]).forEach((r: any) => ruleNameById.set(r.id, r.text));
    (rules as any[]).forEach((r: any) => ruleTagsById.set(r.id, r.tags || []));

    const perRuleMap = new Map<string, number>();
    const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, violations: 0, completions: 0 }));
    const heat = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    const tagAgg: Record<string, number> = {};

    for (const item of log) {
      const d = new Date(item.ts);
      const h = d.getHours();
      const w = d.getDay(); // 0..6 (Sun..Sat)
      if (h >= 0 && h < 24) {
        if (item.type === 'violation') {
          // tag filter
          if (item.ruleId) {
            const tags = (ruleTagsById.get(item.ruleId) || []).map(t=>t.toLowerCase());
            const match = selectedTags.length === 0 || tags.some(t => selectedTags.includes(t));
            if (match) hourly[h].violations += 1;
          } else {
            hourly[h].violations += 1;
          }
        }
        if (item.type === 'completion') hourly[h].completions += 1;
      }
      if (w >= 0 && w < 7 && item.type === 'violation') {
        if (item.ruleId) {
          const tags = (ruleTagsById.get(item.ruleId) || []).map(t=>t.toLowerCase());
          const match = selectedTags.length === 0 || tags.some(t => selectedTags.includes(t));
          if (match) heat[w][h] += 1;
        } else {
          heat[w][h] += 1;
        }
      }
      if (item.type === 'violation' && item.ruleId) {
        const name = ruleNameById.get(item.ruleId) || 'Unknown Rule';
        const tags = (ruleTagsById.get(item.ruleId) || []).map(t=>t.toLowerCase());
        const match = selectedTags.length === 0 || tags.some(t => selectedTags.includes(t));
        if (match) {
          perRuleMap.set(name, (perRuleMap.get(name) || 0) + 1);
          for (const t of tags) {
            const key = t.toLowerCase();
            tagAgg[key] = (tagAgg[key] || 0) + 1;
          }
        }
      }
    }

    const perRule = Array.from(perRuleMap.entries()).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    const maxHeat = heat.reduce((m,row)=>Math.max(m, ...row), 0);
    const topTags = Object.entries(tagAgg).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return { perRuleData: perRule, hourlyData: hourly, heatmap: heat, tagStats: tagAgg, maxHeat, topTags };
  }, [rules, selectedTags]);

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

  const buildShareCard = async (forPrint: boolean = false) => {
    const width = 1200, height = 630;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Determine theme by PnL
    const totalPnl = weeklyData.reduce((s, d) => s + d.pnl, 0);
    const isGain = totalPnl >= 0;
    const bg1 = isGain ? '#064e3b' : '#7f1d1d';
    const bg2 = isGain ? '#10b981' : '#ef4444';
    // Background gradient
    const grad = ctx.createLinearGradient(0,0,width,height);
    grad.addColorStop(0, bg1);
    grad.addColorStop(1, bg2);
    ctx.fillStyle = grad; ctx.fillRect(0,0,width,height);
    // Card panel
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(40,40,width-80,height-80);
    // Brand strip
    ctx.fillStyle = '#111827';
    ctx.fillRect(40,40,width-80,60);
    // Logo (best-effort rasterize from public/svg)
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/logo-trade-game.svg';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      const logoSize = 44;
      ctx.drawImage(img, 54, 48, logoSize, logoSize);
    } catch {}
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    const dn = (localStorage.getItem('display_name') || '').trim();
    const brand = dn ? `RuleGuard • ${dn}` : 'RuleGuard';
    ctx.fillText(brand, 110, 80);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 42px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('RuleGuard Weekly Report', 70, 140);
    // Discipline & Avg R:R
    ctx.font = '600 28px Inter';
    ctx.fillText(`Discipline Score: ${progress.disciplineScore}%`, 70, 190);
    if (averageRR > 0) {
      ctx.fillText(`Avg R:R: 1:${averageRR.toFixed(2)}`, 520, 190);
    }

    // Big PnL figure
    const pnlText = `${isGain ? '+' : '−'}$${Math.abs(totalPnl).toLocaleString()}`;
    ctx.font = 'bold 86px Inter, system-ui';
    ctx.fillStyle = isGain ? '#10b981' : '#ef4444';
    ctx.fillText(pnlText, 70, 260);

    // Character avatar on right with glow (for free users use avatar)
    try {
      const savedAvatar = localStorage.getItem('user_avatar');
      if (savedAvatar) {
        // glow circle
        const cx = width - 280, cy = 290, r = 140;
        const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, r);
        glow.addColorStop(0, (isGain ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
        if (savedAvatar.startsWith('data:') || savedAvatar.startsWith('http') || savedAvatar.endsWith('.png') || savedAvatar.endsWith('.jpg') || savedAvatar.endsWith('.jpeg') || savedAvatar.endsWith('.webp') || savedAvatar.endsWith('.svg')) {
          const aimg = new Image(); aimg.crossOrigin = 'anonymous'; aimg.src = savedAvatar;
          await new Promise<void>((resolve)=>{aimg.onload=()=>resolve(); aimg.onerror=()=>resolve();});
          ctx.save();
          ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI*2); ctx.clip();
          ctx.drawImage(aimg, cx-120, cy-120, 240, 240);
          // tint overlay for consistency with UI card
          ctx.fillStyle = isGain ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
          ctx.fillRect(cx-120, cy-120, 240, 240);
          ctx.restore();
        } else {
          // emoji avatar render
          ctx.font = '140px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji';
          ctx.fillText(savedAvatar, width - 340, 340);
          // subtle tint circle
          ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI*2); ctx.closePath();
          ctx.fillStyle = isGain ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
          ctx.fill();
        }
      }
    } catch {}
    // Top risky hours
    ctx.font = 'bold 24px Inter'; ctx.fillText('Top Risky Hours', 70, 250);
    ctx.font = '400 22px Inter';
    topRiskyHours.slice(0,3).forEach((e, i) => {
      ctx.fillText(`${i+1}. ${e.day} ${e.hour}:00 (${e.count})`, 70, 285 + i*30);
    });
    // Top tags
    ctx.font = 'bold 24px Inter'; ctx.fillText('Top Tags', 520, 250);
    ctx.font = '400 22px Inter';
    topTags.slice(0,3).forEach(([tag, cnt], i) => {
      ctx.fillText(`${i+1}. ${tag} (${cnt})`, 520, 285 + i*30);
    });
    // Footer
    ctx.font = '400 18px Inter';
    ctx.fillStyle = '#374151';
    ctx.fillText('ruleguard.app • Share your discipline progress', 70, height-70);
    const url = canvas.toDataURL('image/png');
    setShareUrl(url);
    if (forPrint) {
      const w = window.open('about:blank', '_blank');
      if (w) {
        w.document.write(`<html><head><title>RuleGuard Report</title><style>body{margin:0;display:grid;place-items:center;background:#fff}</style></head><body><img src="${url}" style="max-width:100%;height:auto" onload="window.print(); setTimeout(()=>window.close(), 300);"/></body></html>`);
        w.document.close();
      }
      return;
    }
    try {
      if (navigator.share && navigator.canShare) {
        // Attempt Web Share with data URL converted to blob
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], 'ruleguard-report.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: 'My RuleGuard Weekly Report' });
        }
      }
    } catch {}
  };

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
            <div className="flex items-center gap-2">
              <button onClick={() => buildShareCard()} className="flex items-center gap-2 accent-btn">
                <Download className="h-4 w-4" />
                Share
              </button>
              <button onClick={() => buildShareCard(true)} className="flex items-center gap-2 accent-outline">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
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
            {/* Tag Filters */}
            <div className="rounded-2xl p-4 card-surface">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-700 font-medium mr-2">Tag Filter:</span>
                {allTags.length === 0 && <span className="text-xs text-gray-500">No tags yet</span>}
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    type="button"
                    className={`px-2 py-1 rounded-full text-xs ${selectedTags.includes(tag) ? 'accent-chip-selected' : 'chip'}`}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTags.length > 0 && (
                  <button type="button" className="ml-2 text-sm text-gray-600 hover:text-gray-900" onClick={() => setSelectedTags([])}>Clear</button>
                )}
              </div>
            </div>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Progress Tracker */}
              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-gray-600 text-sm">Progress</p>
                      <p className="text-xs text-gray-500">This Week</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs accent-outline" onClick={() => setProgressMode(m => m==='percent'?'counts':'percent')}>Switch View</button>
                    {(() => {
                      const allowed = premiumStatus === 'premium' || achievements.includes('champion');
                      if (allowed) {
                        return <a href="/settings" className="text-xs accent-btn">Edit Goal</a>;
                      }
                      return <a href="/premium" title="Editing weekly goal requires Premium or Champion" className="text-[11px] chip rounded-full px-2 py-0.5">Premium to edit</a>;
                    })()}
                  </div>
                </div>
                {(() => {
                  const weekCompletions = weeklyData.reduce((s,d)=>s+d.completions,0);
                  const goal = (settings && settings.targetCompletions) ? Number(settings.targetCompletions) : 10;
                  const remaining = Math.max(0, goal - weekCompletions);
                  if (progressMode === 'percent') {
                    return (
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{progress.disciplineScore}%</p>
                        <p className="text-green-600 text-sm mt-1">Discipline</p>
                      </div>
                    );
                  }
                  return (
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{weekCompletions} / {goal}</p>
                      <p className="text-sm text-gray-600 mt-1">{remaining} more to reach weekly goal</p>
                    </div>
                  );
                })()}
              </div>

              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">72%</p>
                  </div>
                </div>
                <p className="text-blue-600 text-sm">↑ 5% from last week</p>
              </div>

              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Violations</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
                <p className="text-red-600 text-sm">↓ 1 from last week</p>
              </div>

              <div className="col-span-1">
                <PnlCard
                  title="Weekly Performance"
                  subtitle="Auto-themed"
                  pnl={totalPnl}
                  rr={averageRR || undefined}
                  avatar={avatar || undefined}
                  timeframe="This Week"
                  variant="tile"
                  sparkline={weeklyData.map(d=>d.pnl)}
                />
              </div>

              {/* Avg R:R */}
              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Average R:R</p>
                    <p className="text-2xl font-bold text-gray-900">{averageRR > 0 ? `1:${averageRR.toFixed(2)}` : '—'}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Based on journal Target/Stop</p>
              </div>
            </div>

            {/* Charts */}
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

            {/* AI Insights */}
            <div className="rounded-2xl p-6 card-surface">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Insights</h3>
              {topTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-xs text-gray-600">Top tags:</span>
                  {topTags.slice(0,5).map(([tag, count]) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">{tag} ({count})</span>
                  ))}
                </div>
              )}
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
            <div className="rounded-2xl p-6 card-surface">
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
            <div className="rounded-2xl p-6 card-surface">
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

            {/* Weekday x Hour Heatmap */}
            <div className="rounded-2xl p-6 card-surface">
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
                    <React.Fragment key={`row-${day}`}>
                      <div className="text-xs text-gray-600 flex items-center">{day}</div>
                      {Array.from({ length: 24 }, (_, h) => {
                        const v = heatmap?.[i]?.[h] || 0;
                        const level = Math.min(1, v / 5);
                        const bg = `rgba(239,68,68,${0.1 + level * 0.9})`;
                        return <div key={`${day}-${h}`} className="h-5 border border-gray-100" style={{ backgroundColor: v ? bg : '#f9fafb' }} title={`${day} ${h}:00 — ${v} violations`} />;
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Legend:</span> lighter = fewer, darker = more violations. Focus risk controls on dark cells.
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">0</span>
                    <div className="h-2 w-40 rounded" style={{ background: 'linear-gradient(to right, rgba(239,68,68,0.1), rgba(239,68,68,1))' }} />
                    <span className="text-[10px] text-gray-500">{maxHeat}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Top Risky Hours:</span> {topRiskyHours.length ? topRiskyHours.map((e,i)=>`${e.day} ${e.hour}:00 (${e.count})`).join(', ') : 'None yet'}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  className="accent-outline"
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
                <button
                  className="ml-3 accent-btn"
                  onClick={() => buildShareCard()}
                >
                  Create Share Card
                </button>
              </div>
              {shareUrl && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Share Preview</h4>
                  <img src={shareUrl} alt="Share card" className="w-full max-w-2xl rounded-lg border" />
                  <div className="mt-2 flex gap-2">
                    <a href={shareUrl} download="ruleguard-report.png" className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Download PNG</a>
                    <button
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                      onClick={async () => {
                        try {
                          const res = await fetch(shareUrl);
                          const blob = await res.blob();
                          // @ts-ignore
                          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        } catch {}
                      }}
                    >
                      Copy Image
                    </button>
                  </div>
                </div>
              )}
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
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    onClick={() => {
                      const text = `1-Week Discipline Plan:\n- ${planItems.join('\n- ')}`;
                      navigator.clipboard?.writeText(text);
                    }}
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    onClick={() => window.print()}
                  >
                    Print / PDF
                  </button>
                </div>
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