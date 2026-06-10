import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  rooms: [],
  activeRoom: null,
  messages: {},        // { [roomId]: Message[] }
  typingUsers: {},     // { [roomId]: Set of usernames }
  onlineUsers: {},     // { [userId]: UserStatus }
  users: [],
  stompClient: null,

  setRooms: (rooms) => set({ rooms }),

  addRoom: (room) => set(state => ({
    rooms: [room, ...state.rooms.filter(r => r.id !== room.id)]
  })),

  setActiveRoom: (room) => set({ activeRoom: room }),

  setMessages: (roomId, messages) => set(state => ({
    messages: { ...state.messages, [roomId]: messages }
  })),

  addMessage: (roomId, message) => set(state => {
    const existing = state.messages[roomId] || []
    const isDuplicate = existing.some(m => m.id === message.id)
    if (isDuplicate) return state
    return {
      messages: {
        ...state.messages,
        [roomId]: [...existing, message]
      }
    }
  }),

  setTyping: (roomId, username, isTyping) => set(state => {
    const current = new Set(state.typingUsers[roomId] || [])
    if (isTyping) current.add(username)
    else current.delete(username)
    return { typingUsers: { ...state.typingUsers, [roomId]: current } }
  }),

  updateUserStatus: (userId, status) => set(state => ({
    onlineUsers: { ...state.onlineUsers, [userId]: status }
  })),

  setUsers: (users) => set({ users }),

  setStompClient: (client) => set({ stompClient: client }),

  clearMessages: (roomId) => set(state => {
    const msgs = { ...state.messages }
    delete msgs[roomId]
    return { messages: msgs }
  }),
}))
