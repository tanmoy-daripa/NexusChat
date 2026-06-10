import clsx from 'clsx'

const sizes = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

const gradients = [
  'from-violet-500 to-indigo-500',
  'from-indigo-500 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-sky-500 to-blue-500',
]

function getGradient(str) {
  if (!str) return gradients[0]
  const idx = str.charCodeAt(0) % gradients.length
  return gradients[idx]
}

function getInitials(user) {
  if (!user) return '?'
  const name = user.displayName || user.username || ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizeClass = sizes[size] || sizes.md
  const gradient = getGradient(user?.username)
  const initials = getInitials(user)

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.displayName || user.username}
        className={clsx('rounded-full object-cover flex-shrink-0', sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={clsx(
        'rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 font-semibold text-white select-none',
        gradient,
        sizeClass,
        className
      )}
    >
      {initials}
    </div>
  )
}
