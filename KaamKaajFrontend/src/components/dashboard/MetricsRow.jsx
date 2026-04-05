import React from 'react'
import { Building2, Zap, CheckCircle2, Bell } from 'lucide-react'

export default function MetricsRow({ data = {} }) {
  const cards = [
    {
      icon: Building2,    label: 'Workspaces',
      key: 'workspaces',
      sub: data.workspaces > 0
        ? `${data.workspaces} workspace${data.workspaces !== 1 ? 's' : ''} joined`
        : 'No workspaces yet',
      up: null,
    },
    {
      icon: Zap,          label: 'Active Tasks',
      key: 'activeTasks',
      sub: data.activeTasks > 0
        ? `${data.activeTasks} in progress or not started`
        : 'No active tasks',
      up: data.activeTasks > 0 ? true : null,
    },
    {
      icon: CheckCircle2, label: 'Completed',
      key: 'completed',
      sub: data.completed > 0
        ? `${data.completed} task${data.completed !== 1 ? 's' : ''} done`
        : 'None completed yet',
      up: data.completed > 0 ? true : null,
    },
    {
      icon: Bell,         label: 'Pending Requests',
      key: 'pending',
      sub: data.pending > 0
        ? `${data.pending} request${data.pending !== 1 ? 's' : ''} awaiting response`
        : 'All caught up',
      up: null,
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem', marginBottom: '2rem',
    }}>
      {cards.map(({ icon: Icon, label, key, sub, up }) => (
        <div key={key} style={{
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '1.25rem',
          transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{label}</span>
            <Icon size={14} style={{ color: 'var(--text3)' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {data[key] ?? 0}
          </div>
          <div style={{ fontSize: '0.72rem', marginTop: '0.3rem', fontWeight: 500,
            color: up === true ? '#16A34A' : 'var(--text3)',
          }}>
            {up === true ? '↑ ' : ''}{sub}
          </div>
        </div>
      ))}
    </div>
  )
}