import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PriorityBadge } from '../ui/Badge'
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers'
import { UserCheck, Trash2, AlertTriangle, CheckCircle2, Pencil, ExternalLink } from 'lucide-react'
import TaskDetailModal from './TaskDetailModal'

const COLUMNS = [
  { key: 'NOT_STARTED', label: 'Not Started', accent: 'var(--text3)'  },
  { key: 'IN_PROGRESS', label: 'In Progress', accent: 'var(--violet)' },
  { key: 'COMPLETED',   label: 'Completed',   accent: '#16A34A'       },
]

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

export default function TaskBoard({
  tasks = [], myRole, members = [], workspaceId,
  onAssign, onStatusUpdate, onDelete, onEdit,
}) {
  const [selectedTask, setSelectedTask] = useState(null)

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key)
    return acc
  }, {})

  return (
    <>
      <div className="task-board-grid" style={{ display: 'grid', gap: '1rem' }}>
        {COLUMNS.map((col) => (
          <div key={col.key} style={{
            background: 'var(--bg2)', borderRadius: 'var(--radius)',
            padding: '1rem', minHeight: 400,
          }}>
            {/* Column header */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '0.75rem',
            }}>
              <span style={{
                fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em',
                textTransform: 'uppercase', color: 'var(--text2)',
              }}>
                {col.label}
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '0.12rem 0.5rem',
                borderRadius: 99, background: 'var(--bg3)', border: '1px solid var(--border)',
                color: grouped[col.key].length > 0 ? col.accent : 'var(--text3)',
              }}>{grouped[col.key].length}</span>
            </div>

            {grouped[col.key].length === 0 && (
              <div style={{
                textAlign: 'center', padding: '2rem 0',
                fontSize: '0.78rem', color: 'var(--text3)',
              }}>
                No tasks
              </div>
            )}

            {grouped[col.key].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                myRole={myRole}
                done={col.key === 'COMPLETED'}
                onOpenDetail={() => setSelectedTask(task)}
                onAssign={onAssign}
                onStatusUpdate={onStatusUpdate}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Task detail modal — slides in from right */}
      <TaskDetailModal
        task={selectedTask}
        workspaceId={workspaceId}
        myRole={myRole}
        onClose={() => setSelectedTask(null)}
        onAssign={onAssign}
        onEdit={onEdit}
        onStatusUpdate={onStatusUpdate}
        onDelete={onDelete}
      />
      <style>{`
      .task-board-grid { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 900px) { .task-board-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 560px) { .task-board-grid { grid-template-columns: 1fr; } }
    `}</style>
    </>
  )
}

function TaskCard({ task, myRole, done, onOpenDetail, onAssign, onStatusUpdate, onDelete, onEdit }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const nextStatus  = NEXT_STATUS[task.status]
  const nextLabel   = NEXT_LABEL[task.status]
  const isAssigned  = !!task.assignedToUsername
  const wasDeclined = task.lastAssignmentStatus === 'DECLINED'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
        padding: '0.85rem', marginBottom: '0.5rem',
        border: `1px solid ${
          done        ? 'rgba(22,163,74,0.15)' :
          wasDeclined ? 'rgba(245,158,11,0.25)' :
          'var(--border)'
        }`,
        opacity: done ? 0.8 : 1,
        transition: 'var(--transition)',
      }}
    >
      {/* Title row */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        gap: '0.5rem', marginBottom: '0.5rem',
      }}>
        {/* Title — clicking opens detail modal */}
        <div
          onClick={onOpenDetail}
          title="View task details"
          style={{
            flex: 1, fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4,
            textDecoration: done ? 'line-through' : 'none',
            color: done ? 'var(--text2)' : 'var(--text)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { if (!done) e.currentTarget.style.color = 'var(--violet)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = done ? 'var(--text2)' : 'var(--text)' }}
        >
          {task.title}
        </div>

        {/* Admin action icons */}
        {myRole === 'ADMIN' && !confirmDelete && (
          <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
            {/* Detail icon */}
            <button
              onClick={onOpenDetail}
              title="View details"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: '0.1rem',
                display: 'flex', alignItems: 'center',
                transition: 'var(--transition)', borderRadius: 4,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--violet)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
            >
              <ExternalLink size={11} />
            </button>

            {/* Edit icon */}
            <button
              onClick={() => onEdit?.(task)}
              title="Edit task"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: '0.1rem',
                display: 'flex', alignItems: 'center',
                transition: 'var(--transition)', borderRadius: 4,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--violet)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
            >
              <Pencil size={11} />
            </button>

            {/* Delete icon */}
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete task"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text3)', padding: '0.1rem',
                display: 'flex', alignItems: 'center',
                transition: 'var(--transition)', borderRadius: 4,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}

        {/* Delete confirm */}
        {myRole === 'ADMIN' && confirmDelete && (
          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            <button
              onClick={() => { onDelete?.(task); setConfirmDelete(false) }}
              style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.45rem',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                background: 'rgba(220,38,38,0.12)', color: '#DC2626',
                border: '1px solid rgba(220,38,38,0.25)',
              }}
            >Delete</button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.45rem',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                background: 'var(--bg2)', color: 'var(--text3)',
                border: '1px solid var(--border)',
              }}
            >Cancel</button>
          </div>
        )}
      </div>

      {/* Description preview */}
      {task.description && (
        <div style={{
          fontSize: '0.75rem', color: 'var(--text3)',
          marginBottom: '0.5rem', lineHeight: 1.4,
        }}>
          {task.description.length > 70
            ? task.description.slice(0, 70) + '…'
            : task.description}
        </div>
      )}

      {/* Priority + due + avatar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: '0.6rem',
      }}>
        <PriorityBadge priority={task.priority} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {task.dueDate && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.createdByUsername && (
            <div
              title={`Created by ${task.createdByUsername}`}
              style={{
                width: 20, height: 20, borderRadius: '50%',
                background: getAvatarColor(task.createdByUsername),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.55rem', fontWeight: 600, color: '#fff',
              }}
            >
              {getInitials(task.createdByUsername)}
            </div>
          )}
        </div>
      </div>

      {/* ── ADMIN — assign / assigned-to / declined ── */}
      {myRole === 'ADMIN' && !done && (
        <>
          {wasDeclined && !isAssigned && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              marginBottom: '0.5rem',
            }}>
              <AlertTriangle size={11} color="#F59E0B" />
              <span style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 500 }}>
                Last assignment declined
              </span>
            </div>
          )}

          {isAssigned ? (
            <button
              onClick={() => onAssign?.(task)}
              title="Click to re-assign"
              style={{
                width: '100%', fontSize: '0.72rem', fontWeight: 500,
                padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                background: 'rgba(22,163,74,0.08)', color: '#16A34A',
                border: '1px solid rgba(22,163,74,0.2)',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.08)'}
            >
              <UserCheck size={12} />
              <span>Assigned to <strong>{task.assignedToUsername}</strong></span>
            </button>
          ) : (
            <button
              onClick={() => onAssign?.(task)}
              style={{
                width: '100%', fontSize: '0.72rem', fontWeight: 500,
                padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                background: 'var(--violet-alpha)', color: 'var(--violet)',
                border: '1px solid rgba(124,58,237,0.2)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.18)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--violet-alpha)'}
            >
              {wasDeclined ? '↻ Re-assign to member' : '+ Assign to member'}
            </button>
          )}
        </>
      )}

      {/* COMPLETED — show who completed it */}
      {done && task.completedByUsername && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)',
          background: 'rgba(22,163,74,0.08)',
          border: '1px solid rgba(22,163,74,0.15)',
        }}>
          <CheckCircle2 size={12} color="#16A34A" />
          <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 500 }}>
            Completed by <strong>{task.completedByUsername}</strong>
          </span>
        </div>
      )}

      {/* ── MEMBER — status update ── */}
      {myRole === 'MEMBER' && nextLabel && (
        <button
          onClick={() => onStatusUpdate?.(task, nextStatus)}
          style={{
            width: '100%', fontSize: '0.72rem', fontWeight: 500,
            padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            background: 'rgba(22,163,74,0.1)', color: '#16A34A',
            border: '1px solid rgba(22,163,74,0.2)',
            transition: 'var(--transition)',
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