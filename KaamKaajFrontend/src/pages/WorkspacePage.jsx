import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { workspaceService, taskService, invitationService, assignmentService } from '../services/endpoints'
import TaskBoard from '../components/workspace/TaskBoard'
import MembersTable from '../components/workspace/MembersTable'
import InvitationsTable from '../components/workspace/InvitationsTable'
import Modal, { ModalFooter } from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import useToastStore from '../store/toastStore'
import { extractApiError, getInitials } from '../utils/helpers'

const TABS = ['Tasks Board', 'Members', 'Invitations']

const WS_GRADS = [
  'linear-gradient(135deg,#7C3AED,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#10B981,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
]

export default function WorkspacePage({ refreshInbox }) {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { addToast } = useToastStore()

  const [workspace, setWorkspace]     = useState(null)
  const [myMembership, setMyMembership] = useState(null)
  const [tasks, setTasks]             = useState([])
  const [members, setMembers]         = useState([])
  const [invitations, setInvitations] = useState([])
  const [activeTab, setActiveTab]     = useState(0)
  const [loading, setLoading]         = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
  const [creatingTask, setCreatingTask] = useState(false)

  // Assignment modal state — for ADMIN assigning tasks to members
  const [showAssign, setShowAssign]   = useState(false)
  const [assignTask, setAssignTask]   = useState(null)
  const [assigneeId, setAssigneeId]   = useState('')
  const [assigning, setAssigning]     = useState(false)

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const fetchAll = async () => {
  try {
    const [wsRes, myMemRes, memRes] = await Promise.all([
      workspaceService.get(workspaceId),
      workspaceService.getMyMembership(workspaceId),
      workspaceService.getMembers(workspaceId).catch(() => ({ data: [] })),
    ])
    setWorkspace(wsRes.data)
    setMyMembership(myMemRes.data)
    setMembers(memRes.data)

    const role = myMemRes.data?.role
    await fetchTasks(role)

    if (role === 'ADMIN') {
      const invRes = await invitationService.list(workspaceId).catch(() => ({ data: [] }))
      setInvitations(invRes.data)
    }
  } catch (err) {
    addToast('Failed to load workspace', 'error')
    navigate('/dashboard')
  }

    setLoading(false)
  }

  const fetchTasks = async (role) => {
    try {
      // ADMIN sees all tasks in the workspace
      // MEMBER sees only tasks assigned to them (accepted)
      if (role === 'ADMIN') {
        const { data } = await taskService.list(workspaceId)
        setTasks(data)
      } else {
        const { data } = await taskService.myTasks(workspaceId)
        setTasks(data)
      }
    } catch (_) {}
  }

  useEffect(() => {
    // Replace the fetchAll and useEffect load function in WorkspacePage.jsx

const load = async () => {
  setLoading(true)
  try {
    const [wsRes, myMemRes] = await Promise.all([
      workspaceService.get(workspaceId),
      workspaceService.getMyMembership(workspaceId),
    ])
    setWorkspace(wsRes.data)
    setMyMembership(myMemRes.data)

    const role = myMemRes.data?.role
    await fetchTasks(role)

    // ALL members (admin and member) can see the member list
    // of their own workspace — same team should know each other
    const memRes = await workspaceService.getMembers(workspaceId).catch(() => ({ data: [] }))
    setMembers(memRes.data)

    // Only ADMIN sees invitations
    if (role === 'ADMIN') {
      const invRes = await invitationService.list(workspaceId).catch(() => ({ data: [] }))
      setInvitations(invRes.data)
    }
  } catch (err) {
    addToast('Failed to load workspace', 'error')
    navigate('/dashboard')
  }
  setLoading(false)
}
    load()
  }, [workspaceId])

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) { addToast('Task title is required', 'error'); return }
    setCreatingTask(true)
    try {
      await taskService.create(workspaceId, { ...taskForm, dueDate: taskForm.dueDate || undefined })
      addToast('Task created!', 'success')
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
      setShowCreateTask(false)
      fetchTasks('ADMIN')
    } catch (err) { addToast(extractApiError(err), 'error') }
    setCreatingTask(false)
  }

  // ADMIN assigns a task to a member
  const handleAssign = async () => {
    if (!assigneeId) { addToast('Select a member to assign', 'error'); return }
    setAssigning(true)
    try {
      await assignmentService.create(workspaceId, assignTask.id, assigneeId)
      addToast('Assignment request sent!', 'success')
      setShowAssign(false)
      setAssignTask(null)
      setAssigneeId('')
      fetchTasks('ADMIN')
      refreshInbox?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
    setAssigning(false)
  }

  // MEMBER updates task status
  const handleStatusUpdate = async (task, newStatus) => {
    try {
      await taskService.updateStatus(workspaceId, task.id, newStatus)
      addToast('Status updated!', 'success')
      fetchTasks('MEMBER')
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', color: 'var(--text3)' }}>
      Loading workspace...
    </div>
  )

  const wsIdx = workspaceId.charCodeAt(0) % WS_GRADS.length
  const grad  = WS_GRADS[wsIdx]
  const myRole = myMembership?.role

  // Only show Invitations tab to admins
  const visibleTabs = myRole === 'ADMIN' ? TABS : ['Tasks Board', 'Members']

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.75rem' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text2)' }} onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.target.style.color = 'var(--violet)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text2)'}
          >Dashboard</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>{workspace?.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              {getInitials(workspace?.name || '')}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                {workspace?.name}
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: '0.1rem' }}>
                {myRole === 'ADMIN' ? `${members.length} members` : 'Member'} · {myRole}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {myRole === 'ADMIN' && (
              <Button variant="primary" size="sm" onClick={() => setShowCreateTask(true)}>+ New task</Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 2rem', background: 'var(--bg3)', gap: '0.25rem' }}>
        {visibleTabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            fontSize: '0.875rem', fontWeight: activeTab === i ? 500 : 400,
            color: activeTab === i ? 'var(--violet)' : 'var(--text2)',
            padding: '0.75rem 1rem', cursor: 'pointer', border: 'none',
            background: 'none', fontFamily: 'var(--font-body)',
            borderBottom: `2px solid ${activeTab === i ? 'var(--violet)' : 'transparent'}`,
            marginBottom: -1, transition: 'var(--transition)',
          }}>{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '1.5rem 2rem', maxWidth: 1200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
          >
            {activeTab === 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
                    {myRole === 'MEMBER' ? 'Your assigned tasks' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} total`}
                  </span>
                </div>
                <TaskBoard
                  tasks={tasks}
                  myRole={myRole}
                  members={members}
                  onAssign={(task) => { setAssignTask(task); setShowAssign(true) }}
                  onStatusUpdate={handleStatusUpdate}
                />
              </>
            )}
            {activeTab === 1 && (
              <MembersTable
                members={myRole === 'ADMIN' ? members : [myMembership ? {
                  memberId: myMembership.memberId,
                  userId: myMembership.userId,
                  username: myMembership.username,
                  email: myMembership.email,
                  role: myMembership.role,
                  joinedAt: myMembership.joinedAt,
                } : null].filter(Boolean)}
                workspaceId={workspaceId}
                myRole={myRole}
                onRefresh={fetchAll}
              />
            )}
            {activeTab === 2 && myRole === 'ADMIN' && (
              <InvitationsTable
                invitations={invitations}
                workspaceId={workspaceId}
                myRole={myRole}
                onRefresh={fetchAll}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Create task modal */}
      <Modal open={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create task" subtitle="Add a new task to this workspace.">
        <Input label="Task title" placeholder="e.g. Implement pagination" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
        <Textarea label="Description (optional)" placeholder="What needs to be done?" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select label="Priority" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
          <Input label="Due date" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
        </div>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateTask(false)}>Cancel</Button>
          <Button variant="primary" size="sm" loading={creatingTask} onClick={handleCreateTask}>Create task</Button>
        </ModalFooter>
      </Modal>

      {/* Assign task modal — ADMIN only */}
      <Modal
        open={showAssign}
        onClose={() => { setShowAssign(false); setAssignTask(null); setAssigneeId('') }}
        title="Assign task"
        subtitle={`Assign "${assignTask?.title}" to a workspace member.`}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text2)', marginBottom: '0.4rem' }}>
            Select member
          </label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            style={{ width: '100%', height: 42, border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '0.9rem', padding: '0 0.9rem', fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">— Choose a member —</option>
            {members
              .filter((m) => m.role === 'MEMBER')
              .map((m) => (
                <option key={m.userId} value={m.userId}>{m.username} ({m.email})</option>
              ))
            }
          </select>
          {members.filter((m) => m.role === 'MEMBER').length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.5rem' }}>
              No members yet. Invite someone first.
            </p>
          )}
        </div>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => { setShowAssign(false); setAssignTask(null); setAssigneeId('') }}>Cancel</Button>
          <Button variant="primary" size="sm" loading={assigning} onClick={handleAssign}>Send assignment</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}