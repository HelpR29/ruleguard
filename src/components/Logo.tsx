import React from 'react';
import { Lock } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  subtitle?: string;
}

export default function Logo({ className = "", showText = true, subtitle }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
        <Lock className="h-5 w-5 text-white" />
        {/* Candlestick accent */}
        <div className="absolute -top-1 -right-1 w-2 h-3 bg-green-500 rounded-sm opacity-90 shadow-sm"></div>
      </div>
      {showText && (
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">LockIn</h1>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
