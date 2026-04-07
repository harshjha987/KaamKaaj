import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, User, Clock, Tag,
  CheckCircle2, Circle, Loader, AlertTriangle,
  UserCheck, History,
} from 'lucide-react'
import { assignmentService } from '../../services/endpoints'
import { PriorityBadge } from '../ui/Badge'
import Avatar from '../ui/Avatar'
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers'

// Status display config
const STATUS_META = {
  NOT_STARTED: { label: 'Not Started', color: 'var(--text3)',  icon: Circle,       bg: 'rgba(100,100,100,0.08)' },
  IN_PROGRESS:  { label: 'In Progress', color: 'var(--violet)', icon: Loader,       bg: 'var(--violet-alpha)'    },
  COMPLETED:    { label: 'Completed',   color: '#16A34A',       icon: CheckCircle2, bg: 'rgba(22,163,74,0.08)'   },
}

// Assignment status display config
const ASSIGNMENT_STATUS_META = {
  PENDING:   { label: 'Pending',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
  ACCEPTED:  { label: 'Accepted',  color: '#16A34A', bg: 'rgba(22,163,74,0.08)'   },
  DECLINED:  { label: 'Declined',  color: '#DC2626', bg: 'rgba(220,38,38,0.08)'   },
  CANCELLED: { label: 'Cancelled', color: 'var(--text3)', bg: 'var(--bg2)'        },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function TaskDetailModal({ task, workspaceId, myRole, onClose, onEdit, onAssign, onStatusUpdate, onDelete }) {
  const [assignments, setAssignments] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [activeSection, setActiveSection] = useState('details') // details | history

  useEffect(() => {
    if (!task) return
    // Fetch assignment history when modal opens
    const fetchHistory = async () => {
      setLoadingHistory(true)
      try {
        const { data } = await assignmentService.history(workspaceId, task.id)
        setAssignments(data)
      } catch (_) {}
      setLoadingHistory(false)
    }
    fetchHistory()
  }, [task?.id])

  if (!task) return null

  const statusMeta = STATUS_META[task.status] || STATUS_META.NOT_STARTED
  const StatusIcon = statusMeta.icon
  const isDone     = task.status === 'COMPLETED'
  const wasDeclined = task.lastAssignmentStatus === 'DECLINED'
  const isAssigned  = !!task.assignedToUsername

  const NEXT_STATUS = { NOT_STARTED: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED', COMPLETED: null }
  const NEXT_LABEL  = { NOT_STARTED: 'Start task', IN_PROGRESS: 'Mark complete', COMPLETED: null }
  const nextStatus  = NEXT_STATUS[task.status]
  const nextLabel   = NEXT_LABEL[task.status]

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: 480,
              background: 'var(--bg3)',
              borderLeft: '1px solid var(--border)',
              zIndex: 301, overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '1rem',
              position: 'sticky', top: 0,
              background: 'var(--bg3)', zIndex: 1,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Status badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  fontSize: '0.68rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                  borderRadius: 99, background: statusMeta.bg, color: statusMeta.color,
                  border: `1px solid ${statusMeta.color}25`,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  marginBottom: '0.6rem',
                }}>
                  <StatusIcon size={10} />
                  {statusMeta.label}
                </div>

                {/* Title */}
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.15rem',
                  fontWeight: 700, color: isDone ? 'var(--text2)' : 'var(--text)',
                  lineHeight: 1.3, letterSpacing: '-0.01em',
                  textDecoration: isDone ? 'line-through' : 'none',
                  wordBreak: 'break-word',
                }}>
                  {task.title}
                </h2>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text3)', padding: '0.25rem', flexShrink: 0,
                  display: 'flex', alignItems: 'center',
                  borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text3)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Section tabs ── */}
            <div style={{
              display: 'flex', borderBottom: '1px solid var(--border)',
              padding: '0 1.5rem', gap: '0.25rem',
            }}>
              {[
                { key: 'details', label: 'Details' },
                { key: 'history', label: `Assignment History${assignments.length > 0 ? ` (${assignments.length})` : ''}` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  style={{
                    fontSize: '0.82rem', fontWeight: activeSection === key ? 500 : 400,
                    color: activeSection === key ? 'var(--violet)' : 'var(--text2)',
                    padding: '0.65rem 0.5rem', cursor: 'pointer',
                    border: 'none', background: 'none',
                    fontFamily: 'var(--font-body)',
                    borderBottom: `2px solid ${activeSection === key ? 'var(--violet)' : 'transparent'}`,
                    marginBottom: -1, transition: 'var(--transition)',
                    whiteSpace: 'nowrap',
                  }}
                >{label}</button>
              ))}
            </div>

            {/* ── Details section ── */}
            {activeSection === 'details' && (
              <div style={{ padding: '1.5rem', flex: 1 }}>

                {/* Description */}
                {task.description ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.5rem',
                    }}>Description</div>
                    <div style={{
                      fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.7,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      border: '1px solid var(--border)',
                    }}>
                      {task.description}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    marginBottom: '1.5rem', padding: '0.85rem 1rem',
                    background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border)',
                    fontSize: '0.82rem', color: 'var(--text3)', fontStyle: 'italic',
                  }}>
                    No description added yet.
                  </div>
                )}

                {/* Meta grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '1rem', marginBottom: '1.5rem',
                }}>
                  <MetaItem icon={Tag} label="Priority">
                    <PriorityBadge priority={task.priority} />
                  </MetaItem>

                  <MetaItem icon={Calendar} label="Due date">
                    <span style={{ fontSize: '0.82rem', color: task.dueDate ? 'var(--text)' : 'var(--text3)' }}>
                      {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                    </span>
                  </MetaItem>

                  <MetaItem icon={User} label="Created by">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: getAvatarColor(task.createdByUsername || ''),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.45rem', fontWeight: 700, color: '#fff',
                      }}>
                        {getInitials(task.createdByUsername || '')}
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text)' }}>
                        {task.createdByUsername || '—'}
                      </span>
                    </div>
                  </MetaItem>

                  <MetaItem icon={Clock} label="Created">
                    <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                      {task.createdAt ? timeAgo(task.createdAt) : '—'}
                    </span>
                  </MetaItem>
                </div>

                {/* Assignment status */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.5rem',
                  }}>
                    Assignment
                  </div>

                  {/* Declined indicator */}
                  {wasDeclined && !isAssigned && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      marginBottom: '0.5rem',
                    }}>
                      <AlertTriangle size={13} color="#F59E0B" />
                      <span style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 500 }}>
                        Last assignment was declined
                      </span>
                    </div>
                  )}

                  {/* Completed by */}
                  {isDone && task.completedByUsername && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(22,163,74,0.08)',
                      border: '1px solid rgba(22,163,74,0.2)',
                    }}>
                      <CheckCircle2 size={13} color="#16A34A" />
                      <div style={{ fontSize: '0.78rem', color: '#16A34A' }}>
                        Completed by <strong>{task.completedByUsername}</strong>
                      </div>
                    </div>
                  )}

                  {/* Currently assigned */}
                  {isAssigned && !isDone && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
                      background: 'rgba(22,163,74,0.08)',
                      border: '1px solid rgba(22,163,74,0.2)',
                    }}>
                      <UserCheck size={13} color="#16A34A" />
                      <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
                        Assigned to <strong style={{ color: 'var(--text)' }}>{task.assignedToUsername}</strong>
                      </div>
                    </div>
                  )}

                  {/* Unassigned */}
                  {!isAssigned && !wasDeclined && !isDone && (
                    <div style={{
                      padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg2)', border: '1px dashed var(--border)',
                      fontSize: '0.78rem', color: 'var(--text3)', fontStyle: 'italic',
                    }}>
                      Not assigned to anyone yet.
                    </div>
                  )}
                </div>

                {/* ── Action buttons ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                  {/* ADMIN actions */}
                  {myRole === 'ADMIN' && (
                    <>
                      {!isDone && (
                        <button
                          onClick={() => { onAssign?.(task); onClose() }}
                          style={{
                            width: '100%', padding: '0.7rem',
                            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            fontSize: '0.875rem', fontWeight: 500,
                            fontFamily: 'var(--font-body)',
                            background: 'var(--violet-alpha)', color: 'var(--violet)',
                            border: '1px solid rgba(124,58,237,0.2)',
                            transition: 'var(--transition)',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(124,58,237,0.18)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--violet-alpha)'}
                        >
                          {isAssigned ? '↻ Re-assign to member' : '+ Assign to member'}
                        </button>
                      )}
                      <button
                        onClick={() => { onEdit?.(task); onClose() }}
                        style={{
                          width: '100%', padding: '0.7rem',
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          fontSize: '0.875rem', fontWeight: 500,
                          fontFamily: 'var(--font-body)',
                          background: 'var(--bg2)', color: 'var(--text2)',
                          border: '1px solid var(--border)',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text2)' }}
                      >
                        ✏ Edit task
                      </button>
                      <button
                        onClick={() => { onDelete?.(task); onClose() }}
                        style={{
                          width: '100%', padding: '0.7rem',
                          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          fontSize: '0.875rem', fontWeight: 500,
                          fontFamily: 'var(--font-body)',
                          background: 'rgba(220,38,38,0.06)', color: '#DC2626',
                          border: '1px solid rgba(220,38,38,0.15)',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.12)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
                      >
                        🗑 Delete task
                      </button>
                    </>
                  )}

                  {/* MEMBER actions */}
                  {myRole === 'MEMBER' && nextLabel && (
                    <button
                      onClick={() => { onStatusUpdate?.(task, nextStatus); onClose() }}
                      style={{
                        width: '100%', padding: '0.7rem',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontSize: '0.875rem', fontWeight: 500,
                        fontFamily: 'var(--font-body)',
                        background: 'rgba(22,163,74,0.1)', color: '#16A34A',
                        border: '1px solid rgba(22,163,74,0.2)',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.1)'}
                    >
                      ✓ {nextLabel}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Assignment history section ── */}
            {activeSection === 'history' && (
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '1rem',
                }}>
                  Assignment History
                </div>

                {loadingHistory && (
                  <div style={{ textAlign: 'center', padding: '2rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
                    Loading history...
                  </div>
                )}

                {!loadingHistory && assignments.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '2rem',
                    background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border)',
                    fontSize: '0.82rem', color: 'var(--text3)',
                  }}>
                    No assignments yet for this task.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {assignments.map((a, idx) => {
                    const aMeta = ASSIGNMENT_STATUS_META[a.status] || ASSIGNMENT_STATUS_META.PENDING
                    return (
                      <div
                        key={a.id}
                        style={{
                          background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
                          padding: '0.85rem 1rem',
                          border: '1px solid var(--border)',
                          position: 'relative',
                        }}
                      >
                        {/* Timeline dot */}
                        <div style={{
                          position: 'absolute', left: -1, top: '50%',
                          transform: 'translateY(-50%)',
                          width: 3, height: '60%', borderRadius: '0 2px 2px 0',
                          background: aMeta.color,
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          {/* Assignee */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Avatar name={a.assigneeUsername} size={22} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
                              {a.assigneeUsername}
                            </span>
                          </div>

                          {/* Status badge */}
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 600,
                            padding: '0.15rem 0.5rem', borderRadius: 99,
                            background: aMeta.bg, color: aMeta.color,
                            border: `1px solid ${aMeta.color}30`,
                          }}>
                            {aMeta.label}
                          </span>
                        </div>

                        {/* Assigned by + time */}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)', lineHeight: 1.5 }}>
                          Assigned by <strong style={{ color: 'var(--text2)' }}>{a.assignedByUsername}</strong>
                          {' · '}{timeAgo(a.requestedAt)}
                          {a.respondedAt && (
                            <span> · responded {timeAgo(a.respondedAt)}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Small reusable label + value row
function MetaItem({ icon: Icon, label, children }) {
  return (
    <div style={{
      background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
      padding: '0.75rem', border: '1px solid var(--border)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.05em',
        textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.4rem',
      }}>
        <Icon size={10} />
        {label}
      </div>
      {children}
    </div>
  )
}