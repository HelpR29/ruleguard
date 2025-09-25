import React from 'react';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export const TagFilter = React.memo(({
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags
}: TagFilterProps) => {
  return (
    <div className="rounded-2xl p-4 card-surface">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-700 font-medium mr-2">Tag Filter:</span>
        {allTags.length === 0 && <span className="text-xs text-gray-500">No tags yet</span>}
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            type="button"
            className={`px-2 py-1 rounded-full text-xs ${selectedTags.includes(tag) ? 'accent-chip-selected' : 'chip'}`}
          >
            {tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button type="button" className="ml-2 text-sm text-gray-600 hover:text-gray-900" onClick={onClearTags}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
});

TagFilter.displayName = 'TagFilter';
