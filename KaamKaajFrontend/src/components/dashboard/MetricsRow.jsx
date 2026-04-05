import React from 'react'
import { Building2, Zap, CheckCircle2, Bell } from 'lucide-react'

const cards = [
  { icon: Building2,   label: 'Workspaces',       key: 'workspaces',  trend: '+1 this month',  up: true  },
  { icon: Zap,         label: 'Active Tasks',      key: 'activeTasks', trend: '-3 from last week', up: false },
  { icon: CheckCircle2,label: 'Completed',         key: 'completed',   trend: '+8 this month',  up: true  },
  { icon: Bell,        label: 'Pending Requests',  key: 'pending',     trend: '2 invites, 1 task', up: null },
]

export default function MetricsRow({ data = {} }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem', marginBottom: '2rem',
    }}>
      {cards.map(({ icon: Icon, label, key, trend, up }) => (
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
            {data[key] ?? '—'}
          </div>
          <div style={{ fontSize: '0.72rem', marginTop: '0.3rem', color: up === true ? '#16A34A' : up === false ? '#DC2626' : 'var(--text3)', fontWeight: 500 }}>
            {up === true ? '↑ ' : up === false ? '↓ ' : ''}{trend}
          </div>
        </div>
      ))}
    </div>
  )
}
