'use client'

import { useState } from 'react'
import { togglePostActive, deletePost, adminHidePost, adminDeletePost } from './actions'
import { Rocket, Heart, Trophy, Eye, EyeOff, Trash2, Loader2, Power } from 'lucide-react'
import Image from 'next/image'

interface Post {
  id: string
  user_id: string
  type: 'launch' | 'prayer' | 'win'
  title: string
  content: string
  is_active: boolean
  is_hidden: boolean
  created_at: string
  user_profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface PostListProps {
  posts: Post[]
  currentUserId: string
  isAdmin: boolean
}

export function PostList({ posts, currentUserId, isAdmin }: PostListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<string | null>(null)

  const handleToggleActive = async (postId: string, currentStatus: boolean) => {
    setLoadingId(postId)
    setActionType('toggle')
    await togglePostActive(postId, currentStatus)
    setLoadingId(null)
    setActionType(null)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    setLoadingId(postId)
    setActionType('delete')
    await deletePost(postId)
    setLoadingId(null)
    setActionType(null)
  }

  const handleAdminHide = async (postId: string, shouldHide: boolean) => {
    setLoadingId(postId)
    setActionType('hide')
    await adminHidePost(postId, shouldHide)
    setLoadingId(null)
    setActionType(null)
  }

  const handleAdminDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post as admin?')) return

    setLoadingId(postId)
    setActionType('adminDelete')
    await adminDeletePost(postId)
    setLoadingId(null)
    setActionType(null)
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'launch':
        return { icon: Rocket, color: 'blue', label: 'Launch Alert' }
      case 'prayer':
        return { icon: Heart, color: 'red', label: 'Prayer Request' }
      case 'win':
        return { icon: Trophy, color: 'yellow', label: 'Win/Praise' }
      default:
        return { icon: Heart, color: 'gray', label: 'Post' }
    }
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-600">Be the first to share!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const typeConfig = getTypeConfig(post.type)
        const Icon = typeConfig.icon
        const isOwner = post.user_id === currentUserId
        const isLoading = loadingId === post.id
        const userName = post.user_profiles?.full_name || 'Anonymous'
        const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase()

        return (
          <div
            key={post.id}
            className={`bg-white border rounded-lg p-6 shadow-sm ${post.is_hidden ? 'opacity-60 border-orange-300' : 'border-gray-200'
              }`}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {post.user_profiles?.avatar_url ? (
                  <Image
                    src={post.user_profiles.avatar_url}
                    alt={userName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {userInitials}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-5 w-5 text-${typeConfig.color}-600`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${typeConfig.color}-100 text-${typeConfig.color}-700`}>
                        {typeConfig.label}
                      </span>
                      {!post.is_active && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                      {post.is_hidden && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                          Hidden by Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {userName} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {(isOwner || isAdmin) && (
                    <div className="flex gap-2">
                      {isOwner && (
                        <>
                          <button
                            onClick={() => handleToggleActive(post.id, post.is_active)}
                            disabled={isLoading && actionType === 'toggle'}
                            className={`p-2 rounded-lg text-sm font-medium ${post.is_active
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } disabled:opacity-50`}
                            title={post.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {isLoading && actionType === 'toggle' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={isLoading && actionType === 'delete'}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                            title="Delete"
                          >
                            {isLoading && actionType === 'delete' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}

                      {isAdmin && !isOwner && (
                        <>
                          <button
                            onClick={() => handleAdminHide(post.id, !post.is_hidden)}
                            disabled={isLoading && actionType === 'hide'}
                            className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50"
                            title={post.is_hidden ? 'Unhide' : 'Hide'}
                          >
                            {isLoading && actionType === 'hide' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : post.is_hidden ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleAdminDelete(post.id)}
                            disabled={isLoading && actionType === 'adminDelete'}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                            title="Delete (Admin)"
                          >
                            {isLoading && actionType === 'adminDelete' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
