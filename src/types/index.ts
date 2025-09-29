/**
 * Core application types for LockIn trading discipline application
 * Provides comprehensive type safety across all components and features
 */

// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  premiumStatus: PremiumStatus;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
}

export type PremiumStatus = 'none' | 'trial' | 'premium' | 'lifetime';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  trading: TradingPreferences;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  achievements: boolean;
  streaks: boolean;
  milestones: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showStats: boolean;
  allowFriendRequests: boolean;
  dataSharing: boolean;
}

export interface TradingPreferences {
  timezone: string;
  currency: string;
  defaultRiskPercent: number;
  defaultPositionSize: number;
}

// =============================================================================
// TRADING & JOURNAL TYPES
// =============================================================================

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: TradeType;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: Date;
  exitDate?: Date;
  profitLoss?: number;
  profitLossPercent?: number;
  fees: number;
  notes?: string;
  tags: string[];
  screenshots: string[];
  ruleCompliant: boolean;
  emotions: Emotion[];
  setup: string;
  strategy: string;
  status: TradeStatus;
  aiAnalysis?: AIAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export type TradeType = 'long' | 'short';
export type TradeStatus = 'open' | 'closed' | 'pending';
export type Emotion = 'excited' | 'confident' | 'neutral' | 'anxious' | 'fearful' | 'greedy' | 'frustrated';

export interface AIAnalysis {
  pattern: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  analyzedAt: Date;
}

// =============================================================================
// PROGRESS & ACHIEVEMENT TYPES
// =============================================================================

export interface UserProgress {
  userId: string;
  completions: number;
  streak: number;
  longestStreak: number;
  disciplineScore: number;
  totalProfitLoss: number;
  winRate: number;
  averageRiskReward: number;
  currentBalance: number;
  achievements: Achievement[];
  milestones: Milestone[];
  level: number;
  experience: number;
  nextLevelProgress: number;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
  rewards: Reward[];
  category: AchievementCategory;
}

export type AchievementType =
  | 'streak' | 'completions' | 'profit' | 'discipline'
  | 'consistency' | 'learning' | 'social' | 'special';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory = 'trading' | 'discipline' | 'progress' | 'social' | 'special';

export interface Reward {
  type: 'experience' | 'title' | 'badge' | 'feature' | 'cosmetic';
  value: string | number;
  description: string;
}

export interface Milestone {
  id: string;
  userId: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: MilestoneType;
  completedAt?: Date;
  rewards: Reward[];
}

export type MilestoneType = 'completions' | 'streak' | 'profit' | 'discipline' | 'custom';

// =============================================================================
// RULE & COMPLIANCE TYPES
// =============================================================================

export interface TradingRule {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: RuleCategory;
  priority: RulePriority;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isActive: boolean;
  isTemplate: boolean;
  templateId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  violationCount: number;
}

export type RuleCategory =
  | 'risk_management' | 'entry_timing' | 'position_sizing'
  | 'exit_strategy' | 'psychology' | 'compliance' | 'custom';

export type RulePriority = 'low' | 'medium' | 'high' | 'critical';

export interface RuleCondition {
  type: 'price' | 'volume' | 'time' | 'indicator' | 'pattern' | 'custom';
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains' | 'matches';
  value: string | number | boolean;
  parameter: string;
  description: string;
}

export interface RuleAction {
  type: 'alert' | 'block' | 'log' | 'notify' | 'custom';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: NotificationChannel[];
}

export type NotificationChannel = 'toast' | 'email' | 'push' | 'sms' | 'webhook';

// =============================================================================
// SOCIAL & FRIENDS TYPES
// =============================================================================

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
  invitedAt: Date;
  acceptedAt?: Date;
  displayName: string;
  avatar?: string;
  disciplineScore: number;
  badges: string[];
  isPremium: boolean;
  lastActiveAt: Date;
  sharedTrades: number;
  sharedAchievements: number;
}

export type FriendStatus = 'pending' | 'accepted' | 'blocked' | 'removed';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: FriendStatus;
  createdAt: Date;
  respondedAt?: Date;
}

// =============================================================================
// REPORTS & ANALYTICS TYPES
// =============================================================================

export interface ReportData {
  userId: string;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  trades: Trade[];
  metrics: TradingMetrics;
  insights: Insight[];
  charts: ChartData[];
  generatedAt: Date;
}

export type ReportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface TradingMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  averageProfitLoss: number;
  largestWin: number;
  largestLoss: number;
  averageRiskReward: number;
  totalFees: number;
  tradingDays: number;
  averageTradesPerDay: number;
  bestStreak: number;
  worstStreak: number;
  ruleComplianceRate: number;
  emotionalDiscipline: number;
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  actionable: boolean;
  recommendations: string[];
  data: Record<string, any>;
  createdAt: Date;
}

export type InsightType =
  | 'pattern' | 'risk' | 'opportunity' | 'behavior' | 'performance' | 'compliance';

export interface ChartData {
  id: string;
  type: ChartType;
  title: string;
  data: any[];
  config: ChartConfig;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';

export interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animation?: boolean;
}

// =============================================================================
// SETTINGS & CONFIGURATION TYPES
// =============================================================================

export interface AppSettings {
  userId: string;
  startingPortfolio: number;
  targetCompletions: number;
  growthPerCompletion: number;
  progressObject: ProgressObject;
  rules: TradingRule[];
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  trading: TradingPreferences;
  ui: UISettings;
  updatedAt: Date;
}

export type ProgressObject = 'beer' | 'wine' | 'donut' | 'diamond' | 'trophy' | 'star' | 'medal' | 'coin';

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  soundEffects: boolean;
  compactMode: boolean;
  showTooltips: boolean;
  language: string;
  dateFormat: string;
  numberFormat: string;
}

// =============================================================================
// API & NETWORK TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

// =============================================================================
// FORM & VALIDATION TYPES
// =============================================================================

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: ValidationRule[];
  description?: string;
  defaultValue?: any;
}

export type FormFieldType =
  | 'text' | 'email' | 'password' | 'number' | 'textarea'
  | 'select' | 'multiselect' | 'checkbox' | 'radio'
  | 'date' | 'time' | 'datetime' | 'file' | 'image'
  | 'range' | 'tel' | 'url' | 'color';

export interface FormFieldOption {
  value: string | number | boolean;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

export type ValidationType =
  | 'required' | 'min' | 'max' | 'minLength' | 'maxLength'
  | 'email' | 'url' | 'pattern' | 'custom';

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export type NonEmptyArray<T> = [T, ...T[]];

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// EVENT & ANALYTICS TYPES
// =============================================================================

export interface UserEvent {
  id: string;
  userId: string;
  type: EventType;
  category: EventCategory;
  action: string;
  data?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
}

export type EventType = 'click' | 'view' | 'submit' | 'error' | 'achievement' | 'trade' | 'social';

export type EventCategory = 'navigation' | 'trading' | 'social' | 'settings' | 'achievement' | 'error';

export interface AnalyticsData {
  userId: string;
  period: ReportPeriod;
  metrics: Record<string, number>;
  events: UserEvent[];
  insights: Insight[];
  trends: TrendData[];
}

export interface TrendData {
  metric: string;
  period: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

// =============================================================================
// PWA & OFFLINE TYPES
// =============================================================================

export interface OfflineQueueItem {
  id: string;
  type: 'sync' | 'upload' | 'download';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: Date;
  pendingItems: number;
  isSyncing: boolean;
  errors: string[];
}

export interface PWAInstallPrompt {
  isAvailable: boolean;
  isDismissed: boolean;
  prompt: () => Promise<void>;
  dismiss: () => void;
}

// =============================================================================
// AI & MACHINE LEARNING TYPES
// =============================================================================

export interface PatternRecognitionResult {
  pattern: string;
  confidence: number;
  indicators: IndicatorData[];
  signals: Signal[];
  recommendations: Recommendation[];
  riskAssessment: RiskAssessment;
}

export interface IndicatorData {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  description: string;
}

export interface Signal {
  type: 'entry' | 'exit' | 'warning' | 'info';
  strength: number;
  message: string;
  confidence: number;
  timestamp: Date;
}

export interface Recommendation {
  action: string;
  reasoning: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  score: number;
  maxLoss: number;
  winProbability: number;
}

export interface RiskFactor {
  name: string;
  level: 'low' | 'medium' | 'high';
  weight: number;
  description: string;
}
