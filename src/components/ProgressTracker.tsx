import React from 'react';
import { useUser } from '../context/UserContext';

const progressObjects = {
  beer: '🍺',
  wine: '🍷',
  donut: '🍩',
  diamond: '💎',
  trophy: '🏆'
};

export default function ProgressTracker() {
  const { settings, progress } = useUser();
  const objectEmoji = progressObjects[settings.progressObject];

  const generateGrid = () => {
    const grid = [];
    for (let i = 0; i < settings.targetCompletions; i++) {
      const isCompleted = i < progress.completions;
      grid.push(
        <div
          key={i}
          className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all duration-300 ${
            isCompleted
              ? 'bg-green-100 border-2 border-green-300 scale-110 opacity-50'
              : 'bg-gray-100 border-2 border-gray-200 hover:bg-gray-200'
          }`}
        >
          {isCompleted ? '✅' : objectEmoji}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="text-center">
        <div className="text-4xl mb-2">{objectEmoji}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          {progress.completions} / {settings.targetCompletions}
        </h3>
        <p className="text-gray-600">
          {settings.targetCompletions - progress.completions} {settings.progressObject}s remaining
        </p>
        <p className="text-sm text-blue-600 mt-2">
          Progress updates automatically based on compliant trades
        </p>
      </div>

      {/* Progress Grid */}
      <div className="grid grid-cols-10 gap-2 max-h-80 overflow-y-auto p-4 bg-gray-50 rounded-xl">
        {generateGrid()}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{((progress.completions / settings.targetCompletions) * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(progress.completions / settings.targetCompletions) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}