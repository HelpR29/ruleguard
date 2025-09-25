interface LogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

// Uses branded asset from public/ with fallback text
export default function Logo({ size = 40, showText = false, subtitle }: LogoProps) {
  const isSmallTile = size <= 56;
  return (
    <div className="flex items-center gap-3 select-none" aria-label="LockIn logo">
      <div
        className="rounded-xl shadow-lg border border-red-500/20 bg-white dark:bg-gray-900 flex items-center justify-center p-1"
        style={{ width: size, height: size }}
      >
        {/* For very small sizes, render a crisp inline SVG mark for clarity */}
        {size < 28 ? (
          <svg
            width={Math.floor(size * 0.8)}
            height={Math.floor(size * 0.8)}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fill="#ef4444" d="M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 7V7a3 3 0 1 1 6 0v2H9Z"/>
            <circle cx="12" cy="15" r="2" fill="#ef4444" />
          </svg>
        ) : (
          <>
            <img
              src={isSmallTile ? '/logo-trade-game.svg' : '/lockin-logo.png'}
              alt="LockIn logo"
              className="object-contain"
              style={{ maxWidth: '90%', maxHeight: '90%', width: '100%', height: '100%' }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.currentTarget as HTMLImageElement & { dataset: { fallbackStep?: string } };
                const step = Number(target.dataset.fallbackStep || '0');
                if (isSmallTile) {
                  // svg -> png -> jpg
                  if (step === 0) { target.dataset.fallbackStep = '1'; target.src = '/lockin-logo.png'; return; }
                  if (step === 1) { target.dataset.fallbackStep = '2'; target.src = '/lockin-logo.jpg'; return; }
                } else {
                  // png -> jpg -> svg
                  if (step === 0) { target.dataset.fallbackStep = '1'; target.src = '/lockin-logo.jpg'; return; }
                  if (step === 1) { target.dataset.fallbackStep = '2'; target.src = '/logo-trade-game.svg'; return; }
                }
                // Final fallback: hide image; text portion below can still render if enabled
                target.style.display = 'none';
              }}
            />
          </>
        )}
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
