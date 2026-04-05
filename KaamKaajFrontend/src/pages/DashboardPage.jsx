import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { workspaceService, taskService, invitationService, assignmentService } from '../services/endpoints'
import { getGreeting, formatDate } from '../utils/helpers'
import MetricsRow from '../components/dashboard/MetricsRow'
import WorkspaceGrid from '../components/dashboard/WorkspaceGrid'
import InboxPanel from '../components/dashboard/InboxPanel'
import Modal, { ModalFooter } from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import useToastStore from '../store/toastStore'
import { extractApiError } from '../utils/helpers'

// Build activity feed from the data we already have
function buildActivityFeed(workspaces, memberships, allTasks, invitations, assignments) {
  const items = []

  // Workspace memberships
  workspaces.forEach((ws) => {
    const mem = memberships[ws.id]
    if (mem) {
      items.push({
        id: `ws-${ws.id}`,
        color: mem.role === 'ADMIN' ? 'var(--violet)' : 'var(--cyan)',
        text: mem.role === 'ADMIN'
          ? `You created workspace <b>${ws.name}</b>`
          : `You joined workspace <b>${ws.name}</b>`,
        time: ws.createdAt,
      })
    }
  })

  // Tasks across workspaces
  allTasks.forEach((t) => {
    if (t.status === 'COMPLETED') {
      items.push({
        id: `task-done-${t.id}`,
        color: '#16A34A',
        text: `Task <b>${t.title}</b> completed`,
        time: t.updatedAt || t.createdAt,
      })
    } else if (t.status === 'IN_PROGRESS') {
      items.push({
        id: `task-wip-${t.id}`,
        color: 'var(--violet)',
        text: `Task <b>${t.title}</b> is in progress`,
        time: t.updatedAt || t.createdAt,
      })
    } else {
      items.push({
        id: `task-new-${t.id}`,
        color: 'var(--text3)',
        text: `Task <b>${t.title}</b> created`,
        time: t.createdAt,
      })
    }
  })

  // Pending assignments in inbox
  assignments.forEach((a) => {
    items.push({
      id: `asgn-${a.id}`,
      color: '#F59E0B',
      text: `<b>${a.assignedByUsername}</b> assigned you <b>${a.taskTitle}</b>`,
      time: a.requestedAt,
    })
  })

  // Pending invitations in inbox
  invitations.forEach((inv) => {
    items.push({
      id: `inv-${inv.id}`,
      color: 'var(--cyan)',
      text: `<b>${inv.invitedByUsername}</b> invited you to <b>${inv.workspaceName}</b>`,
      time: inv.createdAt,
    })
  })

  // Sort newest first
  items.sort((a, b) => new Date(b.time) - new Date(a.time))

  return items.slice(0, 8)  // show latest 8
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins} minute${mins !== 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  return `${days} day${days !== 1 ? 's' : ''} ago`
}

export default function DashboardPage({ refreshWorkspaces, refreshInbox }) {
  const { isAuthenticated, user } = useAuthStore()
  const { addToast } = useToastStore()

  const [workspaces, setWorkspaces]       = useState([])
  const [myMemberships, setMyMemberships] = useState({})
  const [metrics, setMetrics]             = useState({ workspaces: 0, activeTasks: 0, completed: 0, pending: 0 })
  const [activityFeed, setActivityFeed]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [showCreateWs, setShowCreateWs]   = useState(false)
  const [form, setForm]     = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const fetchData = async () => {
    setLoading(true)
    try {
      const [wsRes, invRes, asgnRes] = await Promise.all([
        workspaceService.list(),
        invitationService.myPending().catch(() => ({ data: [] })),
        assignmentService.myPending().catch(() => ({ data: [] })),
      ])

      const wsList       = wsRes.data
      const invitations  = invRes.data  || []
      const assignments  = asgnRes.data || []
      setWorkspaces(wsList)

      // Memberships per workspace
      const memberships = {}
      await Promise.all(
        wsList.map(async (ws) => {
          try {
            const { data: mem } = await workspaceService.getMyMembership(ws.id)
            memberships[ws.id] = mem
          } catch (_) {}
        })
      )
      setMyMemberships(memberships)

      // Tasks per workspace
      let activeTasks = 0
      let completed   = 0
      const allTasks  = []

      await Promise.all(
        wsList.map(async (ws) => {
          try {
            const role = memberships[ws.id]?.role
            let tasks  = []
            if (role === 'ADMIN') {
              const { data } = await taskService.list(ws.id)
              tasks = data
            } else {
              const { data } = await taskService.myTasks(ws.id)
              tasks = data
            }
            activeTasks += tasks.filter((t) => t.status === 'NOT_STARTED' || t.status === 'IN_PROGRESS').length
            completed   += tasks.filter((t) => t.status === 'COMPLETED').length
            allTasks.push(...tasks)
          } catch (_) {}
        })
      )

      const pending = invitations.length + assignments.length

      setMetrics({ workspaces: wsList.length, activeTasks, completed, pending })

      // Build activity feed from everything we fetched
      setActivityFeed(buildActivityFeed(wsList, memberships, allTasks, invitations, assignments))

    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) { addToast('Workspace name is required', 'error'); return }
    setCreating(true)
    try {
      await workspaceService.create(form)
      addToast(`Workspace "${form.name}" created!`, 'success')
      setForm({ name: '', description: '' })
      setShowCreateWs(false)
      fetchData()
      refreshWorkspaces?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
    setCreating(false)
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '0.25rem' }}>
          {getGreeting()},
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          {user?.username || user?.email} 👋
        </div>
      </div>

      <MetricsRow data={metrics} />

      {/* Workspaces */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text)' }}>
          Your Workspaces
        </h2>
        <Button variant="primary" size="sm" onClick={() => setShowCreateWs(true)}>+ New workspace</Button>
      </div>

      {loading
        ? <div style={{ fontSize: '0.875rem', color: 'var(--text3)', padding: '2rem 0' }}>Loading...</div>
        : <WorkspaceGrid workspaces={workspaces} myMemberships={myMemberships} onNew={() => setShowCreateWs(true)} />
      }

      {/* Activity + Inbox */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem', marginTop: '1rem' }}>

        {/* Activity Feed */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{
            fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-display)',
            color: 'var(--text)', marginBottom: '1rem',
            paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)',
          }}>
            Recent Activity
          </div>

          {loading && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', textAlign: 'center', padding: '2rem 0' }}>
              Loading activity...
            </div>
          )}

          {!loading && activityFeed.length === 0 && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', textAlign: 'center', padding: '2rem 0' }}>
              No activity yet — create a workspace or task to get started.
            </div>
          )}

          {!loading && activityFeed.map((item, idx) => (
            <div key={item.id} style={{
              display: 'flex', gap: '0.75rem',
              padding: '0.65rem 0',
              borderBottom: idx < activityFeed.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              {/* Colored dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: item.color, marginTop: 6, flexShrink: 0,
              }} />
              <div>
                <div
                  style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '0.15rem' }}>
                  {timeAgo(item.time)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <InboxPanel onRespond={fetchData} />
      </div>

      {/* Create workspace modal */}
      <Modal open={showCreateWs} onClose={() => setShowCreateWs(false)} title="Create workspace" subtitle="Give your workspace a name. You'll be the admin.">
        <Input
          label="Workspace name"
          placeholder="e.g. Product Team"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Textarea
          label="Description (optional)"
          placeholder="What does this workspace focus on?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateWs(false)}>Cancel</Button>
          <Button variant="primary" size="sm" loading={creating} onClick={handleCreate}>
            Create workspace
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}