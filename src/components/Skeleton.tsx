import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  lines?: number;
}

export function Skeleton({ className = '', variant = 'rectangular', lines = 1 }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  if (variant === 'circular') {
    return <div className={`rounded-full ${baseClasses} ${className}`} />;
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded ${baseClasses}`}
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    );
  }

  return <div className={`rounded-lg ${baseClasses} ${className}`} />;
}

interface CardSkeletonProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
}

export function CardSkeleton({ hasImage = false, hasAvatar = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div className="rounded-2xl p-6 card-surface">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {hasAvatar && <Skeleton variant="circular" className="w-10 h-10" />}
          <div className="flex-1">
            <Skeleton variant="text" lines={1} />
          </div>
        </div>

        {/* Content */}
        {hasImage && <Skeleton variant="rectangular" className="w-full h-32" />}
        <Skeleton variant="text" lines={lines} />

        {/* Actions */}
        <div className="flex gap-2">
          <Skeleton variant="rectangular" className="w-20 h-8" />
          <Skeleton variant="rectangular" className="w-16 h-8" />
        </div>
      </div>
    </div>
  );
}

interface ListSkeletonProps {
  items?: number;
  hasAvatar?: boolean;
}

export function ListSkeleton({ items = 5, hasAvatar = false }: ListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
          {hasAvatar && <Skeleton variant="circular" className="w-10 h-10" />}
          <div className="flex-1">
            <Skeleton variant="text" lines={2} />
          </div>
          <Skeleton variant="rectangular" className="w-16 h-8" />
        </div>
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="rounded-2xl overflow-hidden card-surface">
      {/* Header */}
      <div className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-800" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant="text" lines={1} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 p-4 border-t border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" lines={1} />
          ))}
        </div>
      ))}
    </div>
  );
}
