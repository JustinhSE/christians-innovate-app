'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type SortOption = 'newest' | 'oldest' | 'day-asc' | 'day-desc'

interface SortControlsProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export function SortControls({ currentSort, onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      <div className="flex gap-2">
        <button
          onClick={() => onSortChange('newest')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentSort === 'newest'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Newest
        </button>
        <button
          onClick={() => onSortChange('oldest')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentSort === 'oldest'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Oldest
        </button>
        <button
          onClick={() => onSortChange('day-asc')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentSort === 'day-asc'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Day 1→
        </button>
        <button
          onClick={() => onSortChange('day-desc')}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentSort === 'day-desc'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Day →30
        </button>
      </div>
    </div>
  )
}
