import React from 'react'
import { motion } from 'framer-motion'
import { PriorityBadge } from '../ui/Badge'
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers'

const COLUMNS = [
  { key: 'NOT_STARTED', label: 'Not Started', accent: 'var(--text3)'   },
  { key: 'IN_PROGRESS', label: 'In Progress', accent: 'var(--violet)'  },
  { key: 'COMPLETED',   label: 'Completed',   accent: '#16A34A'        },
]

export default function TaskBoard({ tasks = [], onTaskClick }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key)
    return acc
  }, {})

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      {COLUMNS.map((col) => (
        <div key={col.key} style={{
          background: 'var(--bg2)', borderRadius: 'var(--radius)',
          padding: '1rem', minHeight: 400,
        }}>
          {/* Column header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text2)' }}>
              {col.label}
            </span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.12rem 0.5rem',
              borderRadius: 99, background: 'var(--bg3)', border: '1px solid var(--border)',
              color: grouped[col.key].length > 0 ? col.accent : 'var(--text3)',
            }}>{grouped[col.key].length}</span>
          </div>

          {/* Task cards */}
          {grouped[col.key].map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} done={col.key === 'COMPLETED'} />
          ))}
        </div>
      ))}
    </div>
  )
}

function TaskCard({ task, onClick, done }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      style={{
        background: 'var(--bg3)', border: `1px solid ${done ? 'rgba(22,163,74,0.18)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: '0.9rem',
        marginBottom: '0.5rem', cursor: 'pointer',
        opacity: done ? 0.75 : 1,
        transition: 'var(--transition)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = done ? 'rgba(22,163,74,0.18)' : 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{
        fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)',
        marginBottom: '0.5rem', lineHeight: 1.4,
        textDecoration: done ? 'line-through' : 'none',
        color: done ? 'var(--text2)' : 'var(--text)',
      }}>
        {task.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <PriorityBadge priority={task.priority} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {task.dueDate && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.createdByUsername && (
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: getAvatarColor(task.createdByUsername),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.52rem', fontWeight: 600, color: '#fff',
            }}>
              {getInitials(task.createdByUsername)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
