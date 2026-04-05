import React from 'react'
import { PRIORITY_META, STATUS_META, ROLE_META } from '../../utils/helpers'

export function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.MEDIUM
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 600, padding: '0.18rem 0.55rem',
      borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em',
      background: meta.bg, color: meta.color,
    }}>{meta.label}</span>
  )
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.NOT_STARTED
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 500, padding: '0.2rem 0.6rem',
      borderRadius: 99, background: `${meta.color}18`, color: meta.color,
    }}>{meta.label}</span>
  )
}

export function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.MEMBER
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.6rem',
      borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em',
      background: meta.bg, color: meta.color,
    }}>{meta.label}</span>
  )
}

export function InvitationStatusBadge({ status }) {
  const map = {
    PENDING:   { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED' },
    ACCEPTED:  { bg: 'rgba(22,163,74,0.1)',   color: '#16A34A' },
    DECLINED:  { bg: 'rgba(220,38,38,0.08)',  color: '#DC2626' },
    CANCELLED: { bg: 'rgba(161,161,170,0.15)',color: '#71717A' },
  }
  const m = map[status] || map.PENDING
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 500, padding: '0.2rem 0.6rem',
      borderRadius: 99, background: m.bg, color: m.color,
    }}>{status}</span>
  )
}
