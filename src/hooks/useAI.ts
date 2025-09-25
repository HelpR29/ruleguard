/**
 * AI Analysis Hook
 * Provides React hooks for AI-powered trading analysis with error handling and caching
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Trade,
  AIAnalysis,
  PatternRecognitionResult,
  PredictiveSignal
} from '../types';
import { AIAnalysisService, AIModelConfig } from '../services/aiAnalysis';
import { CheckCircle, TrendingUp, TrendingDown, AlertTriangle, Calendar, BarChart3, Target, Brain, Clock } from 'lucide-react';

interface UseAIAnalysisReturn {
  // Analysis results
  tradeAnalysis: AIAnalysis | null;
  patternAnalysis: PatternRecognitionResult | null;
  predictions: PredictiveSignal[];

  // Loading states
  isAnalyzing: boolean;
  isAnalyzingPattern: boolean;
  isPredicting: boolean;

  // Error states
  error: string | null;
  analysisError: string | null;
  patternError: string | null;
  predictionError: string | null;

  // Actions
  analyzeTrade: (trade: Trade) => Promise<void>;
  analyzeTradeHistory: (trades: Trade[]) => Promise<void>;
  predictMarket: (trades: Trade[]) => Promise<void>;
  clearAnalysis: () => void;
  clearErrors: () => void;

  // Configuration
  updateConfig: (config: Partial<AIModelConfig>) => void;
  resetConfig: () => void;
}

interface UseAIInsightsReturn {
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    metric?: string;
    recommendation?: string;
  }>;
  isGenerating: boolean;
  error: string | null;
  generateInsights: (trades: Trade[], period: 'weekly' | 'monthly') => Promise<void>;
  clearInsights: () => void;
}

const defaultConfig: AIModelConfig = {
  confidenceThreshold: 0.7,
  lookbackPeriod: 30,
  minDataPoints: 10,
  enableRealTimeAnalysis: true,
  modelVersion: '1.0.0'
};

/**
 * Hook for comprehensive AI analysis of trading data
 */
export function useAIAnalysis(config?: Partial<AIModelConfig>): UseAIAnalysisReturn {
  const [aiService] = useState(() => new AIAnalysisService(config || defaultConfig));
  const [currentConfig, setCurrentConfig] = useState<AIModelConfig>({
    ...defaultConfig,
    ...config
  });

  // Analysis states
  const [tradeAnalysis, setTradeAnalysis] = useState<AIAnalysis | null>(null);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternRecognitionResult | null>(null);
  const [predictions, setPredictions] = useState<PredictiveSignal[]>([]);

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingPattern, setIsAnalyzingPattern] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [patternError, setPatternError] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AIModelConfig>) => {
    const updatedConfig = { ...currentConfig, ...newConfig };
    setCurrentConfig(updatedConfig);
    // Recreate service with new config
    Object.assign(aiService, new AIAnalysisService(updatedConfig));
  }, [currentConfig, aiService]);

  const resetConfig = useCallback(() => {
    setCurrentConfig(defaultConfig);
    Object.assign(aiService, new AIAnalysisService(defaultConfig));
  }, [aiService]);

  // Analyze single trade
  const analyzeTrade = useCallback(async (trade: Trade) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await aiService.analyzeTrade(trade);
      setTradeAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setAnalysisError(errorMessage);
      setError(errorMessage);
      console.error('Trade analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [aiService]);

  // Analyze trade history for patterns
  const analyzeTradeHistory = useCallback(async (trades: Trade[]) => {
    setIsAnalyzingPattern(true);
    setPatternError(null);

    try {
      const result = await aiService.analyzeTradeHistory(trades);
      setPatternAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pattern analysis failed';
      setPatternError(errorMessage);
      setError(errorMessage);
      console.error('Pattern analysis error:', err);
    } finally {
      setIsAnalyzingPattern(false);
    }
  }, [aiService]);

  // Predict market movements
  const predictMarket = useCallback(async (trades: Trade[]) => {
    setIsPredicting(true);
    setPredictionError(null);

    try {
      const result = await aiService.predictMarketConditions(trades);
      setPredictions(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Market prediction failed';
      setPredictionError(errorMessage);
      setError(errorMessage);
      console.error('Market prediction error:', err);
    } finally {
      setIsPredicting(false);
    }
  }, [aiService]);

  // Clear all analysis data
  const clearAnalysis = useCallback(() => {
    setTradeAnalysis(null);
    setPatternAnalysis(null);
    setPredictions([]);
    setError(null);
    setAnalysisError(null);
    setPatternError(null);
    setPredictionError(null);
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setError(null);
    setAnalysisError(null);
    setPatternError(null);
    setPredictionError(null);
  }, []);

  return {
    // Results
    tradeAnalysis,
    patternAnalysis,
    predictions,

    // Loading states
    isAnalyzing,
    isAnalyzingPattern,
    isPredicting,

    // Errors
    error,
    analysisError,
    patternError,
    predictionError,

    // Actions
    analyzeTrade,
    analyzeTradeHistory,
    predictMarket,
    clearAnalysis,
    clearErrors,

    // Configuration
    updateConfig,
    resetConfig
  };
}

/**
 * Hook for generating AI-powered trading insights
 */
export function useAIInsights(): UseAIInsightsReturn {
  const [insights, setInsights] = useState<Array<{
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    metric?: string;
    recommendation?: string;
  }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = useCallback(async (trades: Trade[], period: 'weekly' | 'monthly') => {
    setIsGenerating(true);
    setError(null);

    try {
      const newInsights: Array<{
        type: 'positive' | 'negative' | 'neutral' | 'warning';
        title: string;
        description: string;
        icon: React.ComponentType<any>;
        metric?: string;
        recommendation?: string;
      }> = [];

      if (trades.length === 0) {
        newInsights.push({
          type: 'neutral',
          title: 'No Trading Activity',
          description: `No trades found in the last ${period === 'weekly' ? 'week' : 'month'}.`,
          icon: Calendar,
          recommendation: 'Consider reviewing your trading plan and market opportunities.'
        });
        setInsights(newInsights);
        return;
      }

      // Performance Analysis
      const totalPnL = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const winningTrades = trades.filter(trade => trade.profitLoss > 0);
      const losingTrades = trades.filter(trade => trade.profitLoss < 0);
      const winRate = (winningTrades.length / trades.length) * 100;

      // Win Rate Analysis
      if (winRate >= 70) {
        newInsights.push({
          type: 'positive',
          title: 'Excellent Win Rate',
          description: `Your win rate of ${winRate.toFixed(1)}% is exceptional. You're consistently picking winning trades.`,
          icon: CheckCircle,
          metric: `${winRate.toFixed(1)}%`,
          recommendation: 'Maintain your current strategy and consider increasing position sizes gradually.'
        });
      } else if (winRate >= 50) {
        newInsights.push({
          type: 'positive',
          title: 'Solid Win Rate',
          description: `Your ${winRate.toFixed(1)}% win rate shows good trade selection skills.`,
          icon: TrendingUp,
          metric: `${winRate.toFixed(1)}%`,
          recommendation: 'Focus on improving risk management to maximize profits from winning trades.'
        });
      } else {
        newInsights.push({
          type: 'warning',
          title: 'Low Win Rate',
          description: `Your win rate of ${winRate.toFixed(1)}% needs improvement. Consider reviewing your entry criteria.`,
          icon: AlertTriangle,
          metric: `${winRate.toFixed(1)}%`,
          recommendation: 'Analyze your losing trades for common patterns and tighten your entry rules.'
        });
      }

      // PnL Analysis
      if (totalPnL > 0) {
        newInsights.push({
          type: 'positive',
          title: 'Profitable Period',
          description: `You generated $${totalPnL.toFixed(2)} in profits this ${period}.`,
          icon: TrendingUp,
          metric: `+$${totalPnL.toFixed(2)}`,
          recommendation: 'Great work! Document what strategies worked best for future reference.'
        });
      } else if (totalPnL < 0) {
        newInsights.push({
          type: 'negative',
          title: 'Losses This Period',
          description: `You had a net loss of $${Math.abs(totalPnL).toFixed(2)} this ${period}.`,
          icon: TrendingDown,
          metric: `-$${Math.abs(totalPnL).toFixed(2)}`,
          recommendation: 'Review your risk management and consider reducing position sizes until you find your edge again.'
        });
      }

      // Risk-Reward Analysis
      const tradesWithRR = trades.filter(trade => trade.target && trade.stop && trade.entryPrice);
      if (tradesWithRR.length > 0) {
        const avgRR = tradesWithRR.reduce((sum, trade) => {
          const risk = Math.abs((trade.stop || 0) - trade.entryPrice);
          const reward = Math.abs((trade.target || 0) - trade.entryPrice);
          return sum + (reward / risk);
        }, 0) / tradesWithRR.length;

        if (avgRR >= 2) {
          newInsights.push({
            type: 'positive',
            title: 'Excellent Risk-Reward',
            description: `Your average risk-reward ratio of 1:${avgRR.toFixed(2)} is excellent.`,
            icon: Target,
            metric: `1:${avgRR.toFixed(2)}`,
            recommendation: 'Maintain this disciplined approach to risk management.'
          });
        } else if (avgRR >= 1.5) {
          newInsights.push({
            type: 'positive',
            title: 'Good Risk-Reward',
            description: `Your risk-reward ratio of 1:${avgRR.toFixed(2)} is solid.`,
            icon: Target,
            metric: `1:${avgRR.toFixed(2)}`,
            recommendation: 'Try to find setups with even better risk-reward ratios when possible.'
          });
        } else {
          newInsights.push({
            type: 'warning',
            title: 'Poor Risk-Reward',
            description: `Your risk-reward ratio of 1:${avgRR.toFixed(2)} is too low for consistent profitability.`,
            icon: AlertTriangle,
            metric: `1:${avgRR.toFixed(2)}`,
            recommendation: 'Look for trades with at least 1:2 risk-reward ratio or improve your exit strategy.'
          });
        }
      }

      // Rule Compliance Analysis
      const compliantTrades = trades.filter(trade => trade.ruleCompliant);
      const complianceRate = (compliantTrades.length / trades.length) * 100;

      if (complianceRate >= 90) {
        newInsights.push({
          type: 'positive',
          title: 'Excellent Discipline',
          description: `${complianceRate.toFixed(1)}% rule compliance shows strong trading discipline.`,
          icon: CheckCircle,
          metric: `${complianceRate.toFixed(1)}%`,
          recommendation: 'Your discipline is paying off. Keep following your rules consistently.'
        });
      } else if (complianceRate >= 70) {
        newInsights.push({
          type: 'neutral',
          title: 'Good Discipline',
          description: `${complianceRate.toFixed(1)}% rule compliance is decent but has room for improvement.`,
          icon: BarChart3,
          metric: `${complianceRate.toFixed(1)}%`,
          recommendation: 'Identify what causes rule violations and work on eliminating those triggers.'
        });
      } else {
        newInsights.push({
          type: 'negative',
          title: 'Poor Discipline',
          description: `Only ${complianceRate.toFixed(1)}% rule compliance indicates discipline issues.`,
          icon: AlertTriangle,
          metric: `${complianceRate.toFixed(1)}%`,
          recommendation: 'Focus on following your trading rules. Consider reducing position sizes until discipline improves.'
        });
      }

      // Emotional Analysis
      const emotions = trades.reduce((acc, trade) => {
        trade.emotions.forEach(emotion => {
          acc[emotion] = (acc[emotion] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const dominantEmotion = Object.entries(emotions).sort(([,a], [,b]) => b - a)[0];
      if (dominantEmotion) {
        const [emotion, count] = dominantEmotion;
        const percentage = (count / trades.length) * 100;

        if (emotion === 'confident' || emotion === 'neutral') {
          newInsights.push({
            type: 'positive',
            title: 'Positive Emotional State',
            description: `${percentage.toFixed(1)}% of your trades were made with ${emotion.toLowerCase()} emotions.`,
            icon: Brain,
            metric: `${emotion} ${percentage.toFixed(1)}%`,
            recommendation: 'Your emotional control is contributing to your trading success.'
          });
        } else if (emotion === 'fearful' || emotion === 'greedy' || emotion === 'frustrated') {
          newInsights.push({
            type: 'warning',
            title: 'Emotional Trading Detected',
            description: `${percentage.toFixed(1)}% of your trades were influenced by ${emotion.toLowerCase()}.`,
            icon: Brain,
            metric: `${emotion} ${percentage.toFixed(1)}%`,
            recommendation: 'Work on emotional control. Consider meditation or taking breaks when feeling emotional.'
          });
        }
      }

      // Trading Frequency Analysis
      const avgTradesPerDay = trades.length / (period === 'weekly' ? 7 : 30);
      if (avgTradesPerDay > 5) {
        newInsights.push({
          type: 'warning',
          title: 'High Trading Frequency',
          description: `You're averaging ${avgTradesPerDay.toFixed(1)} trades per day, which may indicate overtrading.`,
          icon: Clock,
          metric: `${avgTradesPerDay.toFixed(1)}/day`,
          recommendation: 'Consider being more selective with your trades. Quality over quantity often leads to better results.'
        });
      } else if (avgTradesPerDay < 0.5 && period === 'weekly') {
        newInsights.push({
          type: 'neutral',
          title: 'Low Trading Activity',
          description: `You're averaging ${avgTradesPerDay.toFixed(1)} trades per day. This could indicate missed opportunities or good selectivity.`,
          icon: Clock,
          metric: `${avgTradesPerDay.toFixed(1)}/day`,
          recommendation: 'Ensure you\'re not missing good setups due to over-analysis or fear.'
        });
      }

      setInsights(newInsights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      console.error('Insights generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearInsights = useCallback(() => {
    setInsights([]);
    setError(null);
  }, []);

  return {
    insights,
    isGenerating,
    error,
    generateInsights,
    clearInsights
  };
}

