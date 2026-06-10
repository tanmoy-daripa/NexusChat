import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

const WS_URL = import.meta.env.VITE_WS_URL || '/ws'

export function useWebSocket() {
  const clientRef = useRef(null)
  const subscriptionsRef = useRef({})
  const { accessToken } = useAuthStore()
  const { addMessage, setTyping, updateUserStatus, setStompClient } = useChatStore()

  useEffect(() => {
    if (!accessToken) return

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 3000,
      onConnect: () => {
        console.log('WS connected')
        setStompClient(client)

        // Subscribe to user status updates
        client.subscribe('/topic/users/status', (msg) => {
          const event = JSON.parse(msg.body)
          if (event.payload) {
            updateUserStatus(event.payload.userId, event.payload.status)
          }
        })
      },
      onDisconnect: () => {
        console.log('WS disconnected')
        setStompClient(null)
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [accessToken])

  const subscribeToRoom = useCallback((roomId) => {
    const client = clientRef.current
    if (!client?.connected || subscriptionsRef.current[roomId]) return

    // Messages
    const msgSub = client.subscribe(`/topic/room/${roomId}`, (msg) => {
      const event = JSON.parse(msg.body)
      if (event.type === 'MESSAGE' && event.payload) {
        addMessage(roomId, event.payload)
      }
    })

    // Typing
    const typingSub = client.subscribe(`/topic/room/${roomId}/typing`, (msg) => {
      const event = JSON.parse(msg.body)
      if (event.type === 'TYPING' && event.payload) {
        setTyping(roomId, event.payload.username, event.payload.typing)
      }
    })

    subscriptionsRef.current[roomId] = [msgSub, typingSub]
  }, [addMessage, setTyping])

  const unsubscribeFromRoom = useCallback((roomId) => {
    const subs = subscriptionsRef.current[roomId]
    if (subs) {
      subs.forEach(s => s.unsubscribe())
      delete subscriptionsRef.current[roomId]
    }
  }, [])

  const sendTyping = useCallback((roomId, isTyping) => {
    const client = clientRef.current
    if (!client?.connected) return
    client.publish({
      destination: `/app/room/${roomId}/typing`,
      body: JSON.stringify({ roomId, typing: isTyping }),
    })
  }, [])

  return { subscribeToRoom, unsubscribeFromRoom, sendTyping, client: clientRef.current }
}
