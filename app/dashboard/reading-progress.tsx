'use client'

import { useState } from 'react'
import { DayCard } from './day-card'
import { SortControls } from './sort-controls'
import { ArrowRight } from 'lucide-react'

type SortOption = 'newest' | 'oldest' | 'day-asc' | 'day-desc'

interface PlanDay {
  id: string
  day_number: number
  title: string
  scripture_reference: string
  notes: string | null
  created_at: string
  user_progress?: Array<{ is_completed: boolean }>
}

export function ReadingProgress({ days }: { days: PlanDay[] }) {
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Find the next incomplete day (first uncompleted when sorted by day number)
  const nextIncompleteDay = [...days]
    .sort((a, b) => a.day_number - b.day_number)
    .find(day => !day.user_progress?.[0]?.is_completed)

  const sortedDays = [...days].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'day-asc':
        return a.day_number - b.day_number
      case 'day-desc':
        return b.day_number - a.day_number
      default:
        return 0
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Your Reading Progress</h3>
      </div>

      {/* Up Next Section */}
      {nextIncompleteDay && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            <h4 className="text-base font-semibold text-gray-900">Up Next</h4>
          </div>
          <div className="ring-2 ring-blue-500 ring-offset-2 rounded-lg">
            <DayCard
              day={nextIncompleteDay}
              isCompleted={false}
            />
          </div>
        </div>
      )}

      <SortControls currentSort={sortBy} onSortChange={setSortBy} />

      <div className="space-y-3 sm:space-y-4">
        {sortedDays.length > 0 ? (
          sortedDays.map((day) => {
            const isCompleted = day.user_progress?.[0]?.is_completed || false
            return (
              <DayCard
                key={day.id}
                day={day}
                isCompleted={isCompleted}
              />
            )
          })
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-gray-600">No daily readings available yet for this plan.</p>
          </div>
        )}
      </div>
    </div>
  )
}
