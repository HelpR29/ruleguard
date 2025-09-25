import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface TradeImagesProps {
  ids: number[];
  onRemove: (index: number) => void;
}

export default function TradeImages({ ids, onRemove }: TradeImagesProps) {
  if (!ids || ids.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Trade Images</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ids.map((id, index) => (
          <div key={id} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <span className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white px-1 rounded">
                {index + 1}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
