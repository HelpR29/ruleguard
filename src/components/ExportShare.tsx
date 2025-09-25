import React, { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportShareProps {
  weeklyData: Array<{ day: string; completions: number; violations: number; pnl: number }>;
  monthlyData: Array<{ date: string; day: string; completions: number; violations: number; pnl: number }>;
  completionData: Array<{ date: string; completions: number; violations: number }>;
  averageRR: number;
  progress: any;
  topRiskyHours: Array<{ day: string; hour: number; count: number }>;
  topTags: Array<[string, number]>;
}

export const ExportShare = React.memo(({
  weeklyData,
  monthlyData,
  completionData,
  averageRR,
  progress,
  topRiskyHours,
  topTags
}: ExportShareProps) => {
  const [shareUrl, setShareUrl] = useState<string>('');

  const toCSV = (rows: Array<Record<string, any>>) => {
    if (!rows.length) return '';
    const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    const esc = (v: any) => {
      const s = String(v ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const lines = [headers.join(',')].concat(
      rows.map(r => headers.map(h => esc(r[h])).join(','))
    );
    return lines.join('\n');
  };

  const downloadFile = (content: BlobPart, mime: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
    } catch {}
  };

  const exportCSV = (type: 'weekly' | 'monthly' | 'completion') => {
    let rows: Array<Record<string, any>> = [];
    if (type === 'weekly') rows = weeklyData.map(d => ({ day: d.day, completions: d.completions, violations: d.violations, pnl: d.pnl }));
    if (type === 'monthly') rows = monthlyData.map(d => ({ date: d.date, day: d.day, completions: d.completions, violations: d.violations, pnl: d.pnl }));
    if (type === 'completion') rows = completionData.map(d => ({ date: d.date, completions: d.completions, violations: d.violations }));
    downloadFile(toCSV(rows), 'text/csv;charset=utf-8', `lockin-${type}-report.csv`);
  };

  const buildShareCard = async (forPrint: boolean = false) => {
    const width = 1200, height = 630;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine theme by PnL
    const totalPnl = weeklyData.reduce((s, d) => s + d.pnl, 0);
    const isGain = totalPnl >= 0;
    const bg1 = isGain ? '#064e3b' : '#7f1d1d';
    const bg2 = isGain ? '#10b981' : '#ef4444';

    // Background gradient
    const grad = ctx.createLinearGradient(0,0,width,height);
    grad.addColorStop(0, bg1);
    grad.addColorStop(1, bg2);
    ctx.fillStyle = grad; ctx.fillRect(0,0,width,height);

    // Card panel
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(40,40,width-80,height-80);

    // Brand strip
    ctx.fillStyle = '#111827';
    ctx.fillRect(40,40,width-80,60);

    // Logo (best-effort)
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/lockin-logo.png';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      const logoW = 120;
      const logoH = 36;
      ctx.drawImage(img, 54, 52, logoW, logoH);
    } catch {}

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    const dn = (localStorage.getItem('display_name') || '').trim();
    const brand = dn ? `LockIn • ${dn}` : 'LockIn';
    ctx.fillText(brand, 110, 80);

    ctx.fillStyle = '#111827';
    ctx.font = '700 44px Inter, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillText('LockIn Weekly Report', 70, 140);

    // Discipline & Avg R:R
    ctx.font = '600 28px Inter';
    ctx.fillText(`Discipline Score: ${progress.disciplineScore}%`, 70, 200);
    if (averageRR > 0) {
      ctx.fillText(`Avg R:R: 1:${averageRR.toFixed(2)}`, 650, 200);
    }

    // Big PnL figure
    const pnlText = `${isGain ? '+' : '−'}$${Math.abs(totalPnl).toLocaleString()}`;
    ctx.font = '800 72px Inter, system-ui';
    ctx.fillStyle = isGain ? '#10b981' : '#ef4444';
    ctx.fillText(pnlText, 70, 290);

    // Top risky hours
    ctx.font = '700 24px Inter'; ctx.fillStyle = '#111827'; ctx.fillText('Top Risky Hours', 70, 350);
    ctx.font = '400 20px Inter'; ctx.fillStyle = '#1f2937';
    topRiskyHours.slice(0,3).forEach((e, i) => {
      ctx.fillText(`${i+1}. ${e.day} ${e.hour}:00 (${e.count})`, 70, 380 + i*28);
    });

    // Top tags
    ctx.font = '700 24px Inter'; ctx.fillStyle = '#111827'; ctx.fillText('Top Tags', 650, 350);
    ctx.font = '400 20px Inter'; ctx.fillStyle = '#1f2937';
    topTags.slice(0,3).forEach(([tag, cnt], i) => {
      ctx.fillText(`${i+1}. ${tag} (${cnt})`, 650, 380 + i*28);
    });

    // Footer
    ctx.font = '400 18px Inter';
    ctx.fillStyle = '#374151';
    ctx.fillText('lockin.app • Share your discipline progress', 70, height-70);

    const url = canvas.toDataURL('image/png');
    setShareUrl(url);

    if (forPrint) {
      const w = window.open('about:blank', '_blank');
      if (w) {
        w.document.write(`<html><head><title>LockIn Report</title><style>body{margin:0;display:grid;place-items:center;background:#fff}</style></head><body><img src="${url}" style="max-width:100%;height:auto" onload="window.print(); setTimeout(()=>window.close(), 300);"/></body></html>`);
        w.document.close();
      }
      return;
    }

    try {
      if (navigator.share && navigator.canShare) {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], 'lockin-report.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: 'My LockIn Weekly Report' });
        }
      }
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => buildShareCard()} className="flex items-center gap-2 accent-btn">
        <Download className="h-4 w-4" />
        Share
      </button>
      <button onClick={() => buildShareCard(true)} className="flex items-center gap-2 accent-outline">
        <Download className="h-4 w-4" />
        Export PDF
      </button>
      <button onClick={() => exportCSV('weekly')} className="flex items-center gap-2 accent-outline">
        <Download className="h-4 w-4" />
        Export CSV
      </button>
    </div>
  );
});

ExportShare.displayName = 'ExportShare';
