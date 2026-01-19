'use client'

import { useFormStatus } from 'react-dom'
import { updateDay } from './actions'
import { useState } from 'react'
import { X } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {pending ? 'Saving...' : 'Save Changes'}
    </button>
  )
}

type Day = {
  id: string
  plan_id: string
  day_number: number
  date_assigned: string | null
  scripture_reference: string
  content_markdown: string | null
}

export function EditDayModal({ day, onClose }: { day: Day; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await updateDay(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  // Format date for input (YYYY-MM-DD)
  const formattedDate = day.date_assigned
    ? new Date(day.date_assigned).toISOString().split('T')[0]
    : ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Day {day.day_number}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-3 sm:space-y-4">
            <input type="hidden" name="day_id" value={day.id} />
            <input type="hidden" name="plan_id" value={day.plan_id} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
              <label htmlFor="edit_day_number" className="block text-sm font-medium text-gray-700 mb-1">
                Day Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="edit_day_number"
                name="day_number"
                required
                min="1"
                defaultValue={day.day_number}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

              <div>
                <label htmlFor="edit_date_assigned" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Assigned (Optional)
                </label>
                <input
                  type="date"
                  id="edit_date_assigned"
                  name="date_assigned"
                  defaultValue={formattedDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit_scripture_reference" className="block text-sm font-medium text-gray-700 mb-1">
                Scripture Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="edit_scripture_reference"
                name="scripture_reference"
                required
                defaultValue={day.scripture_reference}
                placeholder="e.g., Genesis 1-3, Psalm 1, John 3:16-17"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="edit_content_markdown" className="block text-sm font-medium text-gray-700 mb-1">
                Content / Devotional (Markdown)
              </label>
              <textarea
                id="edit_content_markdown"
                name="content_markdown"
                rows={8}
                defaultValue={day.content_markdown || ''}
                placeholder="Write your devotional content here. You can use Markdown formatting..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports Markdown: **bold**, *italic*, # headings, etc.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <SubmitButton />
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
