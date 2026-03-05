'use client'

import { useState } from 'react'
import { updateMeeting } from './actions'
import { X, Loader2, Save } from 'lucide-react'

interface Meeting {
  id: string
  title: string
  description: string | null
  zoom_link: string
  meeting_date: string
  is_active: boolean
}

interface EditMeetingModalProps {
  meeting: Meeting
  onClose: () => void
}

export function EditMeetingModal({ meeting, onClose }: EditMeetingModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const meetingDateInput = formData.get('meeting_date') as string
    if (meetingDateInput) {
      formData.set('meeting_date', new Date(meetingDateInput).toISOString())
    }

    const result = await updateMeeting(meeting.id, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Edit Meeting</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title *
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              defaultValue={meeting.title}
              placeholder="Thursday Night Meeting"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={2}
              defaultValue={meeting.description || ''}
              placeholder="Weekly fellowship and prayer meeting"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label htmlFor="edit-zoom_link" className="block text-sm font-medium text-gray-700 mb-1">
              Zoom Link *
            </label>
            <input
              id="edit-zoom_link"
              name="zoom_link"
              type="url"
              required
              defaultValue={meeting.zoom_link}
              placeholder="https://zoom.us/j/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="edit-meeting_date" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Date & Time *
            </label>
            <input
              id="edit-meeting_date"
              name="meeting_date"
              type="datetime-local"
              required
              defaultValue={formatDateForInput(meeting.meeting_date)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="edit-is_active"
              name="is_active"
              type="checkbox"
              defaultChecked={meeting.is_active}
              value="true"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="edit-is_active" className="text-sm font-medium text-gray-700">
              Show in announcement bar
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
