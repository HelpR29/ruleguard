/**
 * Context and hook types for RuleGuard application
 * Provides type-safe interfaces for React contexts and custom hooks
 */

import React from 'react';
import { User, UserProgress, AppSettings, NotificationSettings } from './index';

// =============================================================================
// CONTEXT TYPES
// =============================================================================

export interface UserContextValue {
  user: User | null;
  progress: UserProgress;
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateProgress: (updates: Partial<UserProgress>) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  refreshData: () => Promise<void>;
}

export interface ThemeContextValue {
  theme: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export interface PWAContextValue {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPrompt: () => Promise<void>;
  dismissInstallPrompt: () => void;
  updateAvailable: boolean;
  updateApp: () => Promise<void>;
  syncStatus: SyncStatus;
  syncData: () => Promise<void>;
}

// =============================================================================
// HOOK TYPES
// =============================================================================

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  isDebouncing: boolean;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export interface UsePaginationReturn<T> {
  data: T[];
  pagination: PaginationState;
  loading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  changeLimit: (limit: number) => Promise<void>;
}

export interface UseInfiniteScrollReturn {
  hasNextPage: boolean;
  isLoading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

export interface UseFormReturn<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: string, error: string) => void;
  clearErrors: () => void;
  setTouched: (field: string, touched: boolean) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => Promise<void>;
  reset: (initialValues?: T) => void;
  validate: () => boolean;
}

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface UseTradingReturn {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  createTrade: (trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Trade>;
  updateTrade: (id: string, updates: Partial<Trade>) => Promise<Trade>;
  deleteTrade: (id: string) => Promise<void>;
  getTrades: (filters?: TradeFilters) => Promise<Trade[]>;
  getTradeById: (id: string) => Promise<Trade | null>;
  analyzeTrade: (trade: Trade) => Promise<AIAnalysis>;
  exportTrades: (format: 'csv' | 'json' | 'pdf', filters?: TradeFilters) => Promise<Blob>;
}

export interface UseRulesReturn {
  rules: TradingRule[];
  isLoading: boolean;
  error: string | null;
  createRule: (rule: Omit<TradingRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TradingRule>;
  updateRule: (id: string, updates: Partial<TradingRule>) => Promise<TradingRule>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<void>;
  validateRule: (rule: Partial<TradingRule>) => Promise<ValidationResult>;
  getRuleTemplates: () => Promise<TradingRule[]>;
  applyTemplate: (templateId: string) => Promise<TradingRule>;
}

export interface UseAchievementsReturn {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  unlockAchievement: (achievementId: string) => Promise<void>;
  getAchievements: (filters?: AchievementFilters) => Promise<Achievement[]>;
  getAchievementProgress: (achievementId: string) => Promise<number>;
  claimRewards: (achievementId: string) => Promise<Reward[]>;
  getAvailableAchievements: () => Promise<Achievement[]>;
  checkForNewAchievements: () => Promise<Achievement[]>;
}

export interface UseSocialReturn {
  friends: Friend[];
  friendRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
  sendFriendRequest: (userId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  getFriends: (filters?: FriendFilters) => Promise<Friend[]>;
  searchUsers: (query: string) => Promise<User[]>;
  shareTrade: (tradeId: string, friendIds: string[]) => Promise<void>;
  shareAchievement: (achievementId: string, friendIds: string[]) => Promise<void>;
}

export interface UseReportsReturn {
  reports: ReportData[];
  isLoading: boolean;
  error: string | null;
  generateReport: (period: ReportPeriod, startDate?: Date, endDate?: Date) => Promise<ReportData>;
  getReport: (reportId: string) => Promise<ReportData | null>;
  exportReport: (reportId: string, format: 'pdf' | 'csv' | 'json') => Promise<Blob>;
  getInsights: (period: ReportPeriod) => Promise<Insight[]>;
  getMetrics: (period: ReportPeriod) => Promise<TradingMetrics>;
  comparePeriods: (period1: ReportPeriod, period2: ReportPeriod) => Promise<ComparisonData>;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  subscribeToNotifications: (userId: string) => Promise<void>;
  unsubscribeFromNotifications: () => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
}

// =============================================================================
// PARAMETER TYPES
// =============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface TradeFilters {
  startDate?: Date;
  endDate?: Date;
  symbol?: string;
  type?: 'long' | 'short';
  status?: 'open' | 'closed' | 'pending';
  ruleCompliant?: boolean;
  minProfit?: number;
  maxProfit?: number;
  tags?: string[];
  emotions?: string[];
}

export interface AchievementFilters {
  type?: AchievementType;
  rarity?: AchievementRarity;
  category?: AchievementCategory;
  unlocked?: boolean;
  progress?: 'partial' | 'complete' | 'not_started';
}

export interface FriendFilters {
  status?: FriendStatus;
  isOnline?: boolean;
  hasSharedTrades?: boolean;
  sortBy?: 'name' | 'lastActive' | 'disciplineScore' | 'sharedTrades';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ComparisonData {
  period1: ReportPeriod;
  period2: ReportPeriod;
  metrics1: TradingMetrics;
  metrics2: TradingMetrics;
  differences: Record<string, number>;
  insights: string[];
}

// =============================================================================
// TOAST MESSAGE TYPE
// =============================================================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

// =============================================================================
// NOTIFICATION TYPE
// =============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

// =============================================================================
// SYNC STATUS TYPE
// =============================================================================

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: Date;
  pendingItems: number;
  isSyncing: boolean;
  errors: string[];
  conflictCount: number;
}

// =============================================================================
// IMPORTED TYPES FROM MAIN INDEX
// =============================================================================

export type {
  User,
  UserProgress,
  AppSettings,
  NotificationSettings,
  Trade,
  TradeType,
  TradeStatus,
  Emotion,
  AIAnalysis,
  Achievement,
  AchievementType,
  AchievementRarity,
  AchievementCategory,
  Reward,
  Milestone,
  MilestoneType,
  TradingRule,
  RuleCategory,
  RulePriority,
  RuleCondition,
  RuleAction,
  NotificationChannel,
  Friend,
  FriendStatus,
  FriendRequest,
  ReportData,
  ReportPeriod,
  TradingMetrics,
  Insight,
  InsightType,
  ChartData,
  ChartType,
  ChartConfig,
  ProgressObject,
  ValidationResult,
  ApiResponse,
  ApiError,
  PaginationParams,
  ValidationRule,
  ValidationType,
  EventType,
  EventCategory,
  AnalyticsData,
  TrendData,
  OfflineQueueItem,
  SyncStatus,
  PWAInstallPrompt,
  PatternRecognitionResult,
  IndicatorData,
  Signal,
  Recommendation,
  RiskAssessment,
  RiskFactor,
} from './index';
