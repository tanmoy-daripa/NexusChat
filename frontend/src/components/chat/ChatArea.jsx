import { useState, useEffect, useRef } from 'react'
import { Hash, Users, Send, Paperclip, MoreVertical, Loader2, UserCheck, Globe, LogOut } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { roomApi } from '../../services/api'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useTyping } from '../../hooks/useTyping'
import { useRooms } from '../../hooks/useRooms'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import MemberList from './MemberList'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ChatArea() {
  const { activeRoom, messages, typingUsers, setMessages, setActiveRoom } = useChatStore()
  const { user } = useAuthStore()
  const { subscribeToRoom, sendTyping } = useWebSocket()
  const { leaveRoom } = useRooms()
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showMembers, setShowMembers] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)

  const roomMessages = messages[activeRoom?.id] || []
  const typingSet = typingUsers[activeRoom?.id] || new Set()
  const typingList = [...typingSet].filter(u => u !== user?.username)

  const { startTyping, stopTyping } = useTyping(sendTyping, activeRoom?.id)

  useEffect(() => {
    if (!activeRoom) return
    setPage(0)
    setHasMore(true)
    setInput('')
    loadMessages(0, true)
    subscribeToRoom(activeRoom.id)
    inputRef.current?.focus()
  }, [activeRoom?.id])

  useEffect(() => {
    scrollToBottom()
  }, [roomMessages.length])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadMessages = async (pageNum = 0, reset = false) => {
    if (!activeRoom) return
    setLoading(true)
    try {
      const { data } = await roomApi.getMessages(activeRoom.id, pageNum)
      const reversed = [...data].reverse()
      if (reset) {
        setMessages(activeRoom.id, reversed)
      } else {
        const current = messages[activeRoom.id] || []
        setMessages(activeRoom.id, [...reversed, ...current])
      }
      if (data.length < 50) setHasMore(false)
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    stopTyping()
    try {
      await roomApi.sendMessage(activeRoom.id, { content, type: 'TEXT' })
    } catch {
      toast.error('Failed to send message')
      setInput(content)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (e.target.value.trim()) startTyping()
    else stopTyping()
  }

  const handleLeave = async () => {
    setShowMenu(false)
    await leaveRoom(activeRoom.id)
    setActiveRoom(null)
    navigate('/chat')
  }

  if (!activeRoom) return null

  return (
    <div className="flex h-full bg-surface-900 min-w-0">
      {/* Main chat column */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-surface-600 bg-surface-800/60 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-600/20 flex items-center justify-center flex-shrink-0">
              {activeRoom.type === 'DIRECT'
                ? <Users className="w-4 h-4 text-primary-400" />
                : <Hash className="w-4 h-4 text-primary-400" />}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-100 truncate">{activeRoom.name}</h2>
              {activeRoom.description && (
                <p className="text-xs text-gray-500 truncate hidden sm:block">{activeRoom.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Member count */}
            <button
              onClick={() => setShowMembers(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all
                ${showMembers
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-surface-700'}`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{activeRoom.memberCount || 0}</span>
            </button>

            {/* More menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(v => !v)}
                className="btn-ghost p-2"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 glass-panel border border-surface-500 rounded-xl shadow-xl z-20 py-1 animate-fade-in">
                  <button
                    onClick={() => { setShowMembers(true); setShowMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-600 transition-all"
                  >
                    <UserCheck className="w-4 h-4 text-gray-500" /> View Members
                  </button>
                  {activeRoom.type !== 'DIRECT' && (
                    <button
                      onClick={handleLeave}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Leave Room
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-0.5">
          {hasMore && !loading && (
            <div className="text-center py-3">
              <button
                onClick={() => { const next = page + 1; setPage(next); loadMessages(next) }}
                className="text-xs text-primary-400 hover:text-primary-300 bg-primary-600/10 hover:bg-primary-600/20 px-4 py-1.5 rounded-full transition-all border border-primary-600/20"
              >
                Load earlier messages
              </button>
            </div>
          )}

          {loading && roomMessages.length === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
          )}

          {roomMessages.length === 0 && !loading && (
            <EmptyState room={activeRoom} />
          )}

          <MessageList messages={roomMessages} currentUser={user} />

          {typingList.length > 0 && <TypingIndicator users={typingList} />}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div className="px-4 sm:px-6 py-4 border-t border-surface-600 bg-surface-800/40 flex-shrink-0">
          <div className="flex items-end gap-3 bg-surface-700 rounded-2xl px-4 py-3 border border-surface-500 focus-within:border-primary-500/40 transition-colors">
            <button className="p-1 text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 self-center">
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeRoom.name}…`}
              className="flex-1 bg-transparent text-gray-100 text-sm placeholder-gray-600 resize-none focus:outline-none max-h-32 leading-relaxed"
              rows={1}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
              }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary-600 hover:bg-primary-500
                         disabled:opacity-25 disabled:cursor-not-allowed
                         flex items-center justify-center transition-all active:scale-90 self-center"
            >
              {sending
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>

          <p className="text-xs text-gray-700 mt-1.5 text-center select-none">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Member sidebar ── */}
      {showMembers && (
        <MemberList room={activeRoom} onClose={() => setShowMembers(false)} />
      )}
    </div>
  )
}

function EmptyState({ room }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-surface-500 flex items-center justify-center mb-4">
        <Hash className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="text-gray-300 font-semibold mb-1">
        Welcome to #{room.name}!
      </h3>
      <p className="text-gray-600 text-sm max-w-xs">
        {room.description || 'This is the beginning of this channel. Say hello!'}
      </p>
    </div>
  )
}

function MessageList({ messages, currentUser }) {
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1]
    const isConsecutive =
      prev &&
      prev.sender?.id === msg.sender?.id &&
      new Date(msg.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000
    return { ...msg, isConsecutive }
  })

  return (
    <>
      {grouped.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.sender?.id === currentUser?.id}
          isConsecutive={msg.isConsecutive}
        />
      ))}
    </>
  )
}
