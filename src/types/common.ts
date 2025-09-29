/**
 * Common utility types and interfaces used throughout the LockIn application
 * Provides reusable types for forms, components, and general application logic
 */

import React from 'react';

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
  id?: string;
  style?: React.CSSProperties;
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  error?: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: any;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: any; label: string; disabled?: boolean }>;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  className?: string;
  'data-testid'?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// =============================================================================
// MODAL & DIALOG TYPES
// =============================================================================

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface ConfirmDialogProps extends Omit<ModalProps, 'title' | 'footer'> {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'danger' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
}

// =============================================================================
// TABLE & LIST TYPES
// =============================================================================

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
  hidden?: boolean;
  sortKey?: string;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortState;
  selection?: {
    selectedRows: T[];
    onSelectionChange: (selectedRows: T[]) => void;
    selectable?: (record: T) => boolean;
  };
  onSort?: (sortState: SortState) => void;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: keyof T | ((record: T) => string);
  emptyText?: string;
  showHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  hoverable?: boolean;
}

export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: string | React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

// =============================================================================
// CHART & VISUALIZATION TYPES
// =============================================================================

export interface ChartProps extends BaseComponentProps {
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'doughnut';
  xAxisKey?: string;
  yAxisKey?: string;
  height?: number;
  width?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animation?: boolean;
  loading?: boolean;
  emptyText?: string;
}

export interface MetricCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  loading?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

// =============================================================================
// NOTIFICATION & TOAST TYPES
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

export interface ToastProps extends BaseComponentProps {
  message: ToastMessage;
  onClose: (id: string) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export interface NotificationProps {
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
// HOOK RETURN TYPES
// =============================================================================

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export interface UsePaginationReturn<T> {
  data: T[];
  pagination: PaginationState;
  loading: boolean;
  error: Error | null;
  loadMore: () => void;
  refresh: () => void;
  goToPage: (page: number) => void;
  changeLimit: (limit: number) => void;
}

export interface UseFormReturn<T> {
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

// =============================================================================
// THEME & STYLING TYPES
// =============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  light: string;
  darkMode: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: {
    light: string;
    default: string;
    darkMode: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  spacing: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  borderRadius: Record<string, string>;
  breakpoints: Record<string, string>;
  zIndex: Record<string, number>;
  animations: Record<string, string>;
}

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// =============================================================================
// ERROR & EXCEPTION TYPES
// =============================================================================

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
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
    timestamp?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  path?: string;
  method?: string;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// =============================================================================
// EVENT & ANALYTICS TYPES
// =============================================================================

export interface EventHandler<T = any> {
  (event: T): void;
}

export interface EventMap {
  [key: string]: EventHandler;
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
  timestamp: Date;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
}

// =============================================================================
// ACCESSIBILITY TYPES
// =============================================================================

export interface ARIAProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
  'aria-readonly'?: boolean;
  'aria-multiselectable'?: boolean;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-details'?: string;
  'aria-errormessage'?: string;
  'aria-flowto'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-keyshortcuts'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-owns'?: string;
  'aria-placeholder'?: string;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-valuemax'?: number;
  'aria-valuemin'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  role?: string;
}

export interface KeyboardNavigationProps {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  tabIndex?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

// =============================================================================
// INTERNATIONALIZATION TYPES
// =============================================================================

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

export interface TranslationMap {
  [language: string]: TranslationKey;
}

export interface I18nConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  translations: TranslationMap;
  dateLocale?: any;
  numberFormat?: Intl.NumberFormatOptions;
}

// =============================================================================
// PWA & OFFLINE TYPES
// =============================================================================

export interface ServiceWorkerMessage {
  type: string;
  payload?: any;
}

export interface UpdateAvailableEvent {
  type: 'UPDATE_AVAILABLE';
  version: string;
  changelog?: string[];
}

export interface OfflineStatusEvent {
  type: 'OFFLINE_STATUS_CHANGED';
  isOnline: boolean;
}

export interface SyncEvent {
  type: 'SYNC_COMPLETED' | 'SYNC_FAILED';
  data?: any;
  error?: Error;
}

// =============================================================================
// TESTING TYPES
// =============================================================================

export interface MockData<T = any> {
  data: T;
  delay?: number;
  error?: Error | string;
  status?: number;
}

export interface TestProps {
  'data-testid'?: string;
  'data-test-id'?: string;
  'data-test-value'?: any;
  'data-test-error'?: boolean;
  'data-test-loading'?: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

export type ElementType<T> = T extends React.ComponentType<any> ? T : React.ComponentType<T>;

export type ValueOf<T> = T[keyof T];

export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

// =============================================================================
// BRAND TYPES (for type safety)
// =============================================================================

export type UserId = string & { readonly __brand: 'UserId' };
export type TradeId = string & { readonly __brand: 'TradeId' };
export type RuleId = string & { readonly __brand: 'RuleId' };
export type AchievementId = string & { readonly __brand: 'AchievementId' };
export type FriendId = string & { readonly __brand: 'FriendId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type NotificationId = string & { readonly __brand: 'NotificationId' };

// =============================================================================
// CONSTANTS
// =============================================================================

export const THEME_COLORS = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
} as const;

export const BREAKPOINTS = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;
