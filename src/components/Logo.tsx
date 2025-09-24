import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

/**
 * LockIn logo component with a modern lock icon design.
 * Features a gradient lock icon with clean typography.
 */
export default function Logo({ size = 40, showText = false, subtitle }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none" aria-label="LockIn logo">
      <div
        className="rounded-xl shadow-lg border border-red-500/20 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={Math.floor(size * 0.6)}
          height={Math.floor(size * 0.6)}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Lock body */}
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          {/* Lock shackle */}
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          {/* Keyhole */}
          <circle cx="12" cy="16" r="1" fill="white" />
        </svg>
      </div>

      {showText && (
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold">
            <span className="text-gray-900 dark:text-white">Lock</span>
            <span className="text-emerald-500">In</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle ?? 'Lock in your trading discipline'}</p>
        </div>
      )}
    </div>
  );
}
