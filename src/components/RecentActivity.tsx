import React, { useMemo, useState } from 'react';
import { CheckCircle, XCircle, TrendingUp, BookOpen } from 'lucide-react';

type LogItem = { ts: number; type: string; [k: string]: any };

function timeAgo(ts: number): string {
  try {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr>1?'s':''} ago`;
    const d = Math.floor(hr / 24);
    return `${d} day${d>1?'s':''} ago`;
  } catch { return ''; }
}

export default function RecentActivity() {
  const [showAll, setShowAll] = useState(false);
  const log = useMemo<LogItem[]>(() => {
    try {
      const raw = localStorage.getItem('activity_log') || '[]';
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr
        .filter((x) => x && typeof x.ts === 'number')
        .sort((a, b) => b.ts - a.ts);
    } catch { return []; }
  }, []);

  const iconFor = (t: string) => {
    switch (t) {
      case 'completion': return { Icon: CheckCircle, cls: 'text-green-500', title: 'Completion' };
      case 'violation': return { Icon: XCircle, cls: 'text-red-500', title: 'Violation' };
      case 'journal': return { Icon: BookOpen, cls: 'text-blue-500', title: 'Journal' };
      case 'growth': return { Icon: TrendingUp, cls: 'text-purple-500', title: 'Growth' };
      default: return { Icon: BookOpen, cls: 'text-gray-400', title: 'Activity' };
    }
  };

  const items = showAll ? log : log.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 text-sm">
          <p>No activity yet.</p>
          <p className="mt-1">Log trades or journal entries to see updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((it, idx) => {
            const meta = iconFor(it.type);
            const title = it.title || meta.title;
            const desc = it.description || '';
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <meta.Icon className={`h-5 w-5 ${meta.cls}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  {desc && <p className="text-xs text-gray-600">{desc}</p>}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(it.ts)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        onClick={() => setShowAll((v) => !v)}
        disabled={log.length === 0}
      >
        {showAll ? 'Hide activity' : 'View all activity'}
      </button>
    </div>
  );
}