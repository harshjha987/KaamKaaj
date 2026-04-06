import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckSquare, ExternalLink } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { workspaceService, taskService } from '../services/endpoints'
import { PriorityBadge } from '../components/ui/Badge'
import { formatDate, getInitials, getAvatarColor } from '../utils/helpers'
import useToastStore from '../store/toastStore'
import { extractApiError } from '../utils/helpers'

const STATUS_META = {
  NOT_STARTED: { label: 'Not Started', color: 'var(--text3)',  bg: 'rgba(100,100,100,0.08)' },
  IN_PROGRESS:  { label: 'In Progress', color: 'var(--violet)', bg: 'var(--violet-alpha)'    },
  COMPLETED:    { label: 'Completed',   color: '#16A34A',       bg: 'rgba(22,163,74,0.08)'   },
}

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

export default function MyTasksPage() {
  const { isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')  // ALL | NOT_STARTED | IN_PROGRESS | COMPLETED
  const [workspaceMap, setWorkspaceMap] = useState({})  // workspaceId → workspace name

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Get all workspaces the user belongs to
      const { data: workspaces } = await workspaceService.list()

      // Build a map of workspaceId → name for display
      const wsMap = {}
      workspaces.forEach((ws) => { wsMap[ws.id] = ws.name })
      setWorkspaceMap(wsMap)

      // Fetch accepted tasks from every workspace in parallel
      const results = await Promise.all(
        workspaces.map((ws) =>
          taskService.myTasks(ws.id).catch(() => ({ data: [] }))
        )
      )

      // Flatten all tasks into one list, tagging each with workspaceId
      const allTasks = results.flatMap((res, i) =>
        (res.data || []).map((t) => ({ ...t, workspaceId: workspaces[i].id }))
      )

      // Sort: in-progress first, then not started, then completed
      const ORDER = { IN_PROGRESS: 0, NOT_STARTED: 1, COMPLETED: 2 }
      allTasks.sort((a, b) => (ORDER[a.status] ?? 3) - (ORDER[b.status] ?? 3))

      setTasks(allTasks)
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const handleStatusUpdate = async (task, newStatus) => {
    try {
      await taskService.updateStatus(task.workspaceId, task.id, newStatus)
      addToast('Status updated!', 'success')
      fetchAll()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const filtered = filter === 'ALL'
    ? tasks
    : tasks.filter((t) => t.status === filter)

  const counts = {
    ALL:         tasks.length,
    NOT_STARTED: tasks.filter((t) => t.status === 'NOT_STARTED').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED:   tasks.filter((t) => t.status === 'COMPLETED').length,
  }

  const FILTERS = [
    { key: 'ALL',         label: 'All tasks'    },
    { key: 'IN_PROGRESS', label: 'In progress'  },
    { key: 'NOT_STARTED', label: 'Not started'  },
    { key: 'COMPLETED',   label: 'Completed'    },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: 'var(--violet-alpha)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckSquare size={18} color="var(--violet)" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem',
            fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)',
          }}>
            My Tasks
          </h1>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginLeft: '3rem' }}>
          All tasks assigned to you across your workspaces
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
      }}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              fontSize: '0.85rem', fontWeight: filter === key ? 500 : 400,
              color: filter === key ? 'var(--violet)' : 'var(--text2)',
              padding: '0.6rem 1rem', cursor: 'pointer',
              border: 'none', background: 'none',
              fontFamily: 'var(--font-body)',
              borderBottom: `2px solid ${filter === key ? 'var(--violet)' : 'transparent'}`,
              marginBottom: -1, transition: 'var(--transition)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {label}
            {counts[key] > 0 && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                padding: '0.1rem 0.4rem', borderRadius: 99,
                background: filter === key ? 'var(--violet)' : 'var(--bg2)',
                color: filter === key ? '#fff' : 'var(--text3)',
                border: `1px solid ${filter === key ? 'transparent' : 'var(--border)'}`,
              }}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', fontSize: '0.875rem', color: 'var(--text3)' }}>
          Loading your tasks...
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--bg3)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            {filter === 'COMPLETED' ? '🎉' : '📋'}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.35rem' }}>
            {filter === 'ALL'
              ? 'No tasks assigned yet'
              : `No ${STATUS_META[filter]?.label.toLowerCase()} tasks`
            }
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
            {filter === 'ALL'
              ? 'Tasks assigned to you will appear here once you accept them from your inbox.'
              : 'Switch to another filter to see your other tasks.'
            }
          </div>
        </div>
      )}

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((task, idx) => {
          const meta      = STATUS_META[task.status]
          const nextStatus = NEXT_STATUS[task.status]
          const nextLabel  = NEXT_LABEL[task.status]
          const wsName     = workspaceMap[task.workspaceId] || 'Workspace'
          const isDone     = task.status === 'COMPLETED'

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              style={{
                background: 'var(--bg3)',
                border: `1px solid ${isDone ? 'rgba(22,163,74,0.15)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                padding: '1rem 1.25rem',
                opacity: isDone ? 0.8 : 1,
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = isDone ? 'rgba(22,163,74,0.15)' : 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>

                {/* Status dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: meta.color, marginTop: 5, flexShrink: 0,
                }} />

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Title + workspace */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.92rem', fontWeight: 500,
                      color: isDone ? 'var(--text2)' : 'var(--text)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </span>

                    {/* Workspace chip — clicking goes to that workspace */}
                    <button
                      onClick={() => navigate(`/workspace/${task.workspaceId}`)}
                      title="Open workspace"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        fontSize: '0.68rem', fontWeight: 500,
                        padding: '0.15rem 0.5rem', borderRadius: 99,
                        background: 'var(--bg2)', color: 'var(--text3)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--violet)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <ExternalLink size={9} />
                      {wsName}
                    </button>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                      {task.description.length > 100 ? task.description.slice(0, 100) + '...' : task.description}
                    </div>
                  )}

                  {/* Meta row — priority, due date, assigned by */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <PriorityBadge priority={task.priority} />

                    {task.dueDate && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}

                    {task.createdByUsername && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%',
                          background: getAvatarColor(task.createdByUsername),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.45rem', fontWeight: 700, color: '#fff',
                        }}>
                          {getInitials(task.createdByUsername)}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                          from {task.createdByUsername}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side — status badge + action button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                  {/* Status badge */}
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 600,
                    padding: '0.2rem 0.6rem', borderRadius: 99,
                    background: meta.bg, color: meta.color,
                    border: `1px solid ${meta.color}25`,
                    whiteSpace: 'nowrap',
                  }}>
                    {meta.label}
                  </span>

                  {/* Status update button */}
                  {nextLabel && (
                    <button
                      onClick={() => handleStatusUpdate(task, nextStatus)}
                      style={{
                        fontSize: '0.72rem', fontWeight: 500,
                        padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        background: 'rgba(22,163,74,0.1)', color: '#16A34A',
                        border: '1px solid rgba(22,163,74,0.2)',
                        transition: 'var(--transition)', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.1)'}
                    >
                      Mark as {nextLabel}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}