import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LiveTradeChartProps {
  entry: string;
  exit: string;
  target: string;
  stop: string;
}

export default function LiveTradeChart({ entry, exit, target, stop }: LiveTradeChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const entryNum = parseFloat(entry) || 0;
  const exitNum = parseFloat(exit) || 0;
  const targetNum = parseFloat(target) || 0;
  const stopNum = parseFloat(stop) || 0;

  if (!mounted) {
    return <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />;
  }

  // Calculate P&L and percentages
  const pnl = exitNum && entryNum ? exitNum - entryNum : 0;
  const pnlPercent = entryNum > 0 ? (pnl / entryNum) * 100 : 0;
  const isProfit = pnl > 0;
  const isLoss = pnl < 0;

  return (
    <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Live Trade</span>
        <div className="flex items-center gap-1">
          {isProfit && <TrendingUp className="h-3 w-3 text-green-500" />}
          {isLoss && <TrendingDown className="h-3 w-3 text-red-500" />}
          {!isProfit && !isLoss && <Minus className="h-3 w-3 text-gray-400" />}
        </div>
      </div>

      <div className="space-y-1 text-xs">
        {entryNum > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Entry:</span>
            <span className="font-mono text-blue-600">${entryNum.toFixed(2)}</span>
          </div>
        )}
        {exitNum > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Exit:</span>
            <span className="font-mono text-purple-600">${exitNum.toFixed(2)}</span>
          </div>
        )}
        {targetNum > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Target:</span>
            <span className="font-mono text-green-600">${targetNum.toFixed(2)}</span>
          </div>
        )}
        {stopNum > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Stop:</span>
            <span className="font-mono text-red-600">${stopNum.toFixed(2)}</span>
          </div>
        )}
        {pnl !== 0 && (
          <div className="flex justify-between pt-1 border-t border-gray-200">
            <span className="text-gray-500">P&L:</span>
            <span className={`font-mono font-bold ${isProfit ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-600'}`}>
              {isProfit ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>

      {(entryNum === 0 && exitNum === 0 && targetNum === 0 && stopNum === 0) && (
        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
          Enter trade details to see preview
        </div>
      )}
    </div>
  );
}
