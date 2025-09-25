import React from 'react';

interface LogoProps {
  showText?: boolean;
  subtitle?: string;
  frame?: 'none' | 'card';
}

// Uses branded asset from public/ with fallback text
export default function Logo({ showText = false, subtitle, frame = 'card' }: LogoProps) {
  const ver = 'v2';
  return (
    <div className="flex items-center gap-3 select-none" aria-label="LockIn logo">
      <div
        className={`${frame === 'card' ? 'p-0 rounded-xl shadow-lg border border-red-500/20 bg-transparent' : 'p-0 bg-transparent'} w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center overflow-hidden`}
      >
        <img
          src={`/lockin-logo.png.png?${ver}`}
          alt="LockIn logo"
          className={'object-cover w-full h-full'}
          style={{ filter: 'brightness(1.1) contrast(1.1) drop-shadow-sm' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.currentTarget as HTMLImageElement & { dataset: { fallbackStep?: string } };
            const step = Number(target.dataset.fallbackStep || '0');
            // png -> jpg -> svg
            if (step === 0) { target.dataset.fallbackStep = '1'; target.src = `/lockin-logo.jpg?${ver}`; return; }
            if (step === 1) { target.dataset.fallbackStep = '2'; target.src = `/logo-trade-game.svg?${ver}`; return; }
            // Final fallback: hide image; text portion below can still render if enabled
            target.style.display = 'none';
          }}
        />
      </div>

      {showText && (
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold">
            <span className="text-gray-900 dark:text-white">Lock</span>
            <span className="text-emerald-500">In</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-300">{subtitle ?? 'Lock in your trading discipline'}</p>
        </div>
      )}
    </div>
  );
}
