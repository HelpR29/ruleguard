import React, { useState, useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, BarChart3, Target, Clock } from 'lucide-react';

interface Trade {
  id: number;
  date: string;
  symbol: string;
  type: 'Long' | 'Short' | string;
  entry: number;
  exit: number;
  target?: number | null;
  stop?: number | null;
  size: number;
  pnl: number;
  emotion: string;
  notes: string;
  tags?: string | string[] | undefined;
  ruleCompliant: boolean;
}

interface AIInsightsProps {
  trades: Trade[];
  period: 'weekly' | 'monthly';
}

interface Insight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  icon: React.ReactNode;
  metric?: string;
  recommendation?: string;
}

export default function AIInsights({ trades, period }: AIInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const periodTrades = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (period === 'weekly') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    return trades.filter(trade => new Date(trade.date) >= cutoffDate);
  }, [trades, period]);

  const insights = useMemo((): Insight[] => {
    if (periodTrades.length === 0) {
      return [{
        type: 'neutral',
        title: 'No Trading Activity',
        description: `No trades found in the last ${period === 'weekly' ? 'week' : 'month'}.`,
        icon: <Calendar className="h-5 w-5" />,
        recommendation: 'Consider reviewing your trading plan and market opportunities.'
      }];
    }

    const insights: Insight[] = [];

    // Performance Analysis
    const totalPnL = periodTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = periodTrades.filter(trade => trade.pnl > 0);
    const losingTrades = periodTrades.filter(trade => trade.pnl < 0);
    const winRate = (winningTrades.length / periodTrades.length) * 100;

    // Win Rate Analysis
    if (winRate >= 70) {
      insights.push({
        type: 'positive',
        title: 'Excellent Win Rate',
        description: `Your win rate of ${winRate.toFixed(1)}% is exceptional. You're consistently picking winning trades.`,
        icon: <CheckCircle className="h-5 w-5" />,
        metric: `${winRate.toFixed(1)}%`,
        recommendation: 'Maintain your current strategy and consider increasing position sizes gradually.'
      });
    } else if (winRate >= 50) {
      insights.push({
        type: 'positive',
        title: 'Solid Win Rate',
        description: `Your ${winRate.toFixed(1)}% win rate shows good trade selection skills.`,
        icon: <TrendingUp className="h-5 w-5" />,
        metric: `${winRate.toFixed(1)}%`,
        recommendation: 'Focus on improving risk management to maximize profits from winning trades.'
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Low Win Rate',
        description: `Your win rate of ${winRate.toFixed(1)}% needs improvement. Consider reviewing your entry criteria.`,
        icon: <AlertTriangle className="h-5 w-5" />,
        metric: `${winRate.toFixed(1)}%`,
        recommendation: 'Analyze your losing trades for common patterns and tighten your entry rules.'
      });
    }

    // PnL Analysis
    if (totalPnL > 0) {
      insights.push({
        type: 'positive',
        title: 'Profitable Period',
        description: `You generated $${totalPnL.toFixed(2)} in profits this ${period}.`,
        icon: <TrendingUp className="h-5 w-5" />,
        metric: `+$${totalPnL.toFixed(2)}`,
        recommendation: 'Great work! Document what strategies worked best for future reference.'
      });
    } else if (totalPnL < 0) {
      insights.push({
        type: 'negative',
        title: 'Losses This Period',
        description: `You had a net loss of $${Math.abs(totalPnL).toFixed(2)} this ${period}.`,
        icon: <TrendingDown className="h-5 w-5" />,
        metric: `-$${Math.abs(totalPnL).toFixed(2)}`,
        recommendation: 'Review your risk management and consider reducing position sizes until you find your edge again.'
      });
    }

    // Risk-Reward Analysis
    const tradesWithRR = periodTrades.filter(trade => trade.target && trade.stop && trade.entry);
    if (tradesWithRR.length > 0) {
      const avgRR = tradesWithRR.reduce((sum, trade) => {
        const risk = trade.type === 'Long' ? trade.entry - trade.stop! : trade.stop! - trade.entry;
        const reward = trade.type === 'Long' ? trade.target! - trade.entry : trade.entry - trade.target!;
        return sum + (reward / risk);
      }, 0) / tradesWithRR.length;

      if (avgRR >= 2) {
        insights.push({
          type: 'positive',
          title: 'Excellent Risk-Reward',
          description: `Your average risk-reward ratio of 1:${avgRR.toFixed(2)} is excellent.`,
          icon: <Target className="h-5 w-5" />,
          metric: `1:${avgRR.toFixed(2)}`,
          recommendation: 'Maintain this disciplined approach to risk management.'
        });
      } else if (avgRR >= 1.5) {
        insights.push({
          type: 'positive',
          title: 'Good Risk-Reward',
          description: `Your risk-reward ratio of 1:${avgRR.toFixed(2)} is solid.`,
          icon: <Target className="h-5 w-5" />,
          metric: `1:${avgRR.toFixed(2)}`,
          recommendation: 'Try to find setups with even better risk-reward ratios when possible.'
        });
      } else {
        insights.push({
          type: 'warning',
          title: 'Poor Risk-Reward',
          description: `Your risk-reward ratio of 1:${avgRR.toFixed(2)} is too low for consistent profitability.`,
          icon: <AlertTriangle className="h-5 w-5" />,
          metric: `1:${avgRR.toFixed(2)}`,
          recommendation: 'Look for trades with at least 1:2 risk-reward ratio or improve your exit strategy.'
        });
      }
    }

    // Rule Compliance Analysis
    const compliantTrades = periodTrades.filter(trade => trade.ruleCompliant);
    const complianceRate = (compliantTrades.length / periodTrades.length) * 100;
    
    if (complianceRate >= 90) {
      insights.push({
        type: 'positive',
        title: 'Excellent Discipline',
        description: `${complianceRate.toFixed(1)}% rule compliance shows strong trading discipline.`,
        icon: <CheckCircle className="h-5 w-5" />,
        metric: `${complianceRate.toFixed(1)}%`,
        recommendation: 'Your discipline is paying off. Keep following your rules consistently.'
      });
    } else if (complianceRate >= 70) {
      insights.push({
        type: 'neutral',
        title: 'Good Discipline',
        description: `${complianceRate.toFixed(1)}% rule compliance is decent but has room for improvement.`,
        icon: <BarChart3 className="h-5 w-5" />,
        metric: `${complianceRate.toFixed(1)}%`,
        recommendation: 'Identify what causes rule violations and work on eliminating those triggers.'
      });
    } else {
      insights.push({
        type: 'negative',
        title: 'Poor Discipline',
        description: `Only ${complianceRate.toFixed(1)}% rule compliance indicates discipline issues.`,
        icon: <AlertTriangle className="h-5 w-5" />,
        metric: `${complianceRate.toFixed(1)}%`,
        recommendation: 'Focus on following your trading rules. Consider reducing position sizes until discipline improves.'
      });
    }

    // Emotional Analysis
    const emotions = periodTrades.reduce((acc, trade) => {
      acc[trade.emotion] = (acc[trade.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.entries(emotions).sort(([,a], [,b]) => b - a)[0];
    if (dominantEmotion) {
      const [emotion, count] = dominantEmotion;
      const percentage = (count / periodTrades.length) * 100;
      
      if (emotion === 'Confident' || emotion === 'Calm') {
        insights.push({
          type: 'positive',
          title: 'Positive Emotional State',
          description: `${percentage.toFixed(1)}% of your trades were made with ${emotion.toLowerCase()} emotions.`,
          icon: <Brain className="h-5 w-5" />,
          metric: `${emotion} ${percentage.toFixed(1)}%`,
          recommendation: 'Your emotional control is contributing to your trading success.'
        });
      } else if (emotion === 'Fear' || emotion === 'Greed' || emotion === 'Frustrated') {
        insights.push({
          type: 'warning',
          title: 'Emotional Trading Detected',
          description: `${percentage.toFixed(1)}% of your trades were influenced by ${emotion.toLowerCase()}.`,
          icon: <Brain className="h-5 w-5" />,
          metric: `${emotion} ${percentage.toFixed(1)}%`,
          recommendation: 'Work on emotional control. Consider meditation or taking breaks when feeling emotional.'
        });
      }
    }

    // Trading Frequency Analysis
    const avgTradesPerDay = periodTrades.length / (period === 'weekly' ? 7 : 30);
    if (avgTradesPerDay > 5) {
      insights.push({
        type: 'warning',
        title: 'High Trading Frequency',
        description: `You're averaging ${avgTradesPerDay.toFixed(1)} trades per day, which may indicate overtrading.`,
        icon: <Clock className="h-5 w-5" />,
        metric: `${avgTradesPerDay.toFixed(1)}/day`,
        recommendation: 'Consider being more selective with your trades. Quality over quantity often leads to better results.'
      });
    } else if (avgTradesPerDay < 0.5 && period === 'weekly') {
      insights.push({
        type: 'neutral',
        title: 'Low Trading Activity',
        description: `You're averaging ${avgTradesPerDay.toFixed(1)} trades per day. This could indicate missed opportunities or good selectivity.`,
        icon: <Clock className="h-5 w-5" />,
        metric: `${avgTradesPerDay.toFixed(1)}/day`,
        recommendation: 'Ensure you\'re not missing good setups due to over-analysis or fear.'
      });
    }

    return insights;
  }, [periodTrades, period]);

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'negative': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (type: Insight['type']) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="rounded-2xl p-6 card-surface">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Trading Insights</h3>
          <p className="text-sm text-gray-600">
            {period === 'weekly' ? 'Weekly' : 'Monthly'} analysis of {periodTrades.length} trades
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}>
            <div className="flex items-start gap-3">
              <div className={`${getIconColor(insight.type)} mt-0.5`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  {insight.metric && (
                    <span className={`text-sm font-mono px-2 py-1 rounded ${
                      insight.type === 'positive' ? 'bg-green-100 text-green-800' :
                      insight.type === 'negative' ? 'bg-red-100 text-red-800' :
                      insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mb-2">{insight.description}</p>
                {insight.recommendation && (
                  <p className="text-xs text-gray-600 italic">
                    💡 {insight.recommendation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {periodTrades.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{periodTrades.length}</p>
              <p className="text-xs text-gray-600">Total Trades</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {periodTrades.filter(t => t.pnl > 0).length}
              </p>
              <p className="text-xs text-gray-600">Winners</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {((periodTrades.filter(t => t.pnl > 0).length / periodTrades.length) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600">Win Rate</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${
                periodTrades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${periodTrades.reduce((sum, t) => sum + t.pnl, 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">Net P&L</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
