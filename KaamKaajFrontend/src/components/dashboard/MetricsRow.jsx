import React from 'react'
import { Building2, Zap, CheckCircle2, Bell } from 'lucide-react'

export default function MetricsRow({ data = {}, onWorkspacesClick, onActiveClick, onCompletedClick, onPendingClick }) {
  const cards = [
    {
      icon: Building2, label: 'Workspaces',
      key: 'workspaces',
      sub: data.workspaces > 0
        ? `${data.workspaces} workspace${data.workspaces !== 1 ? 's' : ''} joined`
        : 'No workspaces yet',
      up: null,
      onClick: onWorkspacesClick,
      hint: 'Scroll to workspaces',
    },
    {
      icon: Zap, label: 'Active Tasks',
      key: 'activeTasks',
      sub: data.activeTasks > 0
        ? `${data.activeTasks} in progress or not started`
        : 'No active tasks',
      up: data.activeTasks > 0 ? true : null,
      onClick: onActiveClick,
      hint: 'View active tasks',
    },
    {
      icon: CheckCircle2, label: 'Completed',
      key: 'completed',
      sub: data.completed > 0
        ? `${data.completed} task${data.completed !== 1 ? 's' : ''} done`
        : 'None completed yet',
      up: data.completed > 0 ? true : null,
      onClick: onCompletedClick,
      hint: 'View completed tasks',
    },
    {
      icon: Bell, label: 'Pending Requests',
      key: 'pending',
      sub: data.pending > 0
        ? `${data.pending} request${data.pending !== 1 ? 's' : ''} awaiting response`
        : 'All caught up',
      up: null,
      onClick: onPendingClick,
      hint: 'Go to inbox',
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem', marginBottom: '2rem',
    }}>
      {cards.map(({ icon: Icon, label, key, sub, up, onClick, hint }) => (
        <div
          key={key}
          onClick={onClick}
          title={hint}
          className="metric-card"
          style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '1.25rem',
            transition: 'var(--transition)',
            cursor: onClick ? 'pointer' : 'default',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border2)'
            e.currentTarget.style.boxShadow = 'var(--shadow)'
            if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '0.6rem',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{label}</span>
            <Icon size={14} style={{ color: 'var(--text3)' }} />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '1.75rem',
            fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)',
          }}>
            {data[key] ?? 0}
          </div>
          <div style={{
            fontSize: '0.72rem', marginTop: '0.3rem', fontWeight: 500,
            color: up === true ? '#16A34A' : 'var(--text3)',
          }}>
            {up === true ? '↑ ' : ''}{sub}
          </div>

          {/* Subtle click hint arrow on hover */}
          {onClick && (
            <div style={{
              position: 'absolute', bottom: '0.75rem', right: '0.75rem',
              fontSize: '0.65rem', color: 'var(--text3)',
              opacity: 0, transition: 'var(--transition)',
            }}
            className="metric-hint"
            >
              →
            </div>
          )}
        </div>
      ))}
    </div>
  )
}