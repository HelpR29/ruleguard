import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

/**
 * Logo component that combines a stock chart hammer candlestick with a gaming controller.
 * - Left: hammer-style bullish candlestick (small body near the top, long lower wick).
 * - Right: compact controller silhouette with D-pad and AB buttons.
 * - Subtle chart grid ties both concepts together.
 */
export default function Logo({ size = 40, showText = false, subtitle }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none" aria-label="RuleGuard logo">
      <div
        className="rounded-xl shadow-lg border border-blue-500/20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={Math.floor(size * 0.7)}
          height={Math.floor(size * 0.7)}
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          {/* Subtle chart grid */}
          <g opacity="0.25" stroke="#e5e7eb">
            <path d="M8 16 H56" />
            <path d="M8 28 H56" />
            <path d="M8 40 H56" />
            <path d="M8 52 H56" />
          </g>

          {/* Hammer Candlestick (left) */}
          <g>
            {/* Long lower wick */}
            <rect x="14" y="12" width="4" height="44" rx="2" fill="#e5e7eb" opacity="0.9" />
            {/* Small body near top (hammer) */}
            <rect x="10" y="12" width="12" height="10" rx="3" fill="url(#lg)" />
          </g>

          {/* Controller silhouette (right) */}
          <g transform="translate(30,18)">
            {/* Body */}
            <rect x="0" y="6" width="26" height="14" rx="7" fill="#c7d2fe" opacity="0.95" />
            {/* Grips */}
            <circle cx="4" cy="17" r="5" fill="#c7d2fe" opacity="0.95" />
            <circle cx="22" cy="17" r="5" fill="#c7d2fe" opacity="0.95" />
            {/* D-pad */}
            <rect x="4" y="9" width="3" height="9" rx="1" fill="#94a3b8" />
            <rect x="2" y="11" width="7" height="3" rx="1" fill="#94a3b8" />
            {/* AB buttons */}
            <circle cx="19" cy="12" r="2.2" fill="#6366f1" />
            <circle cx="22.5" cy="15.5" r="2.2" fill="#10b981" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">RuleGuard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle ?? 'Trading discipline with a gamer edge'}</p>
        </div>
      )}
    </div>
  );
}
