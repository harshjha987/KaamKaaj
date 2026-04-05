import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { workspaceService, taskService, invitationService } from '../services/endpoints'
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

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()

  const [workspace, setWorkspace] = useState(null)
  const [myMembership, setMyMembership] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
  const [creatingTask, setCreatingTask] = useState(false)

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [wsRes, memRes, myMemRes, invRes] = await Promise.all([
        workspaceService.get(workspaceId),
        workspaceService.getMembers(workspaceId).catch(() => ({ data: [] })),
        workspaceService.getMyMembership(workspaceId),
        invitationService.list(workspaceId).catch(() => ({ data: [] })),
      ])
      setWorkspace(wsRes.data)
      setMembers(memRes.data)
      setMyMembership(myMemRes.data)
      setInvitations(invRes.data)
    } catch (err) {
      addToast('Failed to load workspace', 'error')
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const fetchTasks = async () => {
    try {
      const { data } = await taskService.list(workspaceId)
      setTasks(data)
    } catch (_) {}
  }

  useEffect(() => { fetchAll(); fetchTasks() }, [workspaceId])

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
      fetchTasks()
    } catch (err) { addToast(extractApiError(err), 'error') }
    setCreatingTask(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', color: 'var(--text3)' }}>
      Loading workspace...
    </div>
  )

  const wsIdx = workspaceId.charCodeAt(0) % WS_GRADS.length
  const grad = WS_GRADS[wsIdx]
  const myRole = myMembership?.role

  return (
    <div>
      {/* Workspace header */}
      <div style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '0.75rem' }}>
          <span style={{ cursor: 'pointer', color: 'var(--text2)', transition: 'var(--transition)' }} onClick={() => navigate('/dashboard')}
            onMouseEnter={(e) => e.target.style.color = 'var(--violet)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text2)'}
          >Dashboard</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text)' }}>{workspace?.name}</span>
        </div>

        {/* Title row */}
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
                {members.length} member{members.length !== 1 ? 's' : ''} · {myRole}
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
        {TABS.map((tab, i) => (
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</span>
                </div>
                <TaskBoard tasks={tasks} />
              </>
            )}
            {activeTab === 1 && (
              <MembersTable members={members} workspaceId={workspaceId} myRole={myRole} onRefresh={fetchAll} />
            )}
            {activeTab === 2 && (
              <InvitationsTable invitations={invitations} workspaceId={workspaceId} myRole={myRole} onRefresh={fetchAll} />
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
    </div>
  )
}
