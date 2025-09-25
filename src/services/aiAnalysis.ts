/**
 * Advanced AI Analysis Service
 * Provides sophisticated pattern recognition, predictive analytics, and trading insights
 */

import {
  Trade,
  AIAnalysis,
  PatternRecognitionResult,
  IndicatorData,
  Signal,
  Recommendation,
  RiskAssessment,
  RiskFactor,
  TradeType,
  Emotion
} from '../types';

export interface AIModelConfig {
  confidenceThreshold: number;
  lookbackPeriod: number;
  minDataPoints: number;
  enableRealTimeAnalysis: boolean;
  modelVersion: string;
}

export interface MarketCondition {
  volatility: 'low' | 'medium' | 'high';
  trend: 'bullish' | 'bearish' | 'sideways';
  volume: 'low' | 'medium' | 'high';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface PredictiveSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  timeframe: string;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  stopLoss: number;
  takeProfit: number;
}

/**
 * Advanced AI Analysis Service
 * Uses machine learning algorithms to analyze trading patterns and provide insights
 */
export class AIAnalysisService {
  private config: AIModelConfig;
  private modelCache: Map<string, any> = new Map();

  constructor(config: Partial<AIModelConfig> = {}) {
    this.config = {
      confidenceThreshold: 0.7,
      lookbackPeriod: 30,
      minDataPoints: 10,
      enableRealTimeAnalysis: true,
      modelVersion: '1.0.0',
      ...config
    };
  }

  /**
   * Performs comprehensive AI analysis on a single trade
   */
  async analyzeTrade(trade: Trade): Promise<AIAnalysis> {
    try {
      const patternRecognition = await this.recognizePatterns([trade]);
      const riskAssessment = this.assessRisk(trade);
      const indicators = this.calculateTechnicalIndicators([trade]);
      const signals = this.generateSignals(trade, patternRecognition);
      const recommendations = this.generateRecommendations(trade, riskAssessment);

      return {
        pattern: patternRecognition.pattern,
        confidence: patternRecognition.confidence,
        riskLevel: riskAssessment.overallRisk,
        recommendations: recommendations.map(r => r.action),
        sentiment: this.analyzeSentiment(trade),
        analyzedAt: new Date()
      };
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return {
        pattern: 'unknown',
        confidence: 0,
        riskLevel: 'medium',
        recommendations: ['Manual review required'],
        sentiment: 'neutral',
        analyzedAt: new Date()
      };
    }
  }

  /**
   * Analyzes multiple trades for pattern recognition
   */
  async analyzeTradeHistory(trades: Trade[]): Promise<PatternRecognitionResult> {
    if (trades.length < this.config.minDataPoints) {
      return this.getInsufficientDataResult();
    }

    try {
      const filteredTrades = this.filterRecentTrades(trades);
      const patterns = await this.identifyPatterns(filteredTrades);
      const indicators = this.calculateTechnicalIndicators(filteredTrades);
      const signals = this.generateSignalsFromHistory(filteredTrades);
      const recommendations = this.generateHistoricalRecommendations(filteredTrades);
      const riskAssessment = this.assessPortfolioRisk(filteredTrades);

      return {
        pattern: patterns.primary,
        confidence: patterns.confidence,
        indicators,
        signals,
        recommendations,
        riskAssessment
      };
    } catch (error) {
      console.error('Pattern recognition failed:', error);
      return this.getErrorResult();
    }
  }

  /**
   * Predicts future market movements based on historical data
   */
  async predictMarketConditions(trades: Trade[]): Promise<PredictiveSignal[]> {
    if (trades.length < this.config.minDataPoints) {
      return [];
    }

    try {
      const marketConditions = this.analyzeMarketConditions(trades);
      const predictions: PredictiveSignal[] = [];

      // Group trades by symbol for analysis
      const symbolGroups = this.groupTradesBySymbol(trades);

      for (const [symbol, symbolTrades] of Object.entries(symbolGroups)) {
        if (symbolTrades.length >= 5) {
          const prediction = await this.predictSymbolMovement(symbol, symbolTrades, marketConditions);
          if (prediction) {
            predictions.push(prediction);
          }
        }
      }

      return predictions.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Market prediction failed:', error);
      return [];
    }
  }

  /**
   * Analyzes emotional patterns in trading behavior
   */
  analyzeEmotionalPatterns(trades: Trade[]): {
    dominantEmotion: Emotion;
    emotionalConsistency: number;
    riskByEmotion: Record<Emotion, number>;
    recommendations: string[];
  } {
    const emotions = trades.map(t => t.emotion);
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] as Emotion || 'Neutral';

    const emotionalConsistency = Math.max(...Object.values(emotionCounts)) / emotions.length;

    const riskByEmotion = trades.reduce((acc, trade) => {
      if (!acc[trade.emotion]) {
        acc[trade.emotion] = [];
      }
      acc[trade.emotion].push(Math.abs(trade.profitLossPercent || 0));
      return acc;
    }, {} as Record<Emotion, number[]>);

    const avgRiskByEmotion = Object.entries(riskByEmotion).reduce((acc, [emotion, risks]) => {
      acc[emotion as Emotion] = risks.reduce((sum, risk) => sum + risk, 0) / risks.length;
      return acc;
    }, {} as Record<Emotion, number>);

    const recommendations: string[] = [];

    if (emotionalConsistency < 0.5) {
      recommendations.push('Your emotions vary significantly between trades. Consider developing emotional awareness.');
    }

    const highRiskEmotions = Object.entries(avgRiskByEmotion)
      .filter(([, risk]) => risk > 5)
      .map(([emotion]) => emotion);

    if (highRiskEmotions.length > 0) {
      recommendations.push(`You're taking higher risks when feeling ${highRiskEmotions.join(', ')}. Consider reducing position sizes during these emotional states.`);
    }

    if (dominantEmotion === 'Fear' || dominantEmotion === 'Anxiety') {
      recommendations.push('Fear appears to be dominant. Consider working on confidence-building exercises or consulting with a trading psychologist.');
    }

    return {
      dominantEmotion,
      emotionalConsistency,
      riskByEmotion: avgRiskByEmotion,
      recommendations
    };
  }

  /**
   * Advanced risk assessment with multiple factors
   */
  private assessRisk(trade: Trade): RiskAssessment {
    const factors: RiskFactor[] = [];

    // Position sizing risk
    const positionSizeRisk = trade.quantity * trade.entryPrice;
    if (positionSizeRisk > 10000) {
      factors.push({
        name: 'Large Position Size',
        level: 'high',
        weight: 0.3,
        description: 'Position size may be too large relative to account size'
      });
    } else if (positionSizeRisk < 1000) {
      factors.push({
        name: 'Small Position Size',
        level: 'low',
        weight: 0.1,
        description: 'Position size may limit profit potential'
      });
    }

    // Volatility risk
    const volatility = this.calculateVolatility([trade]);
    if (volatility > 0.3) {
      factors.push({
        name: 'High Volatility',
        level: 'high',
        weight: 0.25,
        description: 'Market volatility may increase risk of large losses'
      });
    }

    // Emotional risk
    const emotionalRisk = this.assessEmotionalRisk(trade.emotion);
    if (emotionalRisk.level !== 'low') {
      factors.push(emotionalRisk);
    }

    // Rule compliance risk
    if (!trade.ruleCompliant) {
      factors.push({
        name: 'Rule Violation',
        level: 'high',
        weight: 0.4,
        description: 'Trade violates established trading rules'
      });
    }

    // Calculate overall risk score
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const weightedScore = factors.reduce((sum, factor) => {
      const levelScore = factor.level === 'low' ? 1 : factor.level === 'medium' ? 2 : 3;
      return sum + (levelScore * factor.weight);
    }, 0);

    const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 1;

    let overallRisk: 'low' | 'medium' | 'high' | 'critical';
    if (overallScore < 1.5) overallRisk = 'low';
    else if (overallScore < 2.5) overallRisk = 'medium';
    else if (overallScore < 3) overallRisk = 'high';
    else overallRisk = 'critical';

    return {
      overallRisk,
      factors,
      score: overallScore,
      maxLoss: this.calculateMaxLoss(trade),
      winProbability: this.calculateWinProbability(trade)
    };
  }

  /**
   * Calculates technical indicators
   */
  private calculateTechnicalIndicators(trades: Trade[]): IndicatorData[] {
    if (trades.length === 0) return [];

    const indicators: IndicatorData[] = [];

    // Moving average of profit/loss
    const recentTrades = trades.slice(-10);
    const avgPnL = recentTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / recentTrades.length;

    indicators.push({
      name: 'Recent Performance',
      value: avgPnL,
      signal: avgPnL > 0 ? 'bullish' : avgPnL < 0 ? 'bearish' : 'neutral',
      strength: Math.min(Math.abs(avgPnL) / 100, 1),
      description: `Average P&L over last ${recentTrades.length} trades`
    });

    // Win rate indicator
    const winRate = (trades.filter(t => t.profitLoss > 0).length / trades.length) * 100;
    indicators.push({
      name: 'Win Rate',
      value: winRate,
      signal: winRate > 60 ? 'bullish' : winRate > 40 ? 'neutral' : 'bearish',
      strength: Math.min(winRate / 100, 1),
      description: 'Percentage of profitable trades'
    });

    // Risk-reward ratio
    const tradesWithRR = trades.filter(t => t.target && t.stop);
    if (tradesWithRR.length > 0) {
      const avgRR = tradesWithRR.reduce((sum, trade) => {
        const risk = Math.abs((trade.stop || 0) - trade.entryPrice);
        const reward = Math.abs((trade.target || 0) - trade.entryPrice);
        return sum + (reward / risk);
      }, 0) / tradesWithRR.length;

      indicators.push({
        name: 'Risk-Reward Ratio',
        value: avgRR,
        signal: avgRR > 2 ? 'bullish' : avgRR > 1 ? 'neutral' : 'bearish',
        strength: Math.min(avgRR / 3, 1),
        description: 'Average risk-reward ratio of trades with defined targets'
      });
    }

    return indicators;
  }

  /**
   * Generates trading signals based on analysis
   */
  private generateSignals(trade: Trade, patternRecognition: PatternRecognitionResult): Signal[] {
    const signals: Signal[] = [];

    // Entry signal
    if (trade.profitLoss > 0 && trade.ruleCompliant) {
      signals.push({
        type: 'entry',
        strength: 0.8,
        message: 'Similar successful trades detected. Consider similar entries.',
        confidence: patternRecognition.confidence,
        timestamp: new Date()
      });
    }

    // Risk warning
    if (trade.profitLoss < -500 || !trade.ruleCompliant) {
      signals.push({
        type: 'warning',
        strength: 0.9,
        message: 'High-risk pattern detected. Exercise caution.',
        confidence: 0.85,
        timestamp: new Date()
      });
    }

    // Exit signal for open trades
    if (trade.status === 'open') {
      const riskLevel = this.assessRisk(trade);
      if (riskLevel.overallRisk === 'high') {
        signals.push({
          type: 'exit',
          strength: 0.7,
          message: 'Consider exiting position due to elevated risk.',
          confidence: 0.75,
          timestamp: new Date()
        });
      }
    }

    return signals;
  }

  /**
   * Generates actionable recommendations
   */
  private generateRecommendations(trade: Trade, riskAssessment: RiskAssessment): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (!trade.ruleCompliant) {
      recommendations.push({
        action: 'Review and follow trading rules strictly',
        reasoning: 'Rule violations increase risk and reduce long-term profitability',
        confidence: 0.9,
        riskLevel: 'high',
        timeframe: 'immediate'
      });
    }

    if (riskAssessment.overallRisk === 'high') {
      recommendations.push({
        action: 'Reduce position size by 50%',
        reasoning: 'Current risk level is elevated and requires risk management',
        confidence: 0.85,
        riskLevel: 'high',
        timeframe: 'immediate'
      });
    }

    if (trade.emotion === 'Fear' || trade.emotion === 'Anxiety') {
      recommendations.push({
        action: 'Take a break and reassess market conditions',
        reasoning: 'Emotional trading often leads to poor decision making',
        confidence: 0.8,
        riskLevel: 'medium',
        timeframe: 'immediate'
      });
    }

    return recommendations;
  }

  /**
   * Analyzes sentiment based on trade characteristics
   */
  private analyzeSentiment(trade: Trade): 'positive' | 'neutral' | 'negative' {
    if (trade.profitLoss > 0 && trade.ruleCompliant) {
      return 'positive';
    } else if (trade.profitLoss < 0 || !trade.ruleCompliant) {
      return 'negative';
    }
    return 'neutral';
  }

  /**
   * Filters trades to recent period
   */
  private filterRecentTrades(trades: Trade[]): Trade[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.lookbackPeriod);
    return trades.filter(trade => new Date(trade.entryDate) >= cutoffDate);
  }

  /**
   * Identifies trading patterns
   */
  private async identifyPatterns(trades: Trade[]): Promise<{ primary: string; confidence: number }> {
    // Simplified pattern recognition - in real implementation, this would use ML models
    const profitableTrades = trades.filter(t => t.profitLoss > 0);
    const losingTrades = trades.filter(t => t.profitLoss < 0);

    if (profitableTrades.length > losingTrades.length) {
      return { primary: 'profitable_trend', confidence: 0.75 };
    } else if (losingTrades.length > profitableTrades.length) {
      return { primary: 'losing_streak', confidence: 0.8 };
    }

    return { primary: 'mixed_performance', confidence: 0.5 };
  }

  /**
   * Calculates portfolio risk
   */
  private assessPortfolioRisk(trades: Trade[]): RiskAssessment {
    const totalValue = trades.reduce((sum, trade) => sum + Math.abs(trade.profitLoss), 0);
    const avgLoss = trades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + t.profitLoss, 0) / Math.max(1, trades.filter(t => t.profitLoss < 0).length);

    const factors: RiskFactor[] = [];

    if (Math.abs(avgLoss) > totalValue * 0.1) {
      factors.push({
        name: 'Large Average Loss',
        level: 'high',
        weight: 0.4,
        description: 'Average loss size is significant relative to portfolio'
      });
    }

    return {
      overallRisk: factors.length > 0 ? 'high' : 'medium',
      factors,
      score: factors.length > 0 ? 2.5 : 1.5,
      maxLoss: Math.abs(avgLoss),
      winProbability: (trades.filter(t => t.profitLoss > 0).length / trades.length) * 100
    };
  }

  /**
   * Calculates volatility
   */
  private calculateVolatility(trades: Trade[]): number {
    if (trades.length < 2) return 0;

    const returns = trades.map(t => t.profitLossPercent || 0);
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;

    return Math.sqrt(variance);
  }

  /**
   * Assesses emotional risk
   */
  private assessEmotionalRisk(emotion: string): RiskFactor {
    const highRiskEmotions = ['Fear', 'Greed', 'Anxiety', 'Frustrated'];

    if (highRiskEmotions.includes(emotion)) {
      return {
        name: 'Emotional Trading',
        level: 'high',
        weight: 0.3,
        description: `Trading under ${emotion.toLowerCase()} influence increases risk`
      };
    }

    return {
      name: 'Emotional State',
      level: 'low',
      weight: 0.1,
      description: 'Emotional state appears controlled'
    };
  }

  /**
   * Calculates maximum potential loss
   */
  private calculateMaxLoss(trade: Trade): number {
    if (trade.stop && trade.entryPrice) {
      return Math.abs(trade.entryPrice - trade.stop) * trade.quantity;
    }
    return Math.abs(trade.profitLoss);
  }

  /**
   * Calculates win probability
   */
  private calculateWinProbability(trade: Trade): number {
    // Simplified calculation - in reality would use historical data and ML models
    if (trade.ruleCompliant && trade.emotion === 'Confident') {
      return 0.7;
    } else if (!trade.ruleCompliant) {
      return 0.3;
    }
    return 0.5;
  }

  /**
   * Analyzes market conditions
   */
  private analyzeMarketConditions(trades: Trade[]): MarketCondition {
    const volatility = this.calculateVolatility(trades);
    const recentPerformance = trades.slice(-5).reduce((sum, t) => sum + t.profitLoss, 0);

    return {
      volatility: volatility > 0.3 ? 'high' : volatility > 0.15 ? 'medium' : 'low',
      trend: recentPerformance > 0 ? 'bullish' : recentPerformance < 0 ? 'bearish' : 'sideways',
      volume: trades.length > 20 ? 'high' : trades.length > 10 ? 'medium' : 'low',
      sentiment: this.calculateMarketSentiment(trades)
    };
  }

  /**
   * Calculates market sentiment
   */
  private calculateMarketSentiment(trades: Trade[]): 'positive' | 'negative' | 'neutral' {
    const recentTrades = trades.slice(-10);
    const profitableTrades = recentTrades.filter(t => t.profitLoss > 0).length;

    if (profitableTrades > recentTrades.length * 0.6) return 'positive';
    if (profitableTrades < recentTrades.length * 0.4) return 'negative';
    return 'neutral';
  }

  /**
   * Groups trades by symbol
   */
  private groupTradesBySymbol(trades: Trade[]): Record<string, Trade[]> {
    return trades.reduce((groups, trade) => {
      if (!groups[trade.symbol]) {
        groups[trade.symbol] = [];
      }
      groups[trade.symbol].push(trade);
      return groups;
    }, {} as Record<string, Trade[]>);
  }

  /**
   * Predicts symbol movement
   */
  private async predictSymbolMovement(
    symbol: string,
    trades: Trade[],
    marketConditions: MarketCondition
  ): Promise<PredictiveSignal | null> {
    // Simplified prediction logic - in reality would use ML models
    const recentPerformance = trades.slice(-5).reduce((sum, t) => sum + t.profitLoss, 0);
    const winRate = (trades.filter(t => t.profitLoss > 0).length / trades.length) * 100;

    if (winRate > 60 && marketConditions.trend === 'bullish') {
      return {
        symbol,
        action: 'buy',
        confidence: 0.75,
        timeframe: 'short-term',
        reasoning: 'Strong recent performance with bullish market conditions',
        riskLevel: 'medium',
        expectedReturn: 5,
        stopLoss: -3,
        takeProfit: 8
      };
    } else if (winRate < 40 && marketConditions.trend === 'bearish') {
      return {
        symbol,
        action: 'sell',
        confidence: 0.7,
        timeframe: 'short-term',
        reasoning: 'Poor recent performance with bearish market conditions',
        riskLevel: 'high',
        expectedReturn: -4,
        stopLoss: 3,
        takeProfit: -7
      };
    }

    return null;
  }

  /**
   * Generates signals from trade history
   */
  private generateSignalsFromHistory(trades: Trade[]): Signal[] {
    const signals: Signal[] = [];

    if (trades.length >= 3) {
      const recentTrend = trades.slice(-3).every(t => t.profitLoss > 0);

      if (recentTrend) {
        signals.push({
          type: 'info',
          strength: 0.6,
          message: 'Recent trades show positive momentum',
          confidence: 0.7,
          timestamp: new Date()
        });
      }
    }

    return signals;
  }

  /**
   * Generates historical recommendations
   */
  private generateHistoricalRecommendations(trades: Trade[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const ruleViolations = trades.filter(t => !t.ruleCompliant).length;
    const violationRate = ruleViolations / trades.length;

    if (violationRate > 0.3) {
      recommendations.push({
        action: 'Strictly adhere to trading rules',
        reasoning: `${(violationRate * 100).toFixed(1)}% of trades violate rules`,
        confidence: 0.9,
        riskLevel: 'high',
        timeframe: 'immediate'
      });
    }

    const emotionalTrades = trades.filter(t =>
      ['Fear', 'Greed', 'Anxiety', 'Frustrated'].includes(t.emotion)
    ).length;

    if (emotionalTrades > trades.length * 0.5) {
      recommendations.push({
        action: 'Work on emotional discipline',
        reasoning: 'High percentage of emotionally-driven trades detected',
        confidence: 0.8,
        riskLevel: 'medium',
        timeframe: 'ongoing'
      });
    }

    return recommendations;
  }

  /**
   * Returns result for insufficient data
   */
  private getInsufficientDataResult(): PatternRecognitionResult {
    return {
      pattern: 'insufficient_data',
      confidence: 0,
      indicators: [],
      signals: [],
      recommendations: ['Need more trading data for accurate analysis'],
      riskAssessment: {
        overallRisk: 'medium',
        factors: [],
        score: 1.5,
        maxLoss: 0,
        winProbability: 50
      }
    };
  }

  /**
   * Returns error result
   */
  private getErrorResult(): PatternRecognitionResult {
    return {
      pattern: 'analysis_error',
      confidence: 0,
      indicators: [],
      signals: [],
      recommendations: ['Analysis temporarily unavailable'],
      riskAssessment: {
        overallRisk: 'medium',
        factors: [],
        score: 1.5,
        maxLoss: 0,
        winProbability: 50
      }
    };
  }
}
