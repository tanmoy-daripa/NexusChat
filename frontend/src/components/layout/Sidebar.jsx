import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  MessageSquare, Hash, Users, Search, Plus, LogOut,
  X, Lock, Globe, Settings, ChevronRight
} from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { roomApi, authApi } from '../../services/api'
import { useWebSocket } from '../../hooks/useWebSocket'
import Avatar from '../ui/Avatar'
import StatusDot from '../ui/StatusDot'
import ProfileModal from '../chat/ProfileModal'
import RoomBrowser from '../chat/RoomBrowser'

export default function Sidebar() {
  const { rooms, activeRoom, setActiveRoom, addRoom, setRooms, users } = useChatStore()
  const { user, logout } = useAuthStore()
  const { subscribeToRoom } = useWebSocket()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('rooms')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showBrowser, setShowBrowser] = useState(false)

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredUsers = users.filter(u =>
    u.id !== user?.id &&
    (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSelectRoom = (room) => {
    setActiveRoom(room)
    subscribeToRoom(room.id)
    navigate(`/chat/${room.id}`)
  }

  const handleDirectMessage = async (targetUser) => {
    try {
      const { data } = await roomApi.getDirect(targetUser.id)
      const existing = rooms.find(r => r.id === data.id)
      if (!existing) addRoom(data)
      handleSelectRoom(data)
    } catch {
      toast.error('Failed to open conversation')
    }
  }

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    navigate('/login')
  }

  return (
    <aside className="
w-full
md:w-72
bg-surface-800
border-r border-surface-600
flex flex-col
h-full
flex-shrink-0
">
      {/* ── Logo ── */}
      <div className="px-4 py-4 border-b border-surface-600">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-600/20">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gradient text-lg tracking-tight">NexusChat</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            className="input-field pl-9 py-2 text-sm"
            placeholder="Search…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 px-3 py-2 border-b border-surface-600">
        {[
          { key: 'rooms', icon: Hash, label: 'Rooms' },
          { key: 'people', icon: Users, label: 'People' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all
              ${activeTab === key
                ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-surface-700'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-0.5">
        {activeTab === 'rooms' ? (
          <>
            {/* Action buttons */}
            <div className="flex gap-1.5 mb-2">
              <button
                onClick={() => setShowBrowser(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs text-gray-400 hover:text-gray-200 hover:bg-surface-700 rounded-lg border border-dashed border-surface-500 hover:border-surface-400 transition-all"
              >
                <Globe className="w-3.5 h-3.5" /> Browse
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs text-primary-400 hover:text-primary-300 hover:bg-primary-600/10 rounded-lg border border-dashed border-primary-600/30 hover:border-primary-500/50 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
            </div>

            {filteredRooms.length === 0 ? (
              <p className="text-gray-600 text-xs text-center py-6">No rooms yet</p>
            ) : (
              filteredRooms.map(room => (
                <RoomItem
                  key={room.id}
                  room={room}
                  isActive={activeRoom?.id === room.id}
                  onClick={() => handleSelectRoom(room)}
                />
              ))
            )}
          </>
        ) : (
          filteredUsers.length === 0 ? (
            <p className="text-gray-600 text-xs text-center py-6">No users found</p>
          ) : (
            filteredUsers.map(u => (
              <UserItem key={u.id} user={u} onClick={() => handleDirectMessage(u)} />
            ))
          )
        )}
      </div>

      {/* ── User footer ── */}
      <div className="p-3 border-t border-surface-600 space-y-1">
        {/* Profile button */}
        <button
          onClick={() => setShowProfile(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-700 transition-all group"
        >
          <div className="relative flex-shrink-0">
            <Avatar user={user} size="sm" />
            <span className="absolute -bottom-0.5 -right-0.5 status-dot online" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-200 truncate leading-tight">
              {user?.displayName || user?.username}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {user?.statusMessage || `@${user?.username}`}
            </p>
          </div>
          <Settings className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {/* ── Modals ── */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={room => {
            addRoom(room)
            handleSelectRoom(room)
            setShowCreateModal(false)
          }}
        />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showBrowser && (
        <RoomBrowser
          onClose={() => setShowBrowser(false)}
          onJoin={room => handleSelectRoom(room)}
        />
      )}
    </aside>
  )
}

/* ── Sub-components ── */

function RoomItem({ room, isActive, onClick }) {
  const Icon = room.type === 'DIRECT' ? Users : room.type === 'PRIVATE' ? Lock : Hash

  return (
    <button onClick={onClick} className={`sidebar-item w-full ${isActive ? 'active' : ''}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
      <span className="text-sm font-medium truncate flex-1 text-left">{room.name}</span>
      {room.memberCount > 0 && (
        <span className="text-xs text-gray-700 flex-shrink-0">{room.memberCount}</span>
      )}
    </button>
  )
}

function UserItem({ user, onClick }) {
  return (
    <button onClick={onClick} className="sidebar-item w-full">
      <div className="relative flex-shrink-0">
        <Avatar user={user} size="xs" />
        <StatusDot status={user.status} className="absolute -bottom-0.5 -right-0.5" />
      </div>
      <div className="text-left min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-200 truncate leading-tight">
          {user.displayName || user.username}
        </p>
        <p className="text-xs text-gray-600 truncate">@{user.username}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
    </button>
  )
}

function CreateRoomModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', type: 'PUBLIC' })
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await roomApi.create(form)
      toast.success(`Room #${data.name} created!`)
      onCreated(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-panel w-full max-w-sm gradient-border animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
          <h3 className="text-lg font-semibold text-gray-100">Create a Room</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Room Name <span className="text-red-400">*</span></label>
            <input
              className="input-field"
              placeholder="e.g. general-chat"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description</label>
            <input
              className="input-field"
              placeholder="What's this room about?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              maxLength={500}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Visibility</label>
            <div className="flex gap-2">
              {['PUBLIC', 'PRIVATE'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm border transition-all
                    ${form.type === type
                      ? 'bg-primary-600/20 text-primary-400 border-primary-600/40'
                      : 'text-gray-500 border-surface-500 hover:border-surface-400 hover:text-gray-300'}`}
                >
                  {type === 'PUBLIC' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">Cancel</button>
            <button type="submit" disabled={loading || !form.name.trim()} className="btn-primary flex-1 py-2.5">
              {loading ? 'Creating…' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
