import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { X, Camera, User, Mail, FileText, Loader2, Check } from 'lucide-react'
import { userApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../ui/Avatar'

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    statusMessage: user?.statusMessage || '',
    avatarUrl: user?.avatarUrl || '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await userApi.updateProfile(form)
      updateUser(data)
      setSaved(true)
      toast.success('Profile updated!')
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const previewUser = { ...user, ...form }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-panel w-full max-w-md gradient-border animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
          <h2 className="text-lg font-semibold text-gray-100">Edit Profile</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar section */}
        <div className="flex flex-col items-center py-6 bg-gradient-to-b from-surface-700/30 to-transparent">
          <div className="relative group cursor-pointer">
            <Avatar user={previewUser} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">@{user?.username}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Display Name
            </label>
            <input
              className="input-field"
              placeholder="Your display name"
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Status Message
            </label>
            <input
              className="input-field"
              placeholder="What's on your mind?"
              value={form.statusMessage}
              onChange={e => setForm({ ...form, statusMessage: e.target.value })}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Avatar URL
            </label>
            <input
              className="input-field"
              placeholder="https://example.com/avatar.png"
              value={form.avatarUrl}
              onChange={e => setForm({ ...form, avatarUrl: e.target.value })}
              type="url"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <input
              className="input-field opacity-50 cursor-not-allowed"
              value={user?.email || ''}
              disabled
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2.5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
