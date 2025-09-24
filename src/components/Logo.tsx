
interface LogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

// Uses branded asset from public/ with fallback text
export default function Logo({ size = 40, showText = false, subtitle }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none" aria-label="LockIn logo">
      <div
        className="rounded-xl shadow-lg border border-red-500/20 bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Prefer the provided asset. Place lockin-logo.png in public/. */}
        <img
          src="/lockin-logo.png"
          alt="LockIn logo"
          className="object-contain"
          style={{ width: Math.floor(size * 0.9), height: Math.floor(size * 0.9) }}
          onError={(e) => {
            // Graceful fallback to simple text if asset missing
            const target = e.currentTarget as HTMLImageElement;
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
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle ?? 'Lock in your trading discipline'}</p>
        </div>
      )}
    </div>
  );
}
