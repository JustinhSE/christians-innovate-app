'use client'

import { useFormStatus } from 'react-dom'
import { createPlan } from './actions'
import { useState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
    >
      {pending ? 'Creating...' : 'Create Plan'}
    </button>
  )
}

export function CreatePlanForm() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await createPlan(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      // Clear form
      const form = document.getElementById('create-plan-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Create New Reading Plan</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form id="create-plan-form" action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="e.g., Bible in a Year 2026"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Brief description of this reading plan..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
