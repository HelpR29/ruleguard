/**
 * Analytics Utilities
 * Data processing and calculation utilities for advanced analytics
 */

import { Trade, ReportPeriod } from '../types';

export interface AnalyticsDataPoint {
  date: string;
  pnl: number;
  cumulativePnl: number;
  completions: number;
  violations: number;
  winRate: number;
  riskReward: number;
  volume: number;
  emotions: Record<string, number>;
  ruleCompliance: number;
  trades: Trade[];
}

export interface AnalyticsFilters {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  startDate?: Date;
  endDate?: Date;
  symbols: string[];
  tradeTypes: string[];
  emotions: string[];
  minPnL?: number;
  maxPnL?: number;
  ruleCompliant?: boolean;
  tags?: string[];
}

export interface AnalyticsMetrics {
  totalPnL: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  avgRiskReward: number;
  totalCompletions: number;
  totalViolations: number;
  complianceRate: number;
  profitFactor: number;
  avgDailyPnL: number;
  bestDay: number;
  worstDay: number;
  tradingDays: number;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    currentLosingStreak: number;
    longestLosingStreak: number;
  };
}

/**
 * Process trades into analytics data points
 */
export function processAnalyticsData(
  trades: Trade[],
  filters: AnalyticsFilters
): AnalyticsDataPoint[] {
  // Apply filters
  let filteredTrades = applyFilters(trades, filters);

  // Group by date
  const groupedData = groupTradesByDate(filteredTrades);

  // Calculate cumulative metrics
  let cumulativePnl = 0;
  const sortedDates = Object.keys(groupedData).sort();

  return sortedDates.map(date => {
    const dayData = groupedData[date];
    cumulativePnl += dayData.pnl;

    const totalTrades = dayData.trades.length;
    const winningTrades = dayData.trades.filter(t => (t.profitLoss || 0) > 0).length;

    return {
      ...dayData,
      cumulativePnl,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      ruleCompliance: totalTrades > 0 ? (dayData.completions / totalTrades) * 100 : 0
    };
  });
}

/**
 * Calculate comprehensive analytics metrics
 */
export function calculateAnalyticsMetrics(
  trades: Trade[],
  filters: AnalyticsFilters
): AnalyticsMetrics {
  const filteredTrades = applyFilters(trades, filters);
  const totalPnL = filteredTrades.reduce((sum, trade) => sum + (trade.profitLoss || 0), 0);
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(t => (t.profitLoss || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const avgRiskReward = filteredTrades
    .filter(t => t.target && t.stop)
    .reduce((sum, trade) => {
      const risk = Math.abs((trade.stop || 0) - trade.entryPrice);
      const reward = Math.abs((trade.target || 0) - trade.entryPrice);
      return sum + (reward / risk);
    }, 0) / Math.max(1, filteredTrades.filter(t => t.target && t.stop).length);

  const totalCompletions = filteredTrades.filter(t => t.ruleCompliant).length;
  const totalViolations = filteredTrades.filter(t => !t.ruleCompliant).length;
  const complianceRate = totalTrades > 0 ? (totalCompletions / totalTrades) * 100 : 0;

  const profitFactor = totalViolations > 0 ?
    Math.abs(totalPnL / (totalViolations * 100)) : Infinity;

  // Group by date for daily calculations
  const dailyPnL = Object.values(groupTradesByDate(filteredTrades))
    .map(day => day.pnl);
  const avgDailyPnL = dailyPnL.length > 0 ? dailyPnL.reduce((sum, pnl) => sum + pnl, 0) / dailyPnL.length : 0;
  const bestDay = Math.max(...dailyPnL);
  const worstDay = Math.min(...dailyPnL);

  const tradingDays = dailyPnL.length;

  // Calculate streaks
  const streakData = calculateStreaks(filteredTrades);

  return {
    totalPnL,
    totalTrades,
    winningTrades,
    winRate,
    avgRiskReward,
    totalCompletions,
    totalViolations,
    complianceRate,
    profitFactor,
    avgDailyPnL,
    bestDay,
    worstDay,
    tradingDays,
    streakData
  };
}

/**
 * Calculate emotion distribution data
 */
export function calculateEmotionData(trades: Trade[]): Array<{
  name: string;
  value: number;
  color: string;
}> {
  const emotionCounts = trades.reduce((acc, trade) => {
    if (trade.emotions) {
      trade.emotions.forEach(emotion => {
        acc[emotion] = (acc[emotion] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  return Object.entries(emotionCounts)
    .map(([name, count], index) => ({
      name,
      value: (count / trades.length) * 100,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Calculate performance comparison data
 */
export function calculateComparisonData(
  trades: Trade[],
  currentPeriod: ReportPeriod,
  comparisonPeriod: ReportPeriod
): {
  current: AnalyticsMetrics;
  previous: AnalyticsMetrics;
  changes: Record<keyof AnalyticsMetrics, {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
  }>;
} {
  const now = new Date();
  const currentTrades = filterTradesByPeriod(trades, currentPeriod, now);
  const previousTrades = filterTradesByPeriod(trades, comparisonPeriod, getPreviousPeriodDate(currentPeriod, now));

  const current = calculateAnalyticsMetrics(currentTrades, {
    dateRange: '30d',
    symbols: [],
    tradeTypes: [],
    emotions: [],
    ruleCompliant: undefined
  });

  const previous = calculateAnalyticsMetrics(previousTrades, {
    dateRange: '30d',
    symbols: [],
    tradeTypes: [],
    emotions: [],
    ruleCompliant: undefined
  });

  const changes = calculateMetricChanges(current, previous);

  return { current, previous, changes };
}

/**
 * Generate export data for CSV/PDF
 */
export function generateExportData(
  trades: Trade[],
  filters: AnalyticsFilters,
  format: 'csv' | 'pdf' | 'excel'
): string | object {
  const filteredTrades = applyFilters(trades, filters);

  if (format === 'csv') {
    const headers = [
      'Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Quantity',
      'P&L', 'P&L %', 'Target', 'Stop', 'Rule Compliant', 'Emotions', 'Notes'
    ];

    const rows = filteredTrades.map(trade => [
      trade.entryDate,
      trade.symbol,
      trade.type,
      trade.entryPrice,
      trade.exitPrice || '',
      trade.quantity,
      trade.profitLoss || 0,
      trade.profitLossPercent || 0,
      trade.target || '',
      trade.stop || '',
      trade.ruleCompliant ? 'Yes' : 'No',
      (trade.emotions || []).join(', '),
      trade.notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // For PDF/Excel, return structured data
  return {
    summary: calculateAnalyticsMetrics(filteredTrades, filters),
    trades: filteredTrades,
    filters,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Apply filters to trades array
 */
function applyFilters(trades: Trade[], filters: AnalyticsFilters): Trade[] {
  return trades.filter(trade => {
    const tradeDate = new Date(trade.entryDate);
    const now = new Date();

    // Date range filter
    switch (filters.dateRange) {
      case '7d':
        if (tradeDate < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) return false;
        break;
      case '30d':
        if (tradeDate < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) return false;
        break;
      case '90d':
        if (tradeDate < new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)) return false;
        break;
      case '1y':
        if (tradeDate < new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)) return false;
        break;
      case 'custom':
        if (filters.startDate && tradeDate < filters.startDate) return false;
        if (filters.endDate && tradeDate > filters.endDate) return false;
        break;
    }

    // Symbol filter
    if (filters.symbols.length > 0 && !filters.symbols.includes(trade.symbol)) {
      return false;
    }

    // Trade type filter
    if (filters.tradeTypes.length > 0 && !filters.tradeTypes.includes(trade.type)) {
      return false;
    }

    // Emotion filter
    if (filters.emotions.length > 0) {
      const hasMatchingEmotion = filters.emotions.some(emotion =>
        trade.emotions?.includes(emotion)
      );
      if (!hasMatchingEmotion) return false;
    }

    // P&L range filter
    const pnl = trade.profitLoss || 0;
    if (filters.minPnL !== undefined && pnl < filters.minPnL) return false;
    if (filters.maxPnL !== undefined && pnl > filters.maxPnL) return false;

    // Rule compliance filter
    if (filters.ruleCompliant !== undefined && trade.ruleCompliant !== filters.ruleCompliant) {
      return false;
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        trade.tags?.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
}

/**
 * Group trades by date
 */
function groupTradesByDate(trades: Trade[]): Record<string, {
  date: string;
  pnl: number;
  cumulativePnl: number;
  completions: number;
  violations: number;
  winRate: number;
  riskReward: number;
  volume: number;
  emotions: Record<string, number>;
  ruleCompliance: number;
  trades: Trade[];
}> {
  return trades.reduce((acc, trade) => {
    const date = new Date(trade.entryDate).toISOString().split('T')[0];

    if (!acc[date]) {
      acc[date] = {
        date,
        pnl: 0,
        cumulativePnl: 0,
        completions: 0,
        violations: 0,
        winRate: 0,
        riskReward: 0,
        volume: 0,
        emotions: {},
        ruleCompliance: 0,
        trades: []
      };
    }

    acc[date].pnl += trade.profitLoss || 0;
    acc[date].volume += trade.quantity;
    acc[date].trades.push(trade);

    // Track rule compliance
    if (trade.ruleCompliant) {
      acc[date].completions++;
    } else {
      acc[date].violations++;
    }

    // Track emotions
    if (trade.emotions) {
      trade.emotions.forEach(emotion => {
        acc[date].emotions[emotion] = (acc[date].emotions[emotion] || 0) + 1;
      });
    }

    return acc;
  }, {} as Record<string, any>);
}

/**
 * Calculate trading streaks
 */
function calculateStreaks(trades: Trade[]): {
  currentStreak: number;
  longestStreak: number;
  currentLosingStreak: number;
  longestLosingStreak: number;
} {
  if (trades.length === 0) {
    return { currentStreak: 0, longestStreak: 0, currentLosingStreak: 0, longestLosingStreak: 0 };
  }

  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) =>
    new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let currentLosingStreak = 0;
  let longestLosingStreak = 0;
  let tempStreak = 0;
  let tempLosingStreak = 0;

  for (const trade of sortedTrades) {
    const isWin = (trade.profitLoss || 0) > 0;

    if (isWin) {
      tempStreak++;
      currentLosingStreak = 0;
      tempLosingStreak = 0;
      currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempLosingStreak++;
      currentStreak = 0;
      tempStreak = 0;
      currentLosingStreak = tempLosingStreak;
      longestLosingStreak = Math.max(longestLosingStreak, tempLosingStreak);
    }
  }

  return {
    currentStreak,
    longestStreak,
    currentLosingStreak,
    longestLosingStreak
  };
}

/**
 * Filter trades by period
 */
function filterTradesByPeriod(trades: Trade[], period: ReportPeriod, referenceDate: Date): Trade[] {
  const cutoffDate = getPeriodCutoffDate(period, referenceDate);

  return trades.filter(trade =>
    new Date(trade.entryDate) >= cutoffDate && new Date(trade.entryDate) <= referenceDate
  );
}

/**
 * Get cutoff date for period
 */
function getPeriodCutoffDate(period: ReportPeriod, referenceDate: Date): Date {
  const date = new Date(referenceDate);

  switch (period) {
    case 'weekly':
      date.setDate(date.getDate() - 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }

  return date;
}

/**
 * Get previous period date
 */
function getPreviousPeriodDate(period: ReportPeriod, referenceDate: Date): Date {
  const date = new Date(referenceDate);

  switch (period) {
    case 'weekly':
      date.setDate(date.getDate() - 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }

  return date;
}

/**
 * Calculate metric changes between periods
 */
function calculateMetricChanges(
  current: AnalyticsMetrics,
  previous: AnalyticsMetrics
): Record<keyof AnalyticsMetrics, {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
}> {
  const changes: Record<string, any> = {};

  Object.keys(current).forEach(key => {
    const currentValue = current[key as keyof AnalyticsMetrics] as number;
    const previousValue = previous[key as keyof AnalyticsMetrics] as number;

    if (typeof currentValue === 'number' && typeof previousValue === 'number' && previousValue !== 0) {
      const difference = currentValue - previousValue;
      const percentage = (difference / Math.abs(previousValue)) * 100;

      changes[key] = {
        value: difference,
        percentage,
        direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral'
      };
    } else {
      changes[key] = {
        value: 0,
        percentage: 0,
        direction: 'neutral' as const
      };
    }
  });

  return changes;
}
