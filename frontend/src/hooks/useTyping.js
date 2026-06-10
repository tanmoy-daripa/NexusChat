import { useRef, useCallback } from 'react'

export function useTyping(sendTyping, roomId, delay = 2000) {
  const timerRef = useRef(null)
  const isTypingRef = useRef(false)

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      sendTyping(roomId, true)
      isTypingRef.current = true
    }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      sendTyping(roomId, false)
      isTypingRef.current = false
    }, delay)
  }, [sendTyping, roomId, delay])

  const stopTyping = useCallback(() => {
    clearTimeout(timerRef.current)
    if (isTypingRef.current) {
      sendTyping(roomId, false)
      isTypingRef.current = false
    }
  }, [sendTyping, roomId])

  return { startTyping, stopTyping }
}
