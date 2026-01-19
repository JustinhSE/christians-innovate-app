'use client'

import { useState } from 'react'
import { addManualAttendee, removeAttendee } from './actions'
import { X, Loader2, UserPlus, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface Attendee {
  user_id: string
  attended_at: string
  user_profiles?: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  }
}

interface AttendeesModalProps {
  meetingId: string
  meetingTitle: string
  attendees: Attendee[]
  onClose: () => void
}

export function AttendeesModal({ meetingId, meetingTitle, attendees, onClose }: AttendeesModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const result = await addManualAttendee(meetingId, email.trim())

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setEmail('')
      setLoading(false)
    }
  }

  const handleRemoveAttendee = async (userId: string) => {
    if (!confirm('Remove this attendee from the list?')) return

    setRemovingId(userId)
    await removeAttendee(meetingId, userId)
    setRemovingId(null)
  }

  function getInitials(name: string | null): string {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Meeting Attendees</h3>
            <p className="text-sm text-gray-600 mt-1">{meetingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Attendee Manually</h4>
          <form onSubmit={handleAddAttendee} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add
                </>
              )}
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Attendees ({attendees.length})
          </h4>

          {attendees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No attendees yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.user_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    {attendee.user_profiles?.avatar_url ? (
                      <Image
                        src={attendee.user_profiles.avatar_url}
                        alt={attendee.user_profiles.full_name || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(attendee.user_profiles?.full_name || null)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {attendee.user_profiles?.full_name || 'Anonymous User'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {attendee.user_profiles?.email || 'No email'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(attendee.attended_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAttendee(attendee.user_id)}
                    disabled={removingId === attendee.user_id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Remove attendee"
                  >
                    {removingId === attendee.user_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
