import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import Avatar from '../ui/Avatar'
import clsx from 'clsx'

function formatTime(dateStr) {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`
  return format(date, 'MMM d, HH:mm')
}

export default function MessageBubble({ message, isOwn, isConsecutive }) {
  if (message.type === 'SYSTEM') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-gray-600 bg-surface-700 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={clsx(
      'flex gap-3 group message-enter',
      isOwn ? 'flex-row-reverse' : 'flex-row',
      isConsecutive ? 'mt-0.5' : 'mt-4'
    )}>
      {/* Avatar - show only for first in group */}
      <div className="flex-shrink-0 w-8">
        {!isConsecutive && !isOwn && (
          <Avatar user={message.sender} size="xs" />
        )}
      </div>

      <div className={clsx('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start', 'max-w-[75%]')}>
        {/* Sender name + time */}
        {!isConsecutive && (
          <div className={clsx('flex items-baseline gap-2', isOwn && 'flex-row-reverse')}>
            <span className="text-xs font-semibold text-gray-300">
              {isOwn ? 'You' : (message.sender?.displayName || message.sender?.username)}
            </span>
            <span className="text-xs text-gray-600">{formatTime(message.createdAt)}</span>
          </div>
        )}

        {/* Bubble */}
        <div className={clsx(
          'message-bubble relative',
          isOwn ? 'own' : 'other'
        )}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Hover time for consecutive messages */}
          {isConsecutive && (
            <span className={clsx(
              'absolute top-1/2 -translate-y-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none',
              isOwn ? 'right-full mr-2' : 'left-full ml-2'
            )}>
              {formatTime(message.createdAt)}
            </span>
          )}
        </div>

        {message.isEdited && (
          <span className="text-xs text-gray-600 italic">(edited)</span>
        )}
      </div>
    </div>
  )
}
