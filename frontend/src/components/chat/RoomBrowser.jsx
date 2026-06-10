import { useState, useEffect } from 'react'
import { X, Hash, Users, Search, LogIn, Loader2, Globe } from 'lucide-react'
import { roomApi } from '../../services/api'
import { useChatStore } from '../../store/chatStore'
import { useRooms } from '../../hooks/useRooms'
import { toast } from 'react-hot-toast'

export default function RoomBrowser({ onClose, onJoin }) {
  const [publicRooms, setPublicRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [joining, setJoining] = useState(null)
  const { rooms } = useChatStore()
  const { joinRoom } = useRooms()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await roomApi.getPublic()
        setPublicRooms(data)
      } catch {
        toast.error('Failed to load public rooms')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const myRoomIds = new Set(rooms.map(r => r.id))

  const filtered = publicRooms.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.description?.toLowerCase().includes(query.toLowerCase())
  )

  const handleJoin = async (room) => {
    setJoining(room.id)
    const joined = await joinRoom(room.id)
    setJoining(null)
    if (joined) {
      onJoin(joined)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-panel w-full max-w-lg gradient-border animate-slide-up flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-100">Browse Public Rooms</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-surface-600 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search rooms..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Room list */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <Hash className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No rooms found</p>
            </div>
          ) : (
            filtered.map(room => {
              const isMember = myRoomIds.has(room.id)
              return (
                <div
                  key={room.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-700 transition-all group"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-600/20 flex items-center justify-center flex-shrink-0">
                    <Hash className="w-5 h-5 text-primary-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-200 text-sm"># {room.name}</p>
                    {room.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{room.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3 text-gray-600" />
                      <span className="text-xs text-gray-600">{room.memberCount || 0} members</span>
                    </div>
                  </div>

                  {/* Action */}
                  {isMember ? (
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 flex-shrink-0">
                      Joined
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoin(room)}
                      disabled={joining === room.id}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
                    >
                      {joining === room.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <><LogIn className="w-3 h-3" /> Join</>
                      )}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-surface-600 flex-shrink-0">
          <p className="text-xs text-gray-600 text-center">
            {filtered.length} public room{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>
    </div>
  )
}
