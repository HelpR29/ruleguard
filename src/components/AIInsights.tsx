import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, BarChart3, Target, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { useAIInsights } from '../hooks/useAI';
import { Trade } from '../types';

interface AIInsightsProps {
  trades: Trade[];
  period: 'weekly' | 'monthly';
  isLoading?: boolean;
  onAnalysisComplete?: (insightsCount: number) => void;
}

/**
 * Enhanced AI Insights Component
 *
 * Features:
 * - Advanced AI-powered analysis with error handling
 * - Performance optimizations with memoization
 * - Real-time insight generation
 * - Comprehensive error states and retry functionality
 * - Accessibility features
 */
export default function AIInsights({ trades, period, isLoading = false, onAnalysisComplete }: AIInsightsProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const {
    insights,
    isGenerating,
    error,
    generateInsights,
    clearInsights
  } = useAIInsights();

  // Auto-generate insights when trades or period changes
  useEffect(() => {
    if (trades.length > 0 && !isLoading) {
      generateInsights(trades, period);
    } else {
      clearInsights();
    }
  }, [trades, period, isLoading, generateInsights, clearInsights]);

  // Notify parent component when analysis completes
  useEffect(() => {
    if (insights.length > 0 && !isGenerating && !error) {
      onAnalysisComplete?.(insights.length);
    }
  }, [insights.length, isGenerating, error, onAnalysisComplete]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await generateInsights(trades, period);
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'negative': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  // Loading state
  if (isLoading || isGenerating) {
    return (
      <div className="rounded-2xl p-6 card-surface">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Trading Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analyzing {trades.length} trades for {period} insights...
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-gray-600 dark:text-gray-400">Generating AI insights...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl p-6 card-surface">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Trading Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Analysis failed for {trades.length} trades
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Analysis Failed
          </h4>

          <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
            {error}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRetrying ? 'Retrying...' : 'Retry Analysis'}
            </button>

            <button
              onClick={clearInsights}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Dismiss
            </button>
          </div>

          {retryCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Retry attempts: {retryCount}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (insights.length === 0) {
    return (
      <div className="rounded-2xl p-6 card-surface">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Trading Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {trades.length === 0
                ? 'No trades available for analysis'
                : `${period} analysis of ${trades.length} trades`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {trades.length === 0
                  ? 'Start trading to get AI insights'
                  : 'No insights available'
                }
              </p>
              {trades.length > 0 && (
                <button
                  onClick={() => generateInsights(trades, period)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Generate Insights
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 card-surface">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Trading Insights</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {period === 'weekly' ? 'Weekly' : 'Monthly'} analysis of {trades.length} trades
          </p>
        </div>
      </div>

      <div className="space-y-4" role="list" aria-label="AI trading insights">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getInsightColor(insight.type)}`}
            role="listitem"
          >
            <div className="flex items-start gap-3">
              <div className={`${getIconColor(insight.type)} mt-0.5 flex-shrink-0`}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                    {insight.title}
                  </h4>
                  {insight.metric && (
                    <span className={`text-sm font-mono px-2 py-1 rounded transition-colors ${getMetricColor(insight.type)}`}>
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 leading-relaxed">
                  {insight.description}
                </p>
                {insight.recommendation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-3 rounded-r-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                      💡 AI Recommendation
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 italic">
                      {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {trades.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
            {period === 'weekly' ? 'Weekly' : 'Monthly'} Summary
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{trades.length}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total Trades</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {trades.filter(t => t.profitLoss > 0).length}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Winners</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {((trades.filter(t => t.profitLoss > 0).length / trades.length) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Win Rate</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${
              trades.reduce((sum, t) => sum + t.profitLoss, 0) >= 0
                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <p className={`text-xl font-bold ${
                trades.reduce((sum, t) => sum + t.profitLoss, 0) >= 0
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                ${Math.abs(trades.reduce((sum, t) => sum + t.profitLoss, 0)).toFixed(0)}
              </p>
              <p className={`text-xs mt-1 ${
                trades.reduce((sum, t) => sum + t.profitLoss, 0) >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                Net {trades.reduce((sum, t) => sum + t.profitLoss, 0) >= 0 ? 'Profit' : 'Loss'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
