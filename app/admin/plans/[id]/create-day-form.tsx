'use client'

import { useFormStatus } from 'react-dom'
import { createDay } from './actions'
import { useState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {pending ? 'Creating...' : 'Add Day'}
    </button>
  )
}

export function CreateDayForm({ planId }: { planId: string }) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createDay(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      // Clear form
      const form = document.getElementById('create-day-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add New Day</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form id="create-day-form" action={handleSubmit} className="space-y-4">
        <input type="hidden" name="plan_id" value={planId} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="day_number" className="block text-sm font-medium text-gray-700 mb-1">
              Day Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="day_number"
              name="day_number"
              required
              min="1"
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="date_assigned" className="block text-sm font-medium text-gray-700 mb-1">
              Date Assigned (Optional)
            </label>
            <input
              type="date"
              id="date_assigned"
              name="date_assigned"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="scripture_reference" className="block text-sm font-medium text-gray-700 mb-1">
            Scripture Reference <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="scripture_reference"
            name="scripture_reference"
            required
            placeholder="e.g., Genesis 1-3, Psalm 1, John 3:16-17"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="content_markdown" className="block text-sm font-medium text-gray-700 mb-1">
            Content / Devotional (Markdown)
          </label>
          <textarea
            id="content_markdown"
            name="content_markdown"
            rows={6}
            placeholder="Write your devotional content here. You can use Markdown formatting..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supports Markdown: **bold**, *italic*, # headings, etc.
          </p>
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
