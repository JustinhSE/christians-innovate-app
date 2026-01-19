'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MessageCircle, Send, Trash2, User } from 'lucide-react'
import Image from 'next/image'

interface Comment {
  id: string
  comment: string
  created_at: string
  user_id: string

  user_name?: string
  avatar_url?: string | null
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function getAvatarColor(userId: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ]
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

export function CommentSection({ dayId, userId }: { dayId: string; userId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadComments()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('day_comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'day_comments',
          filter: `day_id=eq.${dayId}`
        },
        () => {
          loadComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dayId])

  async function loadComments() {
    setLoading(true)

    // First get comments
    const { data: commentsData, error: commentsError } = await supabase
      .from('day_comments')
      .select('*')
      .eq('day_id', dayId)
      .order('created_at', { ascending: true })

    if (commentsError || !commentsData) {
      setLoading(false)
      return
    }

    // Get unique user IDs
    const userIds = [...new Set(commentsData.map(c => c.user_id))]

    // Fetch user profiles for these IDs (now includes full_name synced from auth)
    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select('user_id, full_name, avatar_url')
      .in('user_id', userIds)

    // Map profiles to comments
    const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || [])

    const enrichedComments = commentsData.map(comment => {
      const profile = profileMap.get(comment.user_id)
      return {
        ...comment,
        user_name: profile?.full_name || 'User',
        avatar_url: profile?.avatar_url || null
      }
    })

    setComments(enrichedComments)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)

    const { error } = await supabase
      .from('day_comments')
      .insert({
        day_id: dayId,
        user_id: userId,
        comment: newComment.trim()
      })

    if (!error) {
      setNewComment('')
      loadComments()
    } else {
      alert('Error posting comment: ' + error.message)
    }

    setSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return

    const { error } = await supabase
      .from('day_comments')
      .delete()
      .eq('id', commentId)

    if (!error) {
      loadComments()
    } else {
      alert('Error deleting comment: ' + error.message)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Discussion ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts, insights, or questions..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={submitting}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">
          <p>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {comment.avatar_url ? (
                  <Image
                    src={comment.avatar_url}
                    alt={comment.user_name || comment.user_email || 'User'}
                    width={40}
                    height={40}
                    className="flex-shrink-0 w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getAvatarColor(comment.user_id)} flex items-center justify-center text-white font-semibold text-sm`}>
                    {getInitials(comment.user_name || comment.user_email || 'U')}
                  </div>
                )}

                {/* Comment content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {comment.user_name || comment.user_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {comment.user_id === userId && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
