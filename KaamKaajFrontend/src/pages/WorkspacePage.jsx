import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import {
  workspaceService, taskService,
  invitationService, assignmentService,
} from '../services/endpoints'
import TaskBoard from '../components/workspace/TaskBoard'
import MembersTable from '../components/workspace/MembersTable'
import InvitationsTable from '../components/workspace/InvitationsTable'
import Pagination from '../components/ui/Pagination'
import Modal, { ModalFooter } from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import useToastStore from '../store/toastStore'
import { extractApiError, getInitials } from '../utils/helpers'

const WS_GRADS = [
  'linear-gradient(135deg,#7C3AED,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#10B981,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
]

export default function WorkspacePage({ refreshInbox }) {
  const { workspaceId } = useParams()
  const navigate        = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addToast }    = useToastStore()

  // ── Core state ────────────────────────────────────────────
  const [workspace, setWorkspace]       = useState(null)
  const [myMembership, setMyMembership] = useState(null)
  const [members, setMembers]           = useState([])
  const [invitations, setInvitations]   = useState([])
  const [tasks, setTasks]               = useState([])
  const [activeTab, setActiveTab]       = useState(0)
  const [loading, setLoading]           = useState(true)

  // ── Pagination state ──────────────────────────────────────
  const [taskPage, setTaskPage]               = useState(0)
  const [taskTotalPages, setTaskTotalPages]   = useState(0)
  const [memberPage, setMemberPage]           = useState(0)
  const [memberTotalPages, setMemberTotalPages] = useState(0)
  const [invPage, setInvPage]                 = useState(0)
  const [invTotalPages, setInvTotalPages]     = useState(0)

  // ── Create task modal ─────────────────────────────────────
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
  const [creatingTask, setCreatingTask]     = useState(false)

  // ── Assign task modal (admin only) ────────────────────────
  const [showAssign, setShowAssign] = useState(false)
  const [assignTask, setAssignTask] = useState(null)
  const [assigneeId, setAssigneeId] = useState('')
  const [assigning, setAssigning]   = useState(false)

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  // ── Fetch tasks by role ───────────────────────────────────
  const fetchTasks = async (role, page = 0) => {
    try {
      if (role === 'ADMIN') {
        const { data } = await taskService.list(workspaceId, page)
        // Spring Page response: { content, totalPages, number }
        setTasks(data.content ?? data)
        setTaskTotalPages(data.totalPages ?? 0)
      } else {
        // Members only see their accepted tasks — no pagination needed
        const { data } = await taskService.myTasks(workspaceId)
        setTasks(data)
      }
    } catch (_) {}
  }

  // ── Fetch members ─────────────────────────────────────────
  const fetchMembers = async (page = 0) => {
    try {
      const { data } = await workspaceService.getMembers(workspaceId, page)
      setMembers(data.content ?? data)
      setMemberTotalPages(data.totalPages ?? 0)
    } catch (_) { setMembers([]) }
  }

  // ── Fetch invitations (admin only) ────────────────────────
  const fetchInvitations = async (page = 0) => {
    try {
      const { data } = await invitationService.list(workspaceId, page)
      setInvitations(data.content ?? data)
      setInvTotalPages(data.totalPages ?? 0)
    } catch (_) { setInvitations([]) }
  }

  // ── Initial load ──────────────────────────────────────────
  useEffect(() => {
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
        await Promise.all([
          fetchTasks(role, 0),
          fetchMembers(0),
          ...(role === 'ADMIN' ? [fetchInvitations(0)] : []),
        ])
      } catch (err) {
        addToast('Failed to load workspace', 'error')
        navigate('/dashboard')
      }
      setLoading(false)
    }
    load()
  }, [workspaceId])

  // ── Refresh all (used after member/invitation changes) ────
  const fetchAll = async () => {
    try {
      const [wsRes, myMemRes] = await Promise.all([
        workspaceService.get(workspaceId),
        workspaceService.getMyMembership(workspaceId),
      ])
      setWorkspace(wsRes.data)
      setMyMembership(myMemRes.data)

      const role = myMemRes.data?.role
      await Promise.all([
        fetchTasks(role, taskPage),
        fetchMembers(memberPage),
        ...(role === 'ADMIN' ? [fetchInvitations(invPage)] : []),
      ])
    } catch (_) {}
  }

  // ── Create task ───────────────────────────────────────────
  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) { addToast('Task title is required', 'error'); return }
    setCreatingTask(true)
    try {
      await taskService.create(workspaceId, {
        ...taskForm,
        dueDate: taskForm.dueDate || undefined,
      })
      addToast('Task created!', 'success')
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
      setShowCreateTask(false)
      fetchTasks('ADMIN', 0)
      setTaskPage(0)
    } catch (err) { addToast(extractApiError(err), 'error') }
    setCreatingTask(false)
  }

  // ── Assign task (admin) ───────────────────────────────────
  const handleAssign = async () => {
    if (!assigneeId) { addToast('Select a member to assign', 'error'); return }
    setAssigning(true)
    try {
      await assignmentService.create(workspaceId, assignTask.id, assigneeId)
      addToast('Assignment request sent!', 'success')
      setShowAssign(false)
      setAssignTask(null)
      setAssigneeId('')
      fetchTasks('ADMIN', taskPage)
      refreshInbox?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
    setAssigning(false)
  }

  // ── Status update (member) ────────────────────────────────
  const handleStatusUpdate = async (task, newStatus) => {
    try {
      await taskService.updateStatus(workspaceId, task.id, newStatus)
      addToast('Status updated!', 'success')
      fetchTasks('MEMBER')
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  // ── Delete task (admin) ───────────────────────────────────
  const handleDelete = async (task) => {
    try {
      await taskService.delete(workspaceId, task.id)
      addToast(`"${task.title}" deleted`, 'info')
      fetchTasks('ADMIN', taskPage)
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  // ── Loading screen ────────────────────────────────────────
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)', color: 'var(--text3)',
    }}>
      Loading workspace...
    </div>
  )

  const wsIdx  = workspaceId.charCodeAt(0) % WS_GRADS.length
  const grad   = WS_GRADS[wsIdx]
  const myRole = myMembership?.role

  // Tabs — members only see Tasks + Members, not Invitations
  const visibleTabs = myRole === 'ADMIN'
    ? ['Tasks Board', 'Members', 'Invitations']
    : ['Tasks Board', 'Members']

  return (
    <div>
      {/* ── Header ── */}
      <div style={{
        background: 'var(--bg3)', borderBottom: '1px solid var(--border)',
        padding: '1.5rem 2rem',
      }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.75rem',
        }}>
          <span
            style={{ cursor: 'pointer', color: 'var(--text2)', transition: 'var(--transition)' }}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.target.style.color = 'var(--violet)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text2)'}
          >Dashboard</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>{workspace?.name}</span>
        </div>

        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: grad, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'var(--font-display)',
              fontSize: '0.9rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {getInitials(workspace?.name || '')}
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.4rem',
                fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)',
              }}>
                {workspace?.name}
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: '0.1rem' }}>
                {members.length} member{members.length !== 1 ? 's' : ''} · {myRole}
              </div>
            </div>
          </div>

          {myRole === 'ADMIN' && (
            <Button variant="primary" size="sm" onClick={() => setShowCreateTask(true)}>
              + New task
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        padding: '0 2rem', background: 'var(--bg3)', gap: '0.25rem',
        overflowX: 'auto',
      }}>
        {visibleTabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              fontSize: '0.875rem', fontWeight: activeTab === i ? 500 : 400,
              color: activeTab === i ? 'var(--violet)' : 'var(--text2)',
              padding: '0.75rem 1rem', cursor: 'pointer', border: 'none',
              background: 'none', fontFamily: 'var(--font-body)',
              borderBottom: `2px solid ${activeTab === i ? 'var(--violet)' : 'transparent'}`,
              marginBottom: -1, transition: 'var(--transition)', whiteSpace: 'nowrap',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: '1.5rem 2rem', maxWidth: 1200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >

            {/* ── Tasks tab ── */}
            {activeTab === 0 && (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: '1rem',
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
                    {myRole === 'MEMBER'
                      ? 'Your assigned tasks'
                      : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} on this page`
                    }
                  </span>
                </div>

                {/* Empty state */}
                {tasks.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '5rem 2rem',
                    background: 'var(--bg2)', borderRadius: 'var(--radius-lg)',
                    border: '2px dashed var(--border)',
                  }}>
                    {myRole === 'ADMIN' ? (
                      <>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: '1.1rem',
                          fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem',
                        }}>
                          No tasks yet
                        </div>
                        <div style={{
                          fontSize: '0.875rem', color: 'var(--text2)',
                          marginBottom: '1.5rem', lineHeight: 1.6,
                          maxWidth: 360, margin: '0 auto 1.5rem',
                        }}>
                          Create your first task and assign it to a workspace member to get things moving.
                        </div>
                        <button
                          onClick={() => setShowCreateTask(true)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            fontSize: '0.9rem', fontWeight: 500,
                            padding: '0.7rem 1.5rem', borderRadius: 'var(--radius)',
                            cursor: 'pointer', border: 'none',
                            background: 'var(--grad2)', color: '#fff',
                            fontFamily: 'var(--font-body)',
                            boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                            transition: 'var(--transition)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.4)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)' }}
                        >
                          + Create first task
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: '1.1rem',
                          fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem',
                        }}>
                          No tasks assigned yet
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.6 }}>
                          Your workspace admin will assign tasks to you. Check your inbox for assignment requests.
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <TaskBoard
                    tasks={tasks}
                    myRole={myRole}
                    members={members}
                    onAssign={(task) => { setAssignTask(task); setShowAssign(true) }}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                  />
                )}

                {/* Task pagination — admin only */}
                {myRole === 'ADMIN' && (
                  <Pagination
                    page={taskPage}
                    totalPages={taskTotalPages}
                    onPageChange={(p) => { setTaskPage(p); fetchTasks('ADMIN', p) }}
                  />
                )}
              </>
            )}

            {/* ── Members tab ── */}
            {activeTab === 1 && (
              <>
                <MembersTable
                  members={members}
                  workspaceId={workspaceId}
                  myRole={myRole}
                  onRefresh={fetchAll}
                />
                <Pagination
                  page={memberPage}
                  totalPages={memberTotalPages}
                  onPageChange={(p) => { setMemberPage(p); fetchMembers(p) }}
                />
              </>
            )}

            {/* ── Invitations tab (admin only) ── */}
            {activeTab === 2 && myRole === 'ADMIN' && (
              <>
                <InvitationsTable
                  invitations={invitations}
                  workspaceId={workspaceId}
                  myRole={myRole}
                  onRefresh={fetchAll}
                />
                <Pagination
                  page={invPage}
                  totalPages={invTotalPages}
                  onPageChange={(p) => { setInvPage(p); fetchInvitations(p) }}
                />
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Create task modal ── */}
      <Modal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create task"
        subtitle="Add a new task to this workspace."
      >
        <Input
          label="Task title"
          placeholder="e.g. Implement pagination"
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
        />
        <Textarea
          label="Description (optional)"
          placeholder="What needs to be done?"
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select
            label="Priority"
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
          <Input
            label="Due date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateTask(false)}>Cancel</Button>
          <Button variant="primary" size="sm" loading={creatingTask} onClick={handleCreateTask}>
            Create task
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Assign task modal (admin only) ── */}
      <Modal
        open={showAssign}
        onClose={() => { setShowAssign(false); setAssignTask(null); setAssigneeId('') }}
        title="Assign task"
        subtitle={`Assign "${assignTask?.title}" to a workspace member.`}
      >
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block', fontSize: '0.8rem', fontWeight: 500,
            color: 'var(--text2)', marginBottom: '0.4rem',
          }}>
            Select member
          </label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            style={{
              width: '100%', height: 42,
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg3)', color: 'var(--text)',
              fontSize: '0.9rem', padding: '0 0.9rem',
              fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">— Choose a member —</option>
            {members
              .filter((m) => m.role === 'MEMBER')
              .map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.username} ({m.email})
                </option>
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
          <Button
            variant="ghost" size="sm"
            onClick={() => { setShowAssign(false); setAssignTask(null); setAssigneeId('') }}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" loading={assigning} onClick={handleAssign}>
            Send assignment
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}