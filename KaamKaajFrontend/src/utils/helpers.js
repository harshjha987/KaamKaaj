import { clsx } from 'clsx'

export const cn = (...args) => clsx(...args)

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export const PRIORITY_META = {
  LOW:      { label: 'Low',      color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
  MEDIUM:   { label: 'Medium',   color: '#B45309', bg: 'rgba(234,179,8,0.1)' },
  HIGH:     { label: 'High',     color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
  CRITICAL: { label: 'Critical', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
}

export const STATUS_META = {
  NOT_STARTED: { label: 'Not Started', color: '#A1A1AA' },
  IN_PROGRESS: { label: 'In Progress', color: '#7C3AED' },
  COMPLETED:   { label: 'Completed',   color: '#16A34A' },
}

export const ROLE_META = {
  ADMIN:  { label: 'Admin',  color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  MEMBER: { label: 'Member', color: '#0E7490', bg: 'rgba(6,182,212,0.1)'  },
}

export const AVATAR_COLORS = [
  '#7C3AED','#06B6D4','#F59E0B','#10B981',
  '#EF4444','#8B5CF6','#EC4899','#14B8A6',
]

export const getAvatarColor = (str = '') => {
  const idx = str.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export const extractApiError = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.fieldErrors?.[0]?.message ||
  'Something went wrong'
