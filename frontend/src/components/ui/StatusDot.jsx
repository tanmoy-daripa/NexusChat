import clsx from 'clsx'

const statusMap = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
}

export default function StatusDot({ status, className = '' }) {
  const key = statusMap[status] || 'offline'
  return (
    <span className={clsx('status-dot', key, className)} />
  )
}
