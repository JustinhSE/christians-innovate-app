'use client'

import { deleteDay } from './actions'
import { useState } from 'react'
import { Trash2, Edit, BookOpen, Calendar } from 'lucide-react'
import { EditDayModal } from './edit-day-modal'

type Day = {
  id: string
  plan_id: string
  day_number: number
  date_assigned: string | null
  scripture_reference: string
  content_markdown: string | null
  created_at: string
}

export function DayList({ days, planId }: { days: Day[]; planId: string }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingDay, setEditingDay] = useState<Day | null>(null)

  async function handleDelete(day: Day) {
    if (!confirm(`Are you sure you want to delete Day ${day.day_number}?`)) {
      return
    }

    setDeletingId(day.id)
    const result = await deleteDay(day.id, planId)

    if (result?.error) {
      alert('Error deleting day: ' + result.error)
    }

    setDeletingId(null)
  }

  if (days.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No days yet</h3>
        <p className="text-gray-600">Add your first daily reading to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Daily Readings</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {days.map((day) => (
            <div key={day.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm">
                        {day.day_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                          {day.scripture_reference}
                        </h4>
                        {day.date_assigned && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(day.date_assigned).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {day.content_markdown && (
                      <p className="text-sm sm:text-base text-gray-600 mt-2 line-clamp-2 pl-0 sm:pl-13">
                        {day.content_markdown}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap\">                  
                  <button
                    onClick={() => setEditingDay(day)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                  >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>

                  <button
                    onClick={() => handleDelete(day)}
                    disabled={deletingId === day.id}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === day.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingDay && (
        <EditDayModal
          day={editingDay}
          onClose={() => setEditingDay(null)}
        />
      )}
    </>
  )
}
