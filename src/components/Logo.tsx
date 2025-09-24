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
          width={Math.floor(size * 0.85)}
          height={Math.floor(size * 0.85)}
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
          {/* Centered group for composition */}
          <g transform="translate(32,32)">
            {/* Subtle chart crosshair */}
            <g opacity="0.18" stroke="#e5e7eb">
              <path d="M-24 0 H24" />
              <path d="M0 -24 V24" />
            </g>

            {/* Controller at center (slightly rotated from impact) */}
            <g transform="translate(4,6) rotate(8)">
              <rect x="-18" y="-8" width="36" height="16" rx="8" fill="#c7d2fe" opacity="0.98" />
              <circle cx="-14" cy="6" r="6" fill="#c7d2fe" opacity="0.98" />
              <circle cx="14" cy="6" r="6" fill="#c7d2fe" opacity="0.98" />
              {/* D-pad */}
              <rect x="-13" y="-5" width="3.5" height="10" rx="1" fill="#94a3b8" />
              <rect x="-16" y="-2" width="10" height="3.5" rx="1" fill="#94a3b8" />
              {/* AB buttons */}
              <circle cx="8" cy="-2" r="2.4" fill="#6366f1" />
              <circle cx="12" cy="2" r="2.4" fill="#10b981" />
              {/* Crack at impact */}
              <path d="M-2 -4 L0 -1 L-1 2 L2 4" stroke="#64748b" strokeWidth="1.2" fill="none" />
            </g>

            {/* Hammer candlestick swinging in (rotated) */}
            <g transform="translate(-8,-10) rotate(-28)">
              {/* Wick (long lower) */}
              <rect x="-2" y="-14" width="4" height="36" rx="2" fill="#e5e7eb" opacity="0.95" />
              {/* Small body near top */}
              <rect x="-6" y="-14" width="12" height="10" rx="3" fill="url(#lg)" />
            </g>

            {/* Impact burst/debris */}
            <g opacity="0.85">
              <circle cx="2" cy="2" r="6.5" fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.7" />
              <path d="M-8 -2 l-3 -2" stroke="#93c5fd" strokeWidth="2" />
              <path d="M10 -4 l3 -2" stroke="#93c5fd" strokeWidth="2" />
              <path d="M-4 10 l-2 3" stroke="#93c5fd" strokeWidth="2" />
              <path d="M12 8 l2 3" stroke="#93c5fd" strokeWidth="2" />
            </g>
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
