import React from 'react';
import { Award, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  className?: string;
}

export const MetricsCard = React.memo(({
  title,
  value,
  subtitle,
  icon,
  color,
  className = ''
}: MetricsCardProps) => {
  return (
    <div className={`rounded-2xl p-6 card-surface ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`h-8 w-8 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className={`text-sm ${color}`}>{subtitle}</p>
    </div>
  );
});

MetricsCard.displayName = 'MetricsCard';

interface ReportMetricsProps {
  weeklyCompletions: number;
  weeklyViolations: number;
  weeklyWinRate: number;
  averageRR: number;
  weeklyProfitFactor: number | null;
  totalPnl: number;
}

export const ReportMetrics = React.memo(({
  weeklyCompletions,
  weeklyViolations,
  weeklyWinRate,
  averageRR,
  weeklyProfitFactor,
  totalPnl
}: ReportMetricsProps) => {
  const avatar = React.useMemo(() => {
    try {
      return localStorage.getItem('user_avatar') || '👤';
    } catch {
      return '👤';
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      <MetricsCard
        title="Completions"
        value={weeklyCompletions}
        subtitle="Weekly total"
        icon={<Award className="h-8 w-8 text-green-500" />}
        color="text-green-600"
      />

      <MetricsCard
        title="Win Rate"
        value={`${weeklyWinRate}%`}
        subtitle="Based on journal trades"
        icon={<TrendingUp className="h-8 w-8 text-blue-500" />}
        color="text-blue-600"
      />

      <MetricsCard
        title="Violations"
        value={weeklyViolations}
        subtitle="Weekly total"
        icon={<TrendingDown className="h-8 w-8 text-red-500" />}
        color="text-red-600"
      />

      <MetricsCard
        title="Average R:R"
        value={averageRR > 0 ? `1:${averageRR.toFixed(2)}` : '—'}
        subtitle="Based on journal Target/Stop"
        icon={<TrendingUp className="h-8 w-8 text-emerald-500" />}
        color="text-emerald-600"
      />

      <MetricsCard
        title="Profit factor"
        value={weeklyProfitFactor === null ? '—' : (weeklyProfitFactor === Infinity ? '∞' : weeklyProfitFactor.toFixed(2))}
        subtitle="Last 7 days"
        icon={<Info className="h-8 w-8 text-gray-500" />}
        color="text-gray-600"
      />
    </div>
  );
});

ReportMetrics.displayName = 'ReportMetrics';
