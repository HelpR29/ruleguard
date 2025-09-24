import React from 'react';

type PnlCardProps = {
  title?: string;
  subtitle?: string;
  pnl: number; // dollar PnL
  rr?: number; // average R:R or trade R:R
  entry?: number;
  exit?: number;
  target?: number | null;
  stop?: number | null;
  avatar?: string; // emoji or data/url
  timeframe?: string;
  date?: string;
  className?: string;
  variant?: 'card' | 'tile';
};

export default function PnlCard({
  title = 'Performance',
  subtitle,
  pnl,
  rr,
  entry,
  exit,
  target,
  stop,
  avatar,
  timeframe,
  date,
  className = '',
  variant = 'card'
}: PnlCardProps) {
  const isGain = pnl >= 0;
  const bgFrom = isGain ? 'from-emerald-800' : 'from-rose-800';
  const bgTo = isGain ? 'to-emerald-500' : 'to-rose-500';
  const bigColor = isGain ? 'text-emerald-400' : 'text-rose-400';
  const pillColor = isGain ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200';

  const avatarChar = avatar || (typeof window !== 'undefined' ? (localStorage.getItem('user_avatar') || '👤') : '👤');

  if (variant === 'tile') {
    // Compact white tile to blend with metric tiles
    return (
      <div className={`h-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500">{timeframe || 'This Week'}</p>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: isGain ? '0 0 14px rgba(16,185,129,0.35)' : '0 0 14px rgba(239,68,68,0.35)' }} />
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white">
              {avatarChar.startsWith('data:') || avatarChar.startsWith('http') || /\.(png|jpg|jpeg|webp|svg)$/.test(avatarChar) ? (
                <img src={avatarChar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-xl"><span>{avatarChar}</span></div>
              )}
              <div className={`absolute inset-0 ${isGain ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}></div>
            </div>
          </div>
        </div>
        <div className={`mt-3 text-3xl font-extrabold ${isGain ? 'text-emerald-600' : 'text-rose-600'}`}>{`${isGain ? '+' : '-'}$${Math.abs(pnl).toLocaleString()}`}</div>
        {typeof rr === 'number' && rr > 0 && (
          <div className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[11px] border ${pillColor}`}>Avg R:R 1:{rr.toFixed(2)}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-sm bg-gradient-to-br ${bgFrom} ${bgTo} ${className}`}>
      {/* Panel */}
      <div className="backdrop-blur-sm bg-white/90 m-3 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-600">{timeframe || 'Weekly PnL'}</p>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
          {/* Avatar */}
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full" style={{
              boxShadow: isGain ? '0 0 40px rgba(16,185,129,0.5)' : '0 0 40px rgba(239,68,68,0.5)'
            }}></div>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-white/50">
              {avatarChar.startsWith('data:') || avatarChar.startsWith('http') || /\.(png|jpg|jpeg|webp|svg)$/.test(avatarChar) ? (
                <img src={avatarChar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-6xl">
                  <span>{avatarChar}</span>
                </div>
              )}
              {/* Tint overlay */}
              <div className={`absolute inset-0 ${isGain ? 'bg-emerald-400/10' : 'bg-rose-400/10'}`}></div>
            </div>
          </div>
        </div>

        {/* Big PnL */}
        <div className={`mt-3 text-5xl font-extrabold ${bigColor}`}>{`${isGain ? '+' : '-'}$${Math.abs(pnl).toLocaleString()}`}</div>
        {typeof rr === 'number' && rr > 0 && (
          <div className={`inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs border ${pillColor}`}>Avg R:R 1:{rr.toFixed(2)}</div>
        )}

        {/* Levels row */}
        {(entry || exit || target || stop) && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {typeof entry === 'number' && (
              <div><span className="text-gray-500">Entry:</span> <span className="font-medium">${entry}</span></div>
            )}
            {typeof exit === 'number' && (
              <div><span className="text-gray-500">Exit:</span> <span className="font-medium">${exit}</span></div>
            )}
            {typeof target === 'number' && (
              <div><span className="text-gray-500">Target:</span> <span className="font-medium">${target}</span></div>
            )}
            {typeof stop === 'number' && (
              <div><span className="text-gray-500">Stop:</span> <span className="font-medium">${stop}</span></div>
            )}
          </div>
        )}

        {date && <p className="mt-3 text-xs text-gray-500">{date}</p>}
      </div>
    </div>
  );
}
