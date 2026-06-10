import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { roomApi } from '../services/api'
import { useChatStore } from '../store/chatStore'

export function useRooms() {
  const { addRoom, setRooms, rooms } = useChatStore()

  const refreshMyRooms = useCallback(async () => {
    try {
      const { data } = await roomApi.getMy()
      setRooms(data)
      return data
    } catch {
      toast.error('Failed to refresh rooms')
      return []
    }
  }, [setRooms])

  const joinRoom = useCallback(async (roomId) => {
    try {
      const { data } = await roomApi.join(roomId)
      addRoom(data)
      toast.success(`Joined #${data.name}`)
      return data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join room')
      return null
    }
  }, [addRoom])

  const leaveRoom = useCallback(async (roomId) => {
    try {
      await roomApi.leave(roomId)
      const updated = rooms.filter(r => r.id !== roomId)
      setRooms(updated)
      toast.success('Left room')
    } catch {
      toast.error('Failed to leave room')
    }
  }, [rooms, setRooms])

  return { refreshMyRooms, joinRoom, leaveRoom }
}
