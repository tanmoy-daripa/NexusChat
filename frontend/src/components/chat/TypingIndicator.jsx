export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null

  const label = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing`
    : `${users[0]} and ${users.length - 1} others are typing`

  return (
    <div className="flex items-center gap-3 mt-2 animate-fade-in">
      <div className="w-8 flex-shrink-0" /> {/* spacer */}
      <div className="flex items-center gap-2 bg-surface-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
        <div className="flex gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  )
}
