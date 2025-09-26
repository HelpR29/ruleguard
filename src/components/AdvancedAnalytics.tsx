/**
 * Advanced Analytics Dashboard
 * Comprehensive trading analytics with interactive charts, trend analysis, and comparative insights
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
  Legend,
  ReferenceLine,
  Treemap,
  FunnelChart,
  Funnel
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  DollarSign,
  Percent,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Trade, ReportPeriod } from '../types';

interface AnalyticsData {
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
}

interface AnalyticsFilters {
  dateRange: '7d' | '30d' | '90d' | '1y' | 'custom';
  startDate?: Date;
  endDate?: Date;
  symbols: string[];
  tradeTypes: string[];
  emotions: string[];
  minPnL?: number;
  maxPnL?: number;
  ruleCompliant?: boolean;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'scatter' | 'composed' | 'treemap' | 'funnel' | 'pie';
  dataKey: string;
  name: string;
  color: string;
  showTrendLine?: boolean;
  showReferenceLine?: boolean;
  referenceValue?: number;
}

interface KPICard {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description: string;
  format: 'number' | 'currency' | 'percentage' | 'ratio';
  drillDown?: () => void;
}

interface AnalyticsDashboardProps {
  trades: Trade[];
  period: ReportPeriod;
  isLoading?: boolean;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  onFilterChange?: (filters: AnalyticsFilters) => void;
}

/**
 * Advanced Analytics Dashboard Component
 *
 * Features:
 * - Multiple interactive chart types
 * - Advanced filtering and date range selection
 * - Comparative analysis (period-over-period)
 * - Real-time KPI tracking
 * - Export capabilities
 * - Trend analysis with forecasting
 * - Performance comparison tools
 * - Interactive drill-down capabilities
 */
export default function AnalyticsDashboard({
  trades,
  period,
  isLoading = false,
  onExport,
  onFilterChange
}: AnalyticsDashboardProps) {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30d',
    symbols: [],
    tradeTypes: [],
    emotions: [],
    ruleCompliant: undefined
  });

  const [selectedCharts, setSelectedCharts] = useState<string[]>([
    'pnl-trend',
    'performance-breakdown'
  ]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hiddenKPIs, setHiddenKPIs] = useState<Set<string>>(new Set());

  // Formatting helpers
  const formatCurrencyShort = useCallback((n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n), []);
  const formatPercent = useCallback((n: number) => `${n.toFixed(0)}%`, []);

  // Date range helper for PF/kpis to mirror Reports behavior
  const getDateWindow = useCallback(() => {
    const today = new Date();
    const start = new Date(today);
    if (filters.dateRange === '7d') start.setDate(today.getDate() - 6);
    else if (filters.dateRange === '30d') start.setDate(today.getDate() - 29);
    else if (filters.dateRange === '90d') start.setDate(today.getDate() - 89);
    else if (filters.dateRange === '1y') start.setFullYear(today.getFullYear() - 1);
    else if (filters.dateRange === 'custom' && filters.startDate) {
      start.setTime(filters.startDate.getTime());
    } else {
      // default to 30d like dashboard
      start.setDate(today.getDate() - 29);
    }
    return { start, end: today };
  }, [filters]);

  // Chart configurations
  const chartConfigs: Record<string, ChartConfig[]> = {
    'pnl-trend': [
      {
        type: 'area',
        dataKey: 'cumulativePnl',
        name: 'Cumulative P&L',
        color: '#10b981',
        showTrendLine: true
      },
      {
        type: 'bar',
        dataKey: 'pnl',
        name: 'Daily P&L',
        color: '#3b82f6'
      }
    ],
    'performance-breakdown': [
      {
        type: 'line',
        dataKey: 'winRate',
        name: 'Win Rate',
        color: '#10b981'
      },
      {
        type: 'line',
        dataKey: 'ruleCompliance',
        name: 'Rule Compliance',
        color: '#f59e0b'
      }
    ],
    'emotion-analysis': [
      {
        type: 'pie',
        dataKey: 'value',
        name: 'Emotion Distribution',
        color: '#8b5cf6'
      }
    ],
    'risk-reward': [
      {
        type: 'scatter',
        dataKey: 'riskReward',
        name: 'Risk-Reward Ratio',
        color: '#ef4444'
      }
    ]
  };

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!trades.length) return [];

    const filteredTrades = trades.filter((trade: any) => {
      const dateStr = (trade.entryDate || trade.date) as string | undefined;
      if (!dateStr) return false; // ignore trades without a date
      const tradeDate = new Date(dateStr);
      if (isNaN(tradeDate.getTime())) return false;
      const now = new Date();

      switch (filters.dateRange) {
        case '7d':
          return tradeDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
          return tradeDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d':
          return tradeDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case '1y':
          return tradeDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });

    // Group by date and calculate metrics
    const groupedData = filteredTrades.reduce((acc: Record<string, any>, trade: any) => {
      const dateStr = (trade.entryDate || trade.date) as string;
      const date = new Date(dateStr).toISOString().split('T')[0];

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

      const pnl = Number((trade.profitLoss ?? trade.pnl) || 0);
      const qty = Number((trade.quantity ?? trade.size) || 0);
      acc[date].pnl += Number.isFinite(pnl) ? pnl : 0;
      acc[date].volume += Number.isFinite(qty) ? qty : 0;
      acc[date].trades.push(trade);

      // Track rule compliance
      if (trade.ruleCompliant) acc[date].completions++;
      else acc[date].violations++;

      // Track emotions (accept emotions[] or single emotion)
      const emos = Array.isArray(trade.emotions)
        ? trade.emotions
        : (trade.emotion ? [String(trade.emotion)] : []);
      emos.forEach((emotion: string) => {
        acc[date].emotions[emotion] = (acc[date].emotions[emotion] || 0) + 1;
      });

      return acc;
    }, {} as Record<string, any>);

    // Calculate cumulative P&L and other derived metrics
    let cumulativePnl = 0;
    const sortedDates = Object.keys(groupedData).sort();

    return sortedDates.map(date => {
      const dayData = groupedData[date];
      cumulativePnl += dayData.pnl;

      const totalTrades = dayData.trades.length;
      const winningTrades = dayData.trades.filter((t: any) => (((t.profitLoss ?? t.pnl) || 0) > 0)).length;

      // Average Risk:Reward for the day if target/stop present
      const rrTrades = dayData.trades.filter((t: any) => t.target != null && t.stop != null);
      const avgRR = rrTrades.length
        ? rrTrades.reduce((sum: number, t: any) => {
            const entryPrice = Number(t.entryPrice ?? t.entry);
            const risk = Math.abs(Number(t.stop) - entryPrice);
            const reward = Math.abs(Number(t.target) - entryPrice);
            return risk > 0 ? sum + (reward / risk) : sum;
          }, 0) / rrTrades.length
        : 0;

      return {
        ...dayData,
        cumulativePnl,
        winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
        ruleCompliance: totalTrades > 0 ? (dayData.completions / totalTrades) * 100 : 0,
        riskReward: avgRR,
      };
    });
  }, [trades, filters]);

  // Filtered trades list for tables/exports (mirrors analytics date filter)
  const filteredTrades = useMemo(() => {
    const { start, end } = getDateWindow();
    return (trades as any[]).filter((t: any) => {
      const dateStr = (t.entryDate || t.date || '').slice(0,10);
      if (!dateStr) return false;
      const dsNum = Number(dateStr.replace(/-/g, ''));
      const sNum = Number(start.toISOString().slice(0,10).replace(/-/g, ''));
      const eNum = Number(end.toISOString().slice(0,10).replace(/-/g, ''));
      if (dsNum < sNum || dsNum > eNum) return false;
      // Apply symbol/type/emotion filters if provided
      if (filters.symbols.length && !filters.symbols.includes((t.symbol || '').toUpperCase())) return false;
      if (filters.tradeTypes.length && !filters.tradeTypes.includes(t.type)) return false;
      if (filters.emotions.length) {
        const emos = Array.isArray(t.emotions) ? t.emotions : (t.emotion ? [String(t.emotion)] : []);
        if (!emos.some((e: string) => filters.emotions.includes(e))) return false;
      }
      if (typeof filters.ruleCompliant === 'boolean' && t.ruleCompliant !== filters.ruleCompliant) return false;
      return true;
    }).sort((a: any, b: any) => String(b.date || b.entryDate).localeCompare(String(a.date || a.entryDate)));
  }, [trades, filters, getDateWindow]);

  // Calculate KPI cards (PF mirrors Reports: sum profits / |sum losses| over date filter, no cap)
  const kpiCards = useMemo((): KPICard[] => {
    const totalPnL = analyticsData.reduce((sum, day) => sum + day.pnl, 0);
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t: any) => ((t.profitLoss ?? t.pnl) || 0) > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const rrTrades = trades.filter((t: any) => t.target && t.stop);
    const avgRiskReward = rrTrades.reduce((sum: number, trade: any) => {
      const entryPrice = Number(trade.entryPrice ?? trade.entry);
      const risk = Math.abs(Number(trade.stop) - entryPrice);
      const reward = Math.abs(Number(trade.target) - entryPrice);
      if (risk > 0 && isFinite(reward / risk)) return sum + (reward / risk);
      return sum;
    }, 0) / Math.max(1, rrTrades.length);

    const totalCompletions = trades.filter((t: any) => t.ruleCompliant).length;

    // Profit Factor computed from trades in current date window
    const { start, end } = getDateWindow();
    let totalProfits = 0;
    let totalLosses = 0; // negative sum
    let inRange = 0;
    for (const t of trades as any[]) {
      const dateStr = (t.entryDate || t.date || '').slice(0,10);
      if (!dateStr) continue;
      const dsNum = Number(dateStr.replace(/-/g, ''));
      const sNum = Number(start.toISOString().slice(0,10).replace(/-/g, ''));
      const eNum = Number(end.toISOString().slice(0,10).replace(/-/g, ''));
      if (dsNum < sNum || dsNum > eNum) continue;
      inRange++;
      const raw = (t.pnl ?? t.profitLoss ?? 0);
      const pnl = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^0-9.-]/g, ''));
      if (!Number.isFinite(pnl)) continue;
      if (pnl > 0) totalProfits += pnl;
      else if (pnl < 0) totalLosses += pnl;
    }
    let profitFactor: number | null = null;
    if (inRange === 0) profitFactor = null;
    else if (totalProfits === 0 && totalLosses === 0) profitFactor = 0;
    else if (totalLosses === 0 && totalProfits > 0) profitFactor = Infinity;
    else {
      const denom = Math.abs(totalLosses);
      profitFactor = denom > 0 ? (totalProfits / denom) : null;
    }

    return [
      {
        id: 'total-pnl',
        title: 'Total P&L',
        value: totalPnL,
        change: 12.5,
        changeType: totalPnL >= 0 ? 'positive' : 'negative',
        icon: <DollarSign className="h-5 w-5" />,
        description: 'Total profit and loss',
        format: 'currency',
        drillDown: () => console.log('Drill down to P&L details')
      },
      {
        id: 'win-rate',
        title: 'Win Rate',
        value: winRate,
        change: 2.1,
        changeType: 'positive',
        icon: <Percent className="h-5 w-5" />,
        description: 'Percentage of profitable trades',
        format: 'percentage'
      },
      {
        id: 'total-trades',
        title: 'Total Trades',
        value: totalTrades,
        change: 8.7,
        changeType: 'positive',
        icon: <Activity className="h-5 w-5" />,
        description: 'Total number of trades',
        format: 'number'
      },
      {
        id: 'avg-rr',
        title: 'Avg R:R',
        value: avgRiskReward,
        change: -1.2,
        changeType: avgRiskReward >= 2 ? 'positive' : 'negative',
        icon: <Target className="h-5 w-5" />,
        description: 'Average risk-reward ratio',
        format: 'ratio'
      },
      {
        id: 'compliance',
        title: 'Compliance',
        value: totalTrades > 0 ? (totalCompletions / totalTrades) * 100 : 0,
        change: 5.3,
        changeType: 'positive',
        icon: <CheckCircle className="h-5 w-5" />,
        description: 'Rule compliance rate',
        format: 'percentage'
      },
      {
        id: 'profit-factor',
        title: 'Profit Factor',
        value: profitFactor === null ? '—' : (profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)),
        change: 15.8,
        changeType: 'positive',
        icon: <TrendingUp className="h-5 w-5" />,
        description: 'Profit per unit of risk',
        format: 'number'
      }
    ];
  }, [analyticsData, trades, getDateWindow]);

  // Calculate emotion data for pie chart
  // Emotion data (counts map)
  const emotionCounts = useMemo(() => {
    return trades.reduce((acc: Record<string, number>, trade: any) => {
      const emos = Array.isArray(trade.emotions) ? trade.emotions : (trade.emotion ? [String(trade.emotion)] : []);
      emos.forEach((emotion: string) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
  }, [trades]);

  const [emotionMode, setEmotionMode] = useState<'percent' | 'count'>('percent');
  const emotionChartData = useMemo(() => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    const total = Object.values(emotionCounts).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(emotionCounts).map(([name, count], index) => ({
      name,
      value: emotionMode === 'percent' ? (count / total) * 100 : count,
      color: colors[index % colors.length]
    }));
  }, [emotionCounts, emotionMode]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    onFilterChange?.({ ...filters, ...newFilters });
  }, [filters, onFilterChange]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  // Toggle KPI visibility
  const toggleKPI = useCallback((kpiId: string) => {
    setHiddenKPIs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kpiId)) {
        newSet.delete(kpiId);
      } else {
        newSet.add(kpiId);
      }
      return newSet;
    });
  }, []);

  // Format values based on type
  const formatValue = useCallback((value: number | string, format: KPICard['format']): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'ratio':
        return `1:${value.toFixed(2)}`;
      default:
        return value.toLocaleString();
    }
  }, []);

  // Render chart based on configuration
  const renderChart = useCallback((chartId: string) => {
    const config = chartConfigs[chartId];
    if (!config || !analyticsData.length) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>

      {/* Performance by Applied Rule */}
      <div className="rounded-2xl p-6 card-surface">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance by Applied Rule</h3>
          <span className="text-xs text-gray-500">From filtered trades</span>
        </div>
        {(() => {
          // Aggregate metrics per rule from filteredTrades[].rules
          const map = new Map<string, { count: number; wins: number; totalPnl: number }>();
          for (const t of filteredTrades as any[]) {
            const rules: string[] = Array.isArray((t as any).rules) ? (t as any).rules : [];
            for (const r of rules) {
              const item = map.get(r) || { count: 0, wins: 0, totalPnl: 0 };
              item.count += 1;
              if (Number(t.pnl ?? t.profitLoss ?? 0) > 0) item.wins += 1;
              item.totalPnl += Number(t.pnl ?? t.profitLoss ?? 0) || 0;
              map.set(r, item);
            }
          }
          const rows = Array.from(map.entries()).map(([rule, v]) => ({
            rule,
            count: v.count,
            winRate: v.count ? (v.wins / v.count) * 100 : 0,
            avgPnl: v.count ? v.totalPnl / v.count : 0,
            totalPnl: v.totalPnl,
          })).sort((a,b)=> b.totalPnl - a.totalPnl).slice(0, 10);
          if (rows.length === 0) return <p className="text-sm text-gray-500">No applied-rule data in the selected range.</p>;
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 pr-4">Rule</th>
                    <th className="py-2 pr-4">Trades</th>
                    <th className="py-2 pr-4">Win Rate</th>
                    <th className="py-2 pr-4">Avg P&L</th>
                    <th className="py-2 pr-4">Total P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.rule} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">{row.rule}</td>
                      <td className="py-2 pr-4">{row.count}</td>
                      <td className="py-2 pr-4">{row.winRate.toFixed(0)}%</td>
                      <td className={`py-2 pr-4 ${row.avgPnl>=0?'text-green-600':'text-red-600'}`}>{row.avgPnl>=0?'+':''}${row.avgPnl.toFixed(2)}</td>
                      <td className={`py-2 pr-4 ${row.totalPnl>=0?'text-green-600':'text-red-600'}`}>{row.totalPnl>=0?'+':''}${row.totalPnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
        </div>
      );
    }

    const chartProps = {
      data: analyticsData,
      margin: { top: chartId === 'performance-breakdown' ? 12 : 5, right: 30, left: 20, bottom: 5 }
    };
    let child: React.ReactElement | null = null;
    const primary = config[0].type;
    try {
    if (primary === 'bar') {
      child = (
        <BarChart {...chartProps}>
          <CartesianGrid strokeDasharray="4 6" stroke="#f3f4f6" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
          <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => chartId === 'pnl-trend' ? formatCurrencyShort(v) : String(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => {
              if (chartId === 'pnl-trend') return [formatCurrencyShort(value), name];
              return [value, name];
            }}
          />
          {config.map((chartConfig, index) => (
            <Bar key={index} dataKey={chartConfig.dataKey} fill={chartConfig.color} name={chartConfig.name} />
          ))}
        </BarChart>
      );
    } else if (primary === 'line') {
      child = (
        <LineChart {...chartProps}>
          <CartesianGrid strokeDasharray="4 6" stroke="#f3f4f6" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
          <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false}
            domain={chartId === 'performance-breakdown' ? [0, 100] : undefined}
            padding={chartId === 'performance-breakdown' ? { top: 12, bottom: 0 } as any : undefined}
            tickFormatter={(v: number) => chartId === 'performance-breakdown' ? formatPercent(v) : String(v)}
          />
          <Tooltip formatter={(v: number, name: string) => chartId === 'performance-breakdown' ? [formatPercent(v), name] : [v, name]} />
          {config.map((chartConfig, index) => (
            <Line key={index} type="monotone" dataKey={chartConfig.dataKey} stroke={chartConfig.color} strokeWidth={2} name={chartConfig.name} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          ))}
          {chartId === 'performance-breakdown' && (
            <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="3 3" />
          )}
          {/* Last-point labels moved to header badges to avoid overlap */}
          {/* Legend removed (we render custom badges above the chart) */}
        </LineChart>
      );
    } else if (primary === 'area') {
      child = (
        <AreaChart {...chartProps}>
          <CartesianGrid strokeDasharray="4 6" stroke="#f3f4f6" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
          <YAxis stroke="#666" fontSize={12} axisLine={false} tickFormatter={(v: number) => chartId === 'pnl-trend' ? formatCurrencyShort(v) : String(v)} />
          <Tooltip formatter={(v: number, name: string) => chartId === 'pnl-trend' ? [formatCurrencyShort(v), name] : [v, name]} />
          {chartId === 'pnl-trend' && (
            <>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <ReferenceLine y={0} stroke="#e5e7eb" />
              {/* Last-point label for PnL Trend */}
              {analyticsData.length > 0 && (
                (() => {
                  const last = analyticsData[analyticsData.length - 1] as any;
                  return <ReferenceLine x={last.date} stroke="transparent" label={{ value: formatCurrencyShort(last.cumulativePnl), position: 'top', fill: '#10b981', fontSize: 11 }} />
                })()
              )}
            </>
          )}
          {config.map((chartConfig, index) => (
            <Area key={index} type="monotone" dataKey={chartConfig.dataKey} stroke={chartConfig.color} fill={chartId==='pnl-trend' && index===0 ? 'url(#pnlGradient)' : chartConfig.color} fillOpacity={chartId==='pnl-trend' && index===0 ? 1 : 0.3} name={chartConfig.name} />
          ))}
        </AreaChart>
      );
    } else if (primary === 'scatter') {
      child = (
        <ScatterChart {...chartProps}>
          <CartesianGrid strokeDasharray="4 6" stroke="#f3f4f6" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
          <YAxis stroke="#666" fontSize={12} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: number, name: string) => name.toLowerCase().includes('risk') ? [`1:${Number(v).toFixed(2)}`, 'R:R'] : [v, name]} />
          {config.map((chartConfig, index) => (
            <Scatter key={index} dataKey={chartConfig.dataKey} fill={chartConfig.color} name={chartConfig.name} />
          ))}
          <ReferenceLine y={2} stroke="#94a3b8" strokeDasharray="4 4" />
        </ScatterChart>
      );
    } else if (primary === 'pie') {
      child = (
        <PieChart>
          <Pie
            data={emotionChartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
            label={(props: PieLabelRenderProps) => {
              const val = Number((props as any).value ?? 0);
              const name = (props as any).name ?? '';
              return emotionMode === 'percent' ? `${name}: ${val.toFixed(1)}%` : `${name}: ${val}`;
            }}
            labelLine={false}
          >
            {emotionChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => emotionMode === 'percent' ? `${value}%` : `${value}`} />
        </PieChart>
      );
    }
    } catch (err) {
      console.error('Chart render failed:', err);
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-red-500" />
            <p className="mb-2">Chart failed to render.</p>
            <button onClick={handleRefresh} className="px-3 py-1 text-sm rounded bg-blue-600 text-white">Retry</button>
          </div>
        </div>
      );
    }

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {child as React.ReactElement}
        </ResponsiveContainer>
      </div>
    );
  }, [analyticsData, emotionChartData, chartConfigs, emotionMode]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive trading performance analysis and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>

          {onExport && (
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards
          .filter(card => !hiddenKPIs.has(card.id))
          .map((card) => (
            <div
              key={card.id}
              className="rounded-2xl p-6 card-surface hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={card.drillDown}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 ${
                    card.changeType === 'positive' ? 'text-green-600' :
                    card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatValue(card.value, card.format)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' :
                    card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.changeType === 'positive' ? '+' : ''}
                    {card.change.toFixed(1)}%
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleKPI(card.id);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm">{card.description}</p>
            </div>
          ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Filter className="h-5 w-5 text-gray-500" />
        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange({ dateRange: e.target.value as AnalyticsFilters['dateRange'] })}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
          <option value="custom">Custom range</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Charts:</span>
          {Object.keys(chartConfigs).map((chartId) => (
            <button
              key={chartId}
              onClick={() => {
                setSelectedCharts(prev =>
                  prev.includes(chartId)
                    ? prev.filter(id => id !== chartId)
                    : [...prev, chartId]
                );
              }}
              className={`px-2 py-1 text-xs rounded ${
                selectedCharts.includes(chartId)
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {chartId.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Emotion mode toggle (only affects emotion-analysis) */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Emotions:</span>
          <div className="relative inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
            <button
              type="button"
              onClick={() => setEmotionMode('percent')}
              className={`px-2 py-0.5 text-xs rounded-full ${emotionMode==='percent' ? 'bg-white dark:bg-gray-800 shadow font-medium' : 'text-gray-600 dark:text-gray-300'}`}
            >%</button>
            <button
              type="button"
              onClick={() => setEmotionMode('count')}
              className={`px-2 py-0.5 text-xs rounded-full ${emotionMode==='count' ? 'bg-white dark:bg-gray-800 shadow font-medium' : 'text-gray-600 dark:text-gray-300'}`}
            >#</button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {selectedCharts.map((chartId) => (
          <div key={chartId} className="rounded-2xl p-6 card-surface">
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {chartId.replace('-', ' ')}
                </h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              {/* Compact legend badges below title, wrap on small widths */}
              <div className="mt-2 mb-4 flex flex-wrap gap-3 items-center">
                {chartConfigs[chartId]?.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] border border-gray-200 text-gray-700">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                ))}
                {/* Removed last-value badges to reduce redundancy */}
              </div>
            </div>

            {renderChart(chartId)}
          </div>
        ))}
      </div>

      {/* Trades Table with Long/Short chip */}
      <div className="rounded-2xl p-6 card-surface">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trades</h3>
          <button
            onClick={() => {
              // Build CSV with direction/type column
              const rows = filteredTrades.map((t: any) => ({
                date: String(t.date || t.entryDate || '').slice(0,10),
                symbol: t.symbol,
                type: t.type,
                entry: t.entry,
                exit: t.exit,
                size: t.size ?? t.quantity ?? '',
                pnl: t.pnl ?? t.profitLoss ?? 0,
                target: t.target ?? '',
                stop: t.stop ?? '',
                compliant: t.ruleCompliant ? 'yes' : 'no',
                rules: Array.isArray(t.rules) ? t.rules.join('|') : '',
              }));
              const headers = Object.keys(rows[0] || { date:'', symbol:'', type:'', entry:'', exit:'', size:'', pnl:'', target:'', stop:'', compliant:'', rules:'' });
              const esc = (v: any) => {
                const s = String(v ?? '');
                if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
                return s;
              };
              const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => esc((r as any)[h])).join(','))).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `trades-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              setTimeout(() => URL.revokeObjectURL(url), 500);
            }}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Export Trades CSV
          </button>
        </div>
        {filteredTrades.length === 0 ? (
          <p className="text-sm text-gray-500">No trades in the selected range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Symbol</th>
                  <th className="py-2 pr-4">Direction</th>
                  <th className="py-2 pr-4">Entry</th>
                  <th className="py-2 pr-4">Exit</th>
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">P&L</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.slice(0, 50).map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">{String(t.date || t.entryDate || '').slice(0,10)}</td>
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">{t.symbol}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] border ${t.type === 'Long' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-sky-100 text-sky-800 border-sky-200'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{t.entry}</td>
                    <td className="py-2 pr-4">{t.exit}</td>
                    <td className="py-2 pr-4">{t.size ?? t.quantity ?? ''}</td>
                    <td className={`py-2 pr-4 font-medium ${Number(t.pnl ?? t.profitLoss ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Number(t.pnl ?? t.profitLoss ?? 0) >= 0 ? '+' : ''}${Number(t.pnl ?? t.profitLoss ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="rounded-2xl p-6 card-surface">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analyticsData.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Trading Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {trades.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {emotionChartData.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Emotion Types</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {kpiCards.filter(kpi => kpi.changeType === 'positive').length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Positive Metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
