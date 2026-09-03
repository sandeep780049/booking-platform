import React from 'react';
import { X } from 'lucide-react';

export default function FilterBar({ search, category, onClear, onRemoveFilter }) {
  if (!search && !category) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between bg-white shadow-sm rounded-md mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        {category && (
          <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1 rounded-full text-sm">
            <span className="font-medium">Category:</span>
            <span className="text-neutral-700">{category}</span>
            <button onClick={() => onRemoveFilter?.('category')} className="ml-2 text-neutral-500 hover:text-neutral-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {search && (
          <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1 rounded-full text-sm">
            <span className="font-medium">Search:</span>
            <span className="text-neutral-700">{search}</span>
            <button onClick={() => onRemoveFilter?.('search')} className="ml-2 text-neutral-500 hover:text-neutral-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div>
        <button onClick={onClear} className="text-sm text-neutral-600 hover:text-neutral-900">Clear filters</button>
      </div>
    </div>
  );
}
