import React from 'react'
import { motion } from 'framer-motion'
import { PriorityBadge } from '../ui/Badge'
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers'

const COLUMNS = [
  { key: 'NOT_STARTED', label: 'Not Started', accent: 'var(--text3)'  },
  { key: 'IN_PROGRESS', label: 'In Progress', accent: 'var(--violet)' },
  { key: 'COMPLETED',   label: 'Completed',   accent: '#16A34A'       },
]

// Valid transitions for MEMBER status updates
const NEXT_STATUS = {
  NOT_STARTED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED:   null,
}
const NEXT_LABEL = {
  NOT_STARTED: 'Start',
  IN_PROGRESS: 'Complete',
  COMPLETED:   null,
}

export default function TaskBoard({ tasks = [], myRole, members = [], onAssign, onStatusUpdate }) {
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

          {grouped[col.key].length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.78rem', color: 'var(--text3)' }}>
              No tasks
            </div>
          )}

          {grouped[col.key].map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              myRole={myRole}
              done={col.key === 'COMPLETED'}
              onAssign={onAssign}
              onStatusUpdate={onStatusUpdate}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function TaskCard({ task, myRole, done, onAssign, onStatusUpdate }) {
  const nextStatus = NEXT_STATUS[task.status]
  const nextLabel  = NEXT_LABEL[task.status]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
        padding: '0.85rem', marginBottom: '0.5rem',
        border: `1px solid ${done ? 'rgba(22,163,74,0.15)' : 'var(--border)'}`,
        opacity: done ? 0.75 : 1, transition: 'var(--transition)',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: done ? 'var(--text2)' : 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.4, textDecoration: done ? 'line-through' : 'none' }}>
        {task.title}
      </div>

      {task.description && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
          {task.description.length > 80 ? task.description.slice(0, 80) + '...' : task.description}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: myRole === 'ADMIN' || (myRole === 'MEMBER' && nextLabel) ? '0.6rem' : 0 }}>
        <PriorityBadge priority={task.priority} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {task.dueDate && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>{formatDate(task.dueDate)}</span>
          )}
          {task.createdByUsername && (
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: getAvatarColor(task.createdByUsername),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', fontWeight: 600, color: '#fff',
              title: task.createdByUsername,
            }}>
              {getInitials(task.createdByUsername)}
            </div>
          )}
        </div>
      </div>

      {/* ADMIN — assign button */}
      {myRole === 'ADMIN' && !done && (
        <button
          onClick={() => onAssign?.(task)}
          style={{
            width: '100%', fontSize: '0.72rem', fontWeight: 500,
            padding: '0.3rem', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            background: 'var(--violet-alpha)', color: 'var(--violet)',
            border: '1px solid rgba(124,58,237,0.2)', transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.18)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--violet-alpha)'}
        >
          Assign to member
        </button>
      )}

      {/* MEMBER — status update button */}
      {myRole === 'MEMBER' && nextLabel && (
        <button
          onClick={() => onStatusUpdate?.(task, nextStatus)}
          style={{
            width: '100%', fontSize: '0.72rem', fontWeight: 500,
            padding: '0.3rem', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            background: 'rgba(22,163,74,0.1)', color: '#16A34A',
            border: '1px solid rgba(22,163,74,0.2)', transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.1)'}
        >
          Mark as {nextLabel}
        </button>
      )}
    </motion.div>
  )
}