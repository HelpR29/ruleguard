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
      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-sm border-2 border-orange-600">
        <Lock className="h-4 w-4 text-white" />
      </div>
      {showText && (
        <div>
          <h1 className="text-xl font-bold text-orange-600">LockIn</h1>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
