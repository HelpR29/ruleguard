import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

/**
 * Logo component that combines a stock candlestick motif with a gaming D-pad.
 * - The left side shows an upward green candlestick with wicks.
 * - The right side shows a subtle controller D-pad/cross.
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
          {/* Candlestick (left) */}
          <g>
            {/* Wick */}
            <rect x="12" y="12" width="4" height="40" rx="2" fill="#e5e7eb" opacity="0.9" />
            {/* Body (bullish) */}
            <rect x="8" y="22" width="12" height="22" rx="3" fill="url(#lg)" />
          </g>

          {/* D-pad (right) */}
          <g transform="translate(30,16)">
            <rect x="6" y="0" width="8" height="16" rx="2" fill="#c7d2fe" opacity="0.9" />
            <rect x="0" y="6" width="20" height="8" rx="2" fill="#c7d2fe" opacity="0.9" />
            {/* subtle circle to tie elements */}
            <circle cx="10" cy="10" r="12" stroke="#93c5fd" strokeWidth="2" fill="none" opacity="0.6" />
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
