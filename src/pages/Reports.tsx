import React, { useMemo, useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

  // Force re-compute on external data updates
  const [version, setVersion] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  useEffect(() => {
    const onCustom = () => { setVersion(v => v + 1); setLastSyncedAt(new Date()); };
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (['journal_trades','daily_stats','activity_log','user_progress','user_settings'].includes(e.key)) onCustom();
    };
    window.addEventListener('rg:data-change', onCustom as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('rg:data-change', onCustom as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Humanized synced text
  const [syncedNowTicker, setSyncedNowTicker] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSyncedNowTicker(t => t + 1), 30000); // update every 30s
    return () => clearInterval(id);
  }, []);
  const syncedText = useMemo(() => {
    if (!lastSyncedAt) return '';
    const diffSec = Math.max(0, Math.floor((Date.now() - lastSyncedAt.getTime()) / 1000));
    if (diffSec < 60) return 'Synced just now';
    const mins = Math.floor(diffSec / 60);
    return `Synced ${mins}m ago`;
  }, [lastSyncedAt, syncedNowTicker]);

  // Load trades from Journal for R:R and tag analytics
  const trades = useMemo(() => {
    try {
      const raw = localStorage.getItem('journal_trades');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  // Emotional State Analysis data (percentages by emotion)
  const emotionData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of Array.isArray(trades) ? trades : []) {
      const emos = Array.isArray((t as any).emotions)
        ? (t as any).emotions
        : ((t as any).emotion ? [String((t as any).emotion)] : []);
      for (const e of emos) counts[e] = (counts[e] || 0) + 1;
    }
    const total = Object.values(counts).reduce((s, v) => s + v, 0);
    const palette: Record<string, string> = {
      Confident: '#10b981',
      FOMO: '#f59e0b',
      Fear: '#ef4444',
      Neutral: '#6b7280',
    };
    const ordered = ['Confident','FOMO','Fear','Neutral'];
    if (total === 0) {
      return ordered.map(name => ({ name, value: 0, color: palette[name] }));
    }
    return ordered.map(name => ({
      name,
      value: Number((((counts[name] || 0) / total) * 100).toFixed(1)),
      color: palette[name]
    }));
  }, [trades, version]);

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

  // Top applied rules performance (from trades.rules)
  const topAppliedRules = useMemo(() => {
    try {
      const map = new Map<string, { count: number; wins: number; totalPnl: number }>();
      for (const t of Array.isArray(trades) ? (trades as any[]) : []) {
        const rules: string[] = Array.isArray((t as any).rules) ? (t as any).rules : [];
        if (!rules.length) continue;
        const pnlNum = Number((t as any).pnl ?? (t as any).profitLoss ?? 0) || 0;
        for (const r of rules) {
          const prev = map.get(r) || { count: 0, wins: 0, totalPnl: 0 };
          prev.count += 1;
          if (pnlNum > 0) prev.wins += 1;
          prev.totalPnl += pnlNum;
          map.set(r, prev);
        }
      }
      const rows = Array.from(map.entries()).map(([rule, v]) => ({
        rule,
        count: v.count,
        winRate: v.count ? Math.round((v.wins / v.count) * 100) : 0,
        avgPnl: v.count ? v.totalPnl / v.count : 0,
        totalPnl: v.totalPnl,
      })).sort((a,b)=> b.totalPnl - a.totalPnl);
      return rows;
    } catch {
      return [] as Array<{ rule: string; count: number; winRate: number; avgPnl: number; totalPnl: number }>;
    }
  }, [trades, version]);

  

  // Monthly aggregation (last 30 days)
  const monthlyData = useMemo(() => {
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    let stats: Record<string, { completions: number; violations: number }>; 
    try { stats = JSON.parse(localStorage.getItem('daily_stats') || '{}'); } catch { stats = {}; }
    let tradesArr: Array<{ date: string; pnl: number }>; 
    try {
      const raw = localStorage.getItem('journal_trades');
      const arr = raw ? JSON.parse(raw) : [];
      tradesArr = Array.isArray(arr) ? arr.map((t:any)=>({ date: (t.date||'').slice(0,10), pnl: Number(t.pnl)||0 })) : [];
    } catch { tradesArr = []; }
    const pnlByDate = tradesArr.reduce((m: Record<string, number>, t) => { if (t.date) m[t.date] = (m[t.date]||0) + t.pnl; return m; }, {} as Record<string, number>);

    const data = [] as Array<{ date: string; day: string; completions: number; violations: number; pnl: number }>;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const entry = stats[key] || { completions: 0, violations: 0 };
      const hasTrades = Object.prototype.hasOwnProperty.call(pnlByDate, key);
      const fallbackPnl = Math.round((entry.completions - entry.violations) * 160);
      const pnl = hasTrades ? Math.round(pnlByDate[key]) : fallbackPnl;
      data.push({ date: key, day: dayNames[d.getDay()], completions: entry.completions, violations: entry.violations, pnl });
    }
    return data;
  }, []);

  // Completion report data (last 30 days completions only)
  const completionData = useMemo(() => {
    const today = new Date();
    let stats: Record<string, { completions: number; violations: number }>; 
    try { stats = JSON.parse(localStorage.getItem('daily_stats') || '{}'); } catch { stats = {}; }
    const data = [] as Array<{ date: string; completions: number; violations: number }>;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const entry = stats[key] || { completions: 0, violations: 0 };
      data.push({ date: key, completions: entry.completions, violations: entry.violations });
    }
    return data;
  }, []);

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

  // Weekly metrics (real values) - must come after weeklyData
  const { weeklyCompletions, weeklyViolations, weeklyWinRate } = useMemo(() => {
    const comps = weeklyData.reduce((s, d) => s + (d.completions || 0), 0);
    const vios = weeklyData.reduce((s, d) => s + (d.violations || 0), 0);
    let wins = 0, total = 0;
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    // Count trade wins/losses for last 7 days
    try {
      const raw = localStorage.getItem('journal_trades');
      const arr = raw ? JSON.parse(raw) : [];
      for (const t of Array.isArray(arr) ? arr : []) {
        const ds = (t.date || '').slice(0, 10);
        if (!ds) continue;
        // Normalize by comparing date-only strings to avoid time zone pitfalls
        const dsNum = Number(ds.replace(/-/g, ''));
        const sNum = Number(start.toISOString().slice(0,10).replace(/-/g, ''));
        const eNum = Number(today.toISOString().slice(0,10).replace(/-/g, ''));
        if (dsNum >= sNum && dsNum <= eNum) {
          if (typeof t.pnl === 'number') {
            total++;
            if (t.pnl > 0) wins++;
          }
        }
      }
    } catch {}
    const wr = total ? Math.round((wins / total) * 100) : 0;
    return { weeklyCompletions: comps, weeklyViolations: vios, weeklyWinRate: wr };
  }, [weeklyData]);

  // Profit Factor with local selector (7d/30d): total profits / |total losses|
  const [pfRange, setPfRange] = useState<'7d' | '30d'>('7d');
  const pfHelp = 'Profit Factor = total profits ÷ absolute losses. Values above 1.0 indicate a profitable system.';
  const profitFactor = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (pfRange === '7d' ? 6 : 29));
    let totalProfits = 0;
    let totalLosses = 0; // negative numbers
    let tradesInRange = 0;
    try {
      const raw = localStorage.getItem('journal_trades');
      const arr = raw ? JSON.parse(raw) : [];
      for (const t of Array.isArray(arr) ? arr : []) {
        const dateStr = (t.date || t.entryDate || '').slice(0, 10);
        if (!dateStr) continue;
        const dsNum = Number(dateStr.replace(/-/g, ''));
        const sNum = Number(start.toISOString().slice(0,10).replace(/-/g, ''));
        const eNum = Number(today.toISOString().slice(0,10).replace(/-/g, ''));
        if (dsNum >= sNum && dsNum <= eNum) {
          tradesInRange++;
          const rawPnl = (t.pnl ?? t.profitLoss ?? 0);
          const pnlNum = typeof rawPnl === 'number' ? rawPnl : Number(String(rawPnl).replace(/[^0-9.-]/g, ''));
          if (Number.isFinite(pnlNum)) {
            if (pnlNum > 0) totalProfits += pnlNum;
            else if (pnlNum < 0) totalLosses += pnlNum; // negative accumulation
          }
        }
      }
    } catch {}
    if (tradesInRange === 0) return null; // no trades in selected window
    if (totalProfits === 0 && totalLosses === 0) return 0; // all zero-pnl trades
    if (totalLosses === 0 && totalProfits > 0) return Infinity; // never lost -> infinite PF
    const denom = Math.abs(totalLosses);
    return denom > 0 ? (totalProfits / denom) : null;
  }, [pfRange, version]);

  const totalPnl = useMemo(() => weeklyData.reduce((s, d) => s + d.pnl, 0), [weeklyData]);
  const avatar = useMemo(() => {
    try {
      return localStorage.getItem('user_avatar') || '👤';
    } catch {
      return '👤';
    }
  }, []);

  // emotionData is computed above from trades' emotions

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
    // Logo (best-effort rasterize from public asset)
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/lockin-logo.png';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      const logoW = 120; // widescreen logo
      const logoH = 36;
      ctx.drawImage(img, 54, 52, logoW, logoH);
    } catch {}
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    const dn = (localStorage.getItem('display_name') || '').trim();
    const brand = dn ? `LockIn • ${dn}` : 'LockIn';
    ctx.fillText(brand, 110, 80);
    ctx.fillStyle = '#111827';
    ctx.font = '700 44px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('LockIn Weekly Report', 70, 140);
    // Discipline & Avg R:R
    ctx.font = '600 28px Inter';
    ctx.fillText(`Discipline Score: ${progress.disciplineScore}%`, 70, 200);
    if (averageRR > 0) {
      ctx.fillText(`Avg R:R: 1:${averageRR.toFixed(2)}`, 650, 200);
    }

    // Big PnL figure (larger but spaced to avoid overlap)
    const pnlText = `${isGain ? '+' : '−'}$${Math.abs(totalPnl).toLocaleString()}`;
    ctx.font = '800 72px Inter, system-ui';
    ctx.fillStyle = isGain ? '#10b981' : '#ef4444';
    ctx.fillText(pnlText, 70, 290);

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
    // Section separator
    ctx.strokeStyle = 'rgba(17,24,39,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(70, 310); ctx.lineTo(width-70, 310); ctx.stroke();

    // Top risky hours
    ctx.font = '700 24px Inter'; ctx.fillStyle = '#111827'; ctx.fillText('Top Risky Hours', 70, 350);
    ctx.font = '400 20px Inter'; ctx.fillStyle = '#1f2937';
    topRiskyHours.slice(0,3).forEach((e, i) => {
      ctx.fillText(`${i+1}. ${e.day} ${e.hour}:00 (${e.count})`, 70, 380 + i*28);
    });
    // Top tags
    ctx.font = '700 24px Inter'; ctx.fillStyle = '#111827'; ctx.fillText('Top Tags', 650, 350);
    ctx.font = '400 20px Inter'; ctx.fillStyle = '#1f2937';
    topTags.slice(0,3).forEach(([tag, cnt], i) => {
      ctx.fillText(`${i+1}. ${tag} (${cnt})`, 650, 380 + i*28);
    });
    // Footer
    ctx.font = '400 18px Inter';
    ctx.fillStyle = '#374151';
    ctx.fillText('lockin.app • Share your discipline progress', 70, height-70);
    const url = canvas.toDataURL('image/png');
    setShareUrl(url);
    if (forPrint) {
      const w = window.open('about:blank', '_blank');
      if (w) {
        w.document.write(`<html><head><title>LockIn Report</title><style>body{margin:0;display:grid;place-items:center;background:#fff}</style></head><body><img src="${url}" style="max-width:100%;height:auto" onload="window.print(); setTimeout(()=>window.close(), 300);"/></body></html>`);
        w.document.close();
      }
      return;
    }
    try {
      if (navigator.share && navigator.canShare) {
        // Attempt Web Share with data URL converted to blob
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], 'lockin-report.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: 'My LockIn Weekly Report' });
        }
      }
    } catch {}
  };

  // Export helpers
  const toCSV = (rows: Array<Record<string, any>>) => {
    if (!rows.length) return '';
    const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    const esc = (v: any) => {
      const s = String(v ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const lines = [headers.join(',')].concat(
      rows.map(r => headers.map(h => esc(r[h])).join(','))
    );
    return lines.join('\n');
  };

  const downloadFile = (content: BlobPart, mime: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch {}
  };

  const exportCSV = (type: 'weekly' | 'monthly' | 'completion') => {
    let rows: Array<Record<string, any>> = [];
    if (type === 'weekly') rows = weeklyData.map(d => ({ day: d.day, completions: d.completions, violations: d.violations, pnl: d.pnl }));
    if (type === 'monthly') rows = monthlyData.map(d => ({ date: d.date, day: d.day, completions: d.completions, violations: d.violations, pnl: d.pnl }));
    if (type === 'completion') rows = completionData.map(d => ({ date: d.date, completions: d.completions, violations: d.violations }));
    downloadFile(toCSV(rows), 'text/csv;charset=utf-8', `lockin-${type}-report.csv`);
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

              {/* Top Performing Rules */}
              {topAppliedRules.length > 0 && (
                <div className="rounded-2xl p-6 card-surface md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-gray-600 text-sm">Top Performing Rules</p>
                      <p className="text-lg font-bold text-gray-900">By Total P&L</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {topAppliedRules.slice(0,3).map((r) => (
                      <li key={r.rule} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.rule}</p>
                          <p className="text-xs text-gray-500">{r.count} trades • {r.winRate}% win</p>
                        </div>
                        <div className={`text-sm font-semibold ${r.avgPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{r.avgPnl >= 0 ? '+' : ''}${r.avgPnl.toFixed(2)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600">Track your trading performance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {syncedText && (
                <span className="text-xs text-gray-500 mr-2">{syncedText}</span>
              )}
              <button onClick={() => buildShareCard()} className="accent-btn">
                Share Report
              </button>
              <button onClick={() => buildShareCard(true)} className="accent-outline">
                Export as PDF
              </button>
              <button onClick={() => exportCSV(activeReport as any)} className="accent-outline">
                Export as CSV
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Completions</p>
                    <p className="text-2xl font-bold text-gray-900">{weeklyCompletions}</p>
                  </div>
                </div>
                <p className="text-green-600 text-sm">Weekly total</p>
              </div>

              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{weeklyWinRate}%</p>
                  </div>
                </div>
                <p className="text-blue-600 text-sm">Based on journal trades</p>
              </div>

              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-gray-600 text-sm">Violations</p>
                    <p className="text-2xl font-bold text-gray-900">{weeklyViolations}</p>
                  </div>
                </div>
                <p className="text-red-600 text-sm">Weekly total</p>
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

              {/* Profit Factor with local selector */}
              <div className="rounded-2xl p-6 card-surface">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 font-medium">?</span>
                  <div>
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      Profit factor
                      <span className="relative inline-flex group" aria-describedby="pf-tooltip">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label="What is Profit Factor?"
                          tabIndex={0}
                        >i</button>
                        <span
                          id="pf-tooltip"
                          role="tooltip"
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 hidden group-hover:block group-focus-within:block max-w-[260px] bg-gray-900 text-white text-xs rounded-md px-3 py-2 shadow-lg text-left whitespace-normal"
                        >
                          {pfHelp}
                          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                        </span>
                      </span>
                    </p>
                    <p className="text-2xl font-bold text-gray-900" title={pfHelp}>
                      {profitFactor === null ? '—' : (profitFactor === Infinity ? '∞' : profitFactor.toFixed(2))}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm" title={pfHelp}>Last {pfRange === '7d' ? '7' : '30'} days</p>
                <div className="mt-3 flex justify-center">
                  <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1 shadow-inner" role="group" aria-label="Profit factor range">
                    <button
                      type="button"
                      onClick={() => setPfRange('7d')}
                      aria-pressed={pfRange==='7d'}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${pfRange==='7d' ? 'bg-white shadow font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >7d</button>
                    <button
                      type="button"
                      onClick={() => setPfRange('30d')}
                      aria-pressed={pfRange==='30d'}
                      className={`px-3 py-1 text-xs rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${pfRange==='30d' ? 'bg-white shadow font-semibold text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >30d</button>
                  </div>
                </div>
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

              {(() => {
                const anyWeekly = weeklyData.some(d => (d.completions || d.violations || d.pnl));
                const anyTrades = Array.isArray(trades) && trades.length > 0;
                if (!anyWeekly && !anyTrades) {
                  return (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-800 mb-2">No Data Yet</h4>
                      <p className="text-gray-700 text-sm mb-1">Add completions or journal trades to generate AI insights.</p>
                      <p className="text-gray-600 text-xs">Insights will appear as soon as there is activity in the last 7 days.</p>
                    </div>
                  );
                }
                return (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Weekly Summary</h4>
                    <p className="text-blue-700 text-sm mb-3">
                      {`This week: ${weeklyCompletions} completions, ${weeklyViolations} violations, win rate ${weeklyWinRate}%`}
                    </p>
                    {/* Weaknesses */}
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" /> Weaknesses Detected
                      </h5>
                      <ul className="list-disc pl-6 space-y-1 text-sm text-blue-900">
                        {weaknesses.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                    {/* Action Plan */}
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" /> Action Plan (Next 5 Sessions)
                      </h5>
                      <ol className="list-decimal pl-6 space-y-1 text-sm text-blue-900">
                        {recommendations.map((rec) => (
                          <li key={rec}>{rec}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                );
              })()}
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
                  <span className="font-medium">Top Risky Hours:</span> {topRiskyHours.length ? topRiskyHours.map((e)=>`${e.day} ${e.hour}:00 (${e.count})`).join(', ') : 'None yet'}
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
                          if ((navigator as any).clipboard && 'write' in (navigator as any).clipboard && (window as any).ClipboardItem) {
                            const res = await fetch(shareUrl);
                            const blob = await res.blob();
                            // @ts-ignore
                            await (navigator as any).clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
                          } else {
                            // Fallback: copy URL or open image in a new tab
                            await (navigator as any).clipboard?.writeText?.(shareUrl);
                            const w = window.open(shareUrl, '_blank');
                            w?.focus();
                          }
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

        {/* Monthly Report */}
        {activeReport === 'monthly' && (
          <div className="rounded-2xl p-6 card-surface space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-2xl p-6 card-surface">
                <p className="text-gray-600 text-sm mb-1">Total Completions (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.reduce((s,d)=>s+d.completions,0)}</p>
              </div>
              <div className="rounded-2xl p-6 card-surface">
                <p className="text-gray-600 text-sm mb-1">Total Violations (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyData.reduce((s,d)=>s+d.violations,0)}</p>
              </div>
              <div className="rounded-2xl p-6 card-surface">
                <p className="text-gray-600 text-sm mb-1">Total PnL (30d)</p>
                <p className="text-2xl font-bold text-gray-900">${monthlyData.reduce((s,d)=>s+d.pnl,0)}</p>
              </div>
              <div className="rounded-2xl p-6 card-surface">
                <p className="text-gray-600 text-sm mb-1">Avg Daily Completions</p>
                <p className="text-2xl font-bold text-gray-900">{(monthlyData.reduce((s,d)=>s+d.completions,0)/30).toFixed(1)}</p>
              </div>
            </div>
            <div className="rounded-2xl p-6 card-surface">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Last 30 Days</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} interval={4} />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Bar dataKey="completions" fill="#10b981" name="Completions" />
                    <Bar dataKey="violations" fill="#ef4444" name="Violations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Completion Report */}
        {activeReport === 'completion' && (
          <div className="rounded-2xl p-6 card-surface space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl p-6 card-surface">
                <p className="text-gray-600 text-sm mb-1">Completions (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{completionData.reduce((s,d)=>s+d.completions,0)}</p>
              </div>
              <div className="rounded-2xl p-6 card-surface">
                <p className="text-gray-600 text-sm mb-1">Target Completions</p>
                <p className="text-2xl font-bold text-gray-900">{settings?.targetCompletions ?? 0}</p>
              </div>
              <div className="rounded-2xl p-6 card-surface">
                <p className="text-gray-600 text-sm mb-1">Discipline Score</p>
                <p className="text-2xl font-bold text-gray-900">{progress.disciplineScore}%</p>
              </div>
            </div>
            <div className="rounded-2xl p-6 card-surface">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Completions Trend (30d)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} interval={4} />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Bar dataKey="completions" fill="#10b981" name="Completions" />
                    <Bar dataKey="violations" fill="#ef4444" name="Violations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}