/**
 * Analytics Filters Component
 * Advanced filtering and date range selection for analytics data
 */

import React, { useState, useCallback } from 'react';
import {
  Calendar,
  Filter,
  X,
  ChevronDown,
  Search,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Trade, Emotion } from '../types';

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
  tags?: string[];
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  trades: Trade[];
  isOpen: boolean;
  onToggle: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const FilterSection = ({ title, children, isExpanded, onToggle }: FilterSectionProps) => (
  <div className="border border-gray-200 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50:bg-gray-700 transition-colors"
    >
      <span className="font-medium text-gray-900">{title}</span>
      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
    </button>

    {isExpanded && (
      <div className="px-4 pb-4 border-t border-gray-200">
        {children}
      </div>
    )}
  </div>
);

export default function AnalyticsFiltersComponent({
  filters,
  onFiltersChange,
  trades,
  isOpen,
  onToggle
}: AnalyticsFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    dateRange: true,
    symbols: false,
    tradeTypes: false,
    emotions: false,
    pnl: false,
    compliance: false
  });

  // Extract unique values from trades for filter options
  const availableSymbols = useMemo(() =>
    Array.from(new Set(trades.map(t => t.symbol))).sort(),
    [trades]
  );

  const availableTradeTypes = useMemo(() =>
    Array.from(new Set(trades.map(t => t.type))).filter(Boolean).sort(),
    [trades]
  );

  const availableEmotions = useMemo(() =>
    Array.from(new Set(trades.flatMap(t => t.emotions || []))).sort(),
    [trades]
  );

  const availableTags = useMemo(() =>
    Array.from(new Set(trades.flatMap(t => t.tags || []))).filter(Boolean).sort(),
    [trades]
  );

  const pnlRange = useMemo(() => {
    const pnls = trades.map(t => t.profitLoss || 0);
    return {
      min: Math.min(...pnls),
      max: Math.max(...pnls)
    };
  }, [trades]);

  const handleFilterChange = useCallback((updates: Partial<AnalyticsFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  }, [filters, onFiltersChange]);

  const handleSymbolToggle = useCallback((symbol: string) => {
    const newSymbols = filters.symbols.includes(symbol)
      ? filters.symbols.filter(s => s !== symbol)
      : [...filters.symbols, symbol];
    handleFilterChange({ symbols: newSymbols });
  }, [filters.symbols, handleFilterChange]);

  const handleTradeTypeToggle = useCallback((type: string) => {
    const newTypes = filters.tradeTypes.includes(type)
      ? filters.tradeTypes.filter(t => t !== type)
      : [...filters.tradeTypes, type];
    handleFilterChange({ tradeTypes: newTypes });
  }, [filters.tradeTypes, handleFilterChange]);

  const handleEmotionToggle = useCallback((emotion: string) => {
    const newEmotions = filters.emotions.includes(emotion)
      ? filters.emotions.filter(e => e !== emotion)
      : [...filters.emotions, emotion];
    handleFilterChange({ emotions: newEmotions });
  }, [filters.emotions, handleFilterChange]);

  const handleTagToggle = useCallback((tag: string) => {
    const newTags = filters.tags?.includes(tag)
      ? (filters.tags || []).filter(t => t !== tag)
      : [...(filters.tags || []), tag];
    handleFilterChange({ tags: newTags });
  }, [filters.tags, handleFilterChange]);

  const handleReset = useCallback(() => {
    onFiltersChange({
      dateRange: '30d',
      symbols: [],
      tradeTypes: [],
      emotions: [],
      ruleCompliant: undefined,
      tags: []
    });
  }, [onFiltersChange]);

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Filter className="h-4 w-4" />
        Filters
        {(filters.symbols.length > 0 || filters.tradeTypes.length > 0 ||
          filters.emotions.length > 0 || filters.tags?.length || filters.ruleCompliant !== undefined) && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {filters.symbols.length + filters.tradeTypes.length + filters.emotions.length +
             (filters.tags?.length || 0) + (filters.ruleCompliant !== undefined ? 1 : 0)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Analytics Filters</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50:bg-gray-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.symbols.length > 0 || filters.tradeTypes.length > 0 ||
        filters.emotions.length > 0 || filters.tags?.length || filters.ruleCompliant !== undefined) && (
        <div className="flex flex-wrap gap-2">
          {filters.symbols.map(symbol => (
            <span key={symbol} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {symbol}
              <button onClick={() => handleSymbolToggle(symbol)} className="hover:text-blue-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filters.tradeTypes.map(type => (
            <span key={type} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              {type}
              <button onClick={() => handleTradeTypeToggle(type)} className="hover:text-green-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filters.emotions.map(emotion => (
            <span key={emotion} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              {emotion}
              <button onClick={() => handleEmotionToggle(emotion)} className="hover:text-purple-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filters.tags?.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
              {tag}
              <button onClick={() => handleTagToggle(tag)} className="hover:text-orange-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filters.ruleCompliant !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
              {filters.ruleCompliant ? 'Rule Compliant' : 'Rule Violations'}
              <button onClick={() => handleFilterChange({ ruleCompliant: undefined })} className="hover:text-gray-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range Section */}
        <FilterSection
          title="Date Range"
          isExpanded={expandedSections.dateRange}
          onToggle={() => toggleSection('dateRange')}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
                { value: '1y', label: 'Last year' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange({ dateRange: value as AnalyticsFilters['dateRange'] })}
                  className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                    filters.dateRange === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleFilterChange({
                      startDate: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleFilterChange({
                      endDate: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </FilterSection>

        {/* Symbols Section */}
        <FilterSection
          title="Symbols"
          isExpanded={expandedSections.symbols}
          onToggle={() => toggleSection('symbols')}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableSymbols.map(symbol => (
              <label key={symbol} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.symbols.includes(symbol)}
                  onChange={() => handleSymbolToggle(symbol)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{symbol}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Trade Types Section */}
        <FilterSection
          title="Trade Types"
          isExpanded={expandedSections.tradeTypes}
          onToggle={() => toggleSection('tradeTypes')}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTradeTypes.map(type => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.tradeTypes.includes(type)}
                  onChange={() => handleTradeTypeToggle(type)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Emotions Section */}
        <FilterSection
          title="Emotions"
          isExpanded={expandedSections.emotions}
          onToggle={() => toggleSection('emotions')}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableEmotions.map(emotion => (
              <label key={emotion} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.emotions.includes(emotion)}
                  onChange={() => handleEmotionToggle(emotion)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{emotion}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* P&L Range Section */}
        <FilterSection
          title="P&L Range"
          isExpanded={expandedSections.pnl}
          onToggle={() => toggleSection('pnl')}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min P&L: ${filters.minPnL || pnlRange.min}
              </label>
              <input
                type="range"
                min={pnlRange.min}
                max={pnlRange.max}
                value={filters.minPnL || pnlRange.min}
                onChange={(e) => handleFilterChange({ minPnL: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max P&L: ${filters.maxPnL || pnlRange.max}
              </label>
              <input
                type="range"
                min={pnlRange.min}
                max={pnlRange.max}
                value={filters.maxPnL || pnlRange.max}
                onChange={(e) => handleFilterChange({ maxPnL: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </FilterSection>

        {/* Rule Compliance Section */}
        <FilterSection
          title="Rule Compliance"
          isExpanded={expandedSections.compliance}
          onToggle={() => toggleSection('compliance')}
        >
          <div className="space-y-2">
            {[
              { value: undefined, label: 'All Trades' },
              { value: true, label: 'Rule Compliant Only' },
              { value: false, label: 'Rule Violations Only' }
            ].map(({ value, label }) => (
              <label key={label} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ruleCompliant"
                  checked={filters.ruleCompliant === value}
                  onChange={() => handleFilterChange({ ruleCompliant: value })}
                  className="border-gray-300"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Apply Filters Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onToggle}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// Import useMemo for the calculations
import { useMemo } from 'react';
