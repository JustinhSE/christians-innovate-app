'use client'

import { toggleAdminStatus } from './actions'
import { useState } from 'react'
import { Shield, ShieldOff, User, Calendar, Mail, CheckCircle, XCircle } from 'lucide-react'

type Member = {
  user_id: string
  name: string
  email: string
  created_at: string
  ci_updates: boolean | null
  reading_plan_updates: boolean | null
  user_roles: Array<{
    is_admin: boolean
  }> | null
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
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Members ({members.length})</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {members.map((member) => {
          const isAdmin = member.user_roles?.[0]?.is_admin || false

          return (
            <div key={member.user_id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isAdmin ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                      {isAdmin ? (
                        <Shield className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {member.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
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

                    {member.reading_plan_updates && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Reading Plans
                      </div>
                    )}

                    {isAdmin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAdmin(member.user_id, isAdmin, member.name)}
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
