import { useState, useEffect } from 'react'
import { X, Users, Crown, Loader2 } from 'lucide-react'
import { roomApi } from '../../services/api'
import { useChatStore } from '../../store/chatStore'
import Avatar from '../ui/Avatar'
import StatusDot from '../ui/StatusDot'

export default function MemberList({ room, onClose }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const { onlineUsers } = useChatStore()

  useEffect(() => {
    // Members come from room data; fetch fresh room details
    if (room.members) {
      setMembers(room.members)
      setLoading(false)
      return
    }
    setLoading(false)
  }, [room])

  const sorted = [...members].sort((a, b) => {
    const aStatus = onlineUsers[a.id] || a.status
    const bStatus = onlineUsers[b.id] || b.status
    if (aStatus === 'ONLINE' && bStatus !== 'ONLINE') return -1
    if (bStatus === 'ONLINE' && aStatus !== 'ONLINE') return 1
    return (a.displayName || a.username).localeCompare(b.displayName || b.username)
  })

  const online = sorted.filter(m => (onlineUsers[m.id] || m.status) === 'ONLINE')
  const offline = sorted.filter(m => (onlineUsers[m.id] || m.status) !== 'ONLINE')

  return (
    <div className="w-64 bg-surface-800 border-l border-surface-600 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-surface-600">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-200">Members</span>
          <span className="text-xs text-gray-500 bg-surface-600 px-1.5 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        <button onClick={onClose} className="btn-ghost p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {loading ? (
          <div className="flex justify-center pt-8">
            <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
          </div>
        ) : (
          <>
            {online.length > 0 && (
              <MemberGroup
                label="Online"
                count={online.length}
                members={online}
                onlineUsers={onlineUsers}
                creatorId={room.createdBy?.id}
              />
            )}
            {offline.length > 0 && (
              <MemberGroup
                label="Offline"
                count={offline.length}
                members={offline}
                onlineUsers={onlineUsers}
                creatorId={room.createdBy?.id}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MemberGroup({ label, count, members, onlineUsers, creatorId }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 mb-2">
        {label} — {count}
      </p>
      <div className="space-y-0.5">
        {members.map(member => {
          const status = onlineUsers[member.id] || member.status || 'OFFLINE'
          const isCreator = member.id === creatorId

          return (
            <div
              key={member.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-700 transition-all cursor-pointer group"
            >
              <div className="relative flex-shrink-0">
                <Avatar user={member} size="xs" />
                <StatusDot
                  status={status}
                  className="absolute -bottom-0.5 -right-0.5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-300 truncate font-medium">
                    {member.displayName || member.username}
                  </span>
                  {isCreator && (
                    <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" title="Room creator" />
                  )}
                </div>
                {member.statusMessage && (
                  <p className="text-xs text-gray-600 truncate">{member.statusMessage}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
