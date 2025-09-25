import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  showClearButton?: boolean;
  disabled?: boolean;
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  className = '',
  showClearButton = true,
  disabled = false
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-500 dark:text-gray-300" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {showClearButton && localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    options: FilterOption[];
    value: string[];
    onChange: (values: string[]) => void;
    multiple?: boolean;
  }[];
  resultsCount?: number;
  className?: string;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  filters = [],
  resultsCount,
  className = ''
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search trades, symbols, notes..."
          />
        </div>
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {resultsCount} result{resultsCount !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filters.map((filter, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {filter.label}
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filter.options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <input
                        type={filter.multiple ? 'checkbox' : 'radio'}
                        name={filter.multiple ? undefined : `filter-${index}`}
                        checked={filter.multiple
                          ? filter.value.includes(option.value)
                          : filter.value[0] === option.value
                        }
                        onChange={(e) => {
                          if (filter.multiple) {
                            const newValues = e.target.checked
                              ? [...filter.value, option.value]
                              : filter.value.filter(v => v !== option.value);
                            filter.onChange(newValues);
                          } else {
                            filter.onChange(e.target.checked ? [option.value] : []);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {option.label}
                        {option.count !== undefined && (
                          <span className="ml-1 text-gray-500 dark:text-gray-300">
                            ({option.count})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for search and filtering
export function useSearchAndFilter<T>(
  items: T[],
  searchFields: (keyof T)[],
  filterOptions?: {
    key: keyof T;
    options: { value: string; label: string }[];
  }[]
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply other filters
    Object.entries(activeFilters).forEach(([filterKey, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(item => {
          const itemValue = item[filterKey as keyof T];
          return values.includes(String(itemValue));
        });
      }
    });

    return filtered;
  }, [items, searchQuery, activeFilters, searchFields]);

  const updateFilter = (filterKey: string, values: string[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: values
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    activeFilters,
    updateFilter,
    clearFilters,
    clearSearch,
    resultsCount: filteredItems.length
  };
}
