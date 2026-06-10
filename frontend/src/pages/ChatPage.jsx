import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import ChatArea from '../components/chat/ChatArea'
import { useChatStore } from '../store/chatStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { roomApi, userApi } from '../services/api'

export default function ChatPage() {
  const { roomId } = useParams()
  const { setRooms, setActiveRoom, activeRoom, setUsers } = useChatStore()
  const { subscribeToRoom } = useWebSocket()

  useEffect(() => {
    const loadData = async () => {
      try {
        const [myRooms, allUsers] = await Promise.all([
          roomApi.getMy(),
          userApi.getAll(),
        ])
        setRooms(myRooms.data)
        setUsers(allUsers.data)
      } catch (err) {
        console.error('Failed to load data:', err)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (roomId && !isNaN(roomId)) {
      const room = useChatStore.getState().rooms.find(r => r.id === parseInt(roomId))
      if (room) {
        setActiveRoom(room)
        subscribeToRoom(room.id)
      }
    }
  }, [roomId])

  return (
    <div className="flex h-screen bg-surface-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {activeRoom ? (
          <ChatArea />
        ) : (
          <WelcomeScreen />
        )}
      </main>
    </div>
  )
}

function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-accent flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-600/20">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Welcome to NexusChat</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Select a room from the sidebar to start chatting, or create a new one.
        </p>
      </div>
    </div>
  )
}
