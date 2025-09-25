import React, { useMemo } from 'react';

// Data processing utilities for reports
export function useReportData() {
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

  const weeklyMetrics = useMemo(() => {
    const comps = weeklyData.reduce((s, d) => s + (d.completions || 0), 0);
    const vios = weeklyData.reduce((s, d) => s + (d.violations || 0), 0);
    let wins = 0, total = 0;
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    try {
      const raw = localStorage.getItem('journal_trades');
      const arr = raw ? JSON.parse(raw) : [];
      for (const t of Array.isArray(arr) ? arr : []) {
        const ds = (t.date || '').slice(0, 10);
        if (!ds) continue;
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

  const weeklyProfitFactor = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    let totalProfits = 0;
    let totalLosses = 0;
    try {
      const raw = localStorage.getItem('journal_trades');
      const arr = raw ? JSON.parse(raw) : [];
      for (const t of Array.isArray(arr) ? arr : []) {
        const ds = (t.date || '').slice(0, 10);
        if (!ds) continue;
        const dsNum = Number(ds.replace(/-/g, ''));
        const sNum = Number(start.toISOString().slice(0,10).replace(/-/g, ''));
        const eNum = Number(today.toISOString().slice(0,10).replace(/-/g, ''));
        if (dsNum >= sNum && dsNum <= eNum) {
          const pnl = Number(t.pnl);
          if (!Number.isNaN(pnl)) {
            if (pnl > 0) totalProfits += pnl;
            else if (pnl < 0) totalLosses += pnl;
          }
        }
      }
    } catch {}
    if (totalProfits === 0 && totalLosses === 0) return null;
    if (totalLosses === 0 && totalProfits > 0) return Infinity;
    const denom = Math.abs(totalLosses);
    return denom > 0 ? (totalProfits / denom) : null;
  }, [weeklyData]);

  return {
    trades,
    averageRR,
    weeklyData,
    monthlyData,
    completionData,
    weeklyMetrics,
    weeklyProfitFactor
  };
}
