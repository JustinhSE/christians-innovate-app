'use client'

import { toggleAdminStatus } from './actions'
import { useState } from 'react'
import { Shield, ShieldOff, User, Calendar, Mail, CheckCircle, XCircle, Download, Copy } from 'lucide-react'
import Image from 'next/image'

type Member = {
  user_id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  created_at: string
  ci_updates: boolean | null
  bible_year: boolean | null
  skill_share: boolean | null
  referral: string | null
  reading_plan_updates: boolean | null
  user_roles: Array<{
    is_admin: boolean
  }> | null
}

function getInitials(name: string | null): string {
  if (!name) return 'U'
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
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
  ]
  const index = userId.charCodeAt(0) % colors.length
  return colors[index]
}

function escapeCSV(value: string | null | boolean | undefined): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function generateCSV(members: Member[]): string {
  const headers = [
    'Email',
    'Full Name',
    'Joined Date',
    'Is Admin',
    'CI Updates',
    'Bible in a Year',
    'Skill Share',
    'Reading Plan Updates',
    'Referral'
  ]

  const rows = members.map(member => [
    escapeCSV(member.email),
    escapeCSV(member.full_name),
    escapeCSV(new Date(member.created_at).toLocaleDateString()),
    escapeCSV(member.user_roles?.[0]?.is_admin || false),
    escapeCSV(member.ci_updates || false),
    escapeCSV(member.bible_year || false),
    escapeCSV(member.skill_share || false),
    escapeCSV(member.reading_plan_updates || false),
    escapeCSV(member.referral)
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

function downloadCSV(members: Member[]): void {
  const csv = generateCSV(members)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().split('T')[0]
  link.href = url
  link.download = `members-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function copyEmailsToClipboard(members: Member[]): Promise<void> {
  const emails = members.map(m => m.email).join(', ')
  try {
    await navigator.clipboard.writeText(emails)
    alert(`Copied ${members.length} email addresses to clipboard!`)
  } catch (err) {
    alert('Failed to copy emails to clipboard')
  }
}

export function MemberList({ members }: { members: Member[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleToggleAdmin(userId: string, currentStatus: boolean, userName: string) {
    const action = currentStatus ? 'revoke admin access from' : 'grant admin access to'

    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return
    }

    setProcessingId(userId)
    const result = await toggleAdminStatus(userId, currentStatus)

    if (result?.error) {
      alert('Error: ' + result.error)
    }

    setProcessingId(null)
  }

  if (members.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
        <p className="text-sm sm:text-base text-gray-600">Members will appear here once they sign up.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Members ({members.length})</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyEmailsToClipboard(members)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy Emails</span>
            <span className="sm:hidden">Copy</span>
          </button>
          <button
            onClick={() => downloadCSV(members)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {members.map((member) => {
          const isAdmin = member.user_roles?.[0]?.is_admin || false

          return (
            <div key={member.user_id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.full_name || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(member.user_id)}`}>
                        {getInitials(member.full_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {member.full_name || 'User'}
                      </h4>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium mt-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email - fetch from auth.users */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 pl-13">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 pl-13">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </div>

                    {member.ci_updates && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        CI Updates
                      </div>
                    )}

                    {member.bible_year && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Bible in a Year
                      </div>
                    )}

                    {member.skill_share && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Skill Share
                      </div>
                    )}

                    {member.referral && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <User className="h-3 w-3" />
                        Referred by: {member.referral}
                      </div>
                    )}

                    {member.reading_plan_updates && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Reading Plans
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAdmin(member.user_id, isAdmin, member.full_name || 'User')}
                    disabled={processingId === member.user_id}
                    className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition ${isAdmin
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isAdmin ? (
                      <>
                        <ShieldOff className="h-4 w-4" />
                        <span className="hidden sm:inline">Revoke Admin</span>
                        <span className="sm:hidden">Revoke</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Make Admin</span>
                        <span className="sm:hidden">Grant</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
