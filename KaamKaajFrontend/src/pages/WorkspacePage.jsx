import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Settings, LogOut } from 'lucide-react'
import useAuthStore from '../store/authStore'
import {
  workspaceService, taskService,
  invitationService, assignmentService,messageService
} from '../services/endpoints'
import TaskBoard from '../components/workspace/TaskBoard'
import MembersTable from '../components/workspace/MembersTable'
import InvitationsTable from '../components/workspace/InvitationsTable'
import DiscussionBoard from '../components/workspace/DiscussionBoard'
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

export default function WorkspacePage({ refreshInbox, refreshWorkspaces }) {
  const { workspaceId } = useParams()
  const navigate        = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
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
  const [taskPage, setTaskPage]                   = useState(0)
  const [taskTotalPages, setTaskTotalPages]       = useState(0)
  const [memberPage, setMemberPage]               = useState(0)
  const [memberTotalPages, setMemberTotalPages]   = useState(0)
  const [invPage, setInvPage]                     = useState(0)
  const [invTotalPages, setInvTotalPages]         = useState(0)

  // ── Create task modal ─────────────────────────────────────
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
  const [creatingTask, setCreatingTask]     = useState(false)

  // ── Edit task modal ───────────────────────────────────────
  const [showEditTask, setShowEditTask]   = useState(false)
  const [editingTask, setEditingTask]     = useState(null)
  const [editTaskForm, setEditTaskForm]   = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
  const [savingTask, setSavingTask]       = useState(false)

  // ── Assign task modal ─────────────────────────────────────
  const [showAssign, setShowAssign] = useState(false)
  const [assignTask, setAssignTask] = useState(null)
  const [assigneeId, setAssigneeId] = useState('')
  const [assigning, setAssigning]   = useState(false)

  // ── Edit workspace modal ──────────────────────────────────
  const [showEditWs, setShowEditWs]     = useState(false)
  const [editWsForm, setEditWsForm]     = useState({ name: '', description: '' })
  const [savingWs, setSavingWs]         = useState(false)

  // ── Delete workspace modal ────────────────────────────────
  const [showDeleteWs, setShowDeleteWs]       = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deletingWs, setDeletingWs]           = useState(false)

  const [unreadCount, setUnreadCount] = useState(0)

  // ── Leave workspace modal ─────────────────────────────────
  const [showLeaveWs, setShowLeaveWs]   = useState(false)
  const [leavingWs, setLeavingWs]       = useState(false)

  // ── Filter state ──────────────────────────────────────────
const [taskSearch, setTaskSearch]     = useState('')
const [priorityFilter, setPriorityFilter] = useState('ALL') 
const [assigneeFilter, setAssigneeFilter] = useState('ALL')

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  // ── Data fetching ─────────────────────────────────────────
  const fetchTasks = async (role, page = 0) => {
    try {
      if (role === 'ADMIN') {
        const { data } = await taskService.list(workspaceId, page)
        setTasks(data.content ?? data)
        setTaskTotalPages(data.totalPages ?? 0)
      } else {
        const { data } = await taskService.myTasks(workspaceId)
        setTasks(data)
      }
    } catch (_) {}
  }

  const checkUnread = (msgs) => {
  const key = `lastVisitedDiscussion_${workspaceId}`
  const lastVisit = localStorage.getItem(key)
  if (!lastVisit) {
    // Never visited — all messages are "unread"
    setUnreadCount(msgs.length)
    return
  }
  const lastTime = new Date(lastVisit).getTime()
  const unread = msgs.filter((m) => new Date(m.createdAt).getTime() > lastTime)
  setUnreadCount(unread.length)
}

  const fetchMembers = async (page = 0) => {
    try {
      const { data } = await workspaceService.getMembers(workspaceId, page)
      setMembers(data.content ?? data)
      setMemberTotalPages(data.totalPages ?? 0)
    } catch (_) { setMembers([]) }
  }
  

  const fetchInvitations = async (page = 0) => {
    try {
      const { data } = await invitationService.list(workspaceId, page)
      setInvitations(data.content ?? data)
      setInvTotalPages(data.totalPages ?? 0)
    } catch (_) { setInvitations([]) }
  }

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
        const msgRes = await messageService.list(workspaceId, 0, 5)
        .catch(() => ({ data: { content: [] } }))
      checkUnread(msgRes.data.content || [])
      } catch (err) {
        addToast('Failed to load workspace', 'error')
        navigate('/dashboard')
      }
      setLoading(false)
    }
    load()
  }, [workspaceId])

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

  // ── Task handlers ─────────────────────────────────────────
  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) { addToast('Task title is required', 'error'); return }
    setCreatingTask(true)
    try {
      await taskService.create(workspaceId, {
        ...taskForm, dueDate: taskForm.dueDate || undefined,
      })
      addToast('Task created!', 'success')
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' })
      setShowCreateTask(false)
      fetchTasks('ADMIN', 0)
      setTaskPage(0)
    } catch (err) { addToast(extractApiError(err), 'error') }
    setCreatingTask(false)
  }

  const openEditTask = (task) => {
    setEditingTask(task)
    setEditTaskForm({
      title:       task.title,
      description: task.description || '',
      priority:    task.priority,
      dueDate:     task.dueDate || '',
    })
    setShowEditTask(true)
  }

  const handleEditTask = async () => {
    if (!editTaskForm.title.trim()) { addToast('Task title is required', 'error'); return }
    setSavingTask(true)
    try {
      await taskService.update(workspaceId, editingTask.id, {
        ...editTaskForm, dueDate: editTaskForm.dueDate || undefined,
      })
      addToast('Task updated!', 'success')
      setShowEditTask(false)
      setEditingTask(null)
      fetchTasks('ADMIN', taskPage)
    } catch (err) { addToast(extractApiError(err), 'error') }
    setSavingTask(false)
  }

  const handleAssign = async () => {
    if (!assigneeId) { addToast('Select a member to assign', 'error'); return }
    setAssigning(true)
    try {
      await assignmentService.create(workspaceId, assignTask.id, assigneeId)
      addToast('Assignment request sent!', 'success')
      setShowAssign(false); setAssignTask(null); setAssigneeId('')
      fetchTasks('ADMIN', taskPage)
      refreshInbox?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
    setAssigning(false)
  }

  const handleStatusUpdate = async (task, newStatus) => {
    try {
      await taskService.updateStatus(workspaceId, task.id, newStatus)
      addToast('Status updated!', 'success')
      fetchTasks('MEMBER')
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const handleDelete = async (task) => {
    try {
      await taskService.delete(workspaceId, task.id)
      addToast(`"${task.title}" deleted`, 'info')
      fetchTasks('ADMIN', taskPage)
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  // ── Workspace handlers ────────────────────────────────────
  const openEditWs = () => {
    setEditWsForm({ name: workspace.name, description: workspace.description || '' })
    setShowEditWs(true)
  }

  const handleEditWs = async () => {
    if (!editWsForm.name.trim()) { addToast('Workspace name is required', 'error'); return }
    setSavingWs(true)
    try {
      await workspaceService.update(workspaceId, editWsForm)
      addToast('Workspace updated!', 'success')
      setShowEditWs(false)
      fetchAll()
      refreshWorkspaces?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
    setSavingWs(false)
  }

  const handleDeleteWs = async () => {
    if (deleteConfirmName !== workspace?.name) {
      addToast('Workspace name does not match', 'error'); return
    }
    setDeletingWs(true)
    try {
      await workspaceService.delete(workspaceId)
      addToast(`Workspace "${workspace.name}" deleted`, 'info')
      refreshWorkspaces?.()
      navigate('/dashboard')
    } catch (err) { addToast(extractApiError(err), 'error') }
    setDeletingWs(false)
  }

  const handleLeaveWs = async () => {
    setLeavingWs(true)
    try {
      await workspaceService.leave(workspaceId)
      addToast(`Left workspace "${workspace?.name}"`, 'info')
      refreshWorkspaces?.()
      navigate('/dashboard')
    } catch (err) { addToast(extractApiError(err), 'error') }
    setLeavingWs(false)
  }

  // ── Loading ───────────────────────────────────────────────
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

  const visibleTabs = myRole === 'ADMIN'
    ? ['Tasks Board', 'Members', 'Invitations', 'Discussion']
    : ['Tasks Board', 'Members', 'Discussion']

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
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-sm)',
              background: grad, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'var(--font-display)',
              fontSize: '0.95rem', fontWeight: 700, color: '#fff', flexShrink: 0,
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
              {/* Show description if present */}
              {workspace?.description && (
                <div style={{
                  fontSize: '0.8rem', color: 'var(--text2)',
                  marginTop: '0.1rem', maxWidth: 500,
                }}>
                  {workspace.description}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.2rem' }}>
                {members.length} member{members.length !== 1 ? 's' : ''} · {myRole}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {myRole === 'ADMIN' && (
              <>
                <Button variant="primary" size="sm" onClick={() => setShowCreateTask(true)}>
                  + New task
                </Button>
                <Button variant="ghost" size="sm" onClick={openEditWs}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Settings size={13} /> Edit
                </Button>
                <Button variant="ghost" size="sm"
                  onClick={() => { setDeleteConfirmName(''); setShowDeleteWs(true) }}
                  style={{ color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)' }}>
                  Delete
                </Button>
              </>
            )}
            {myRole === 'MEMBER' && (
              <Button variant="ghost" size="sm"
                onClick={() => setShowLeaveWs(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  color: '#DC2626', borderColor: 'rgba(220,38,38,0.2)',
                }}>
                <LogOut size={13} /> Leave
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      {/* ── Tabs ── */}
<div style={{
  display: 'flex', borderBottom: '1px solid var(--border)',
  padding: '0 2rem', background: 'var(--bg3)',
  gap: '0.25rem', overflowX: 'auto',
}}>
  {visibleTabs.map((tab, i) => {
    // Discussion tab index differs by role
    const discussionIdx = myRole === 'ADMIN' ? 3 : 2
    const isDiscussion  = i === discussionIdx
    const showBadge     = isDiscussion && unreadCount > 0 && activeTab !== i

    return (
      <button
        key={tab}
        onClick={() => {
          setActiveTab(i)
          // Mark discussion as read when tab is opened
          if (isDiscussion) {
            localStorage.setItem(
              `lastVisitedDiscussion_${workspaceId}`,
              new Date().toISOString()
            )
            setUnreadCount(0)
          }
        }}
        style={{
          fontSize: '0.875rem', fontWeight: activeTab === i ? 500 : 400,
          color: activeTab === i ? 'var(--violet)' : 'var(--text2)',
          padding: '0.75rem 1rem', cursor: 'pointer', border: 'none',
          background: 'none', fontFamily: 'var(--font-body)',
          borderBottom: `2px solid ${activeTab === i ? 'var(--violet)' : 'transparent'}`,
          marginBottom: -1, transition: 'var(--transition)', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          position: 'relative',
        }}
      >
        {tab}
        {/* Unread badge on Discussion tab */}
        {showBadge && (
          <span style={{
            background: '#DC2626', color: '#fff',
            fontSize: '0.58rem', fontWeight: 700,
            padding: '0.1rem 0.4rem', borderRadius: 99,
            lineHeight: 1.4, minWidth: 16, textAlign: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    )
  })}
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
            {/* Tasks tab */}
            {activeTab === 0 && (
  <>
    {/* ── Filter bar ── */}
    <div style={{
      display: 'flex', gap: '0.75rem', marginBottom: '1rem',
      flexWrap: 'wrap', alignItems: 'center',
    }}>
      {/* Search */}
      <input
        value={taskSearch}
        onChange={(e) => setTaskSearch(e.target.value)}
        placeholder="Search tasks..."
        style={{
          flex: 1, minWidth: 180, height: 36,
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg3)', color: 'var(--text)',
          fontSize: '0.85rem', padding: '0 0.85rem',
          fontFamily: 'var(--font-body)', outline: 'none',
          transition: 'var(--transition)',
        }}
        onFocus={(e) => e.target.style.borderColor = 'var(--violet)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
      />

      {/* Priority filter */}
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        style={{
          height: 36, border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg3)', color: 'var(--text)',
          fontSize: '0.85rem', padding: '0 0.75rem',
          fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none',
        }}
      >
        <option value="ALL">All priorities</option>
        <option value="CRITICAL">Critical</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      {/* Assignee filter — ADMIN only */}
      {myRole === 'ADMIN' && (
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          style={{
            height: 36, border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg3)', color: 'var(--text)',
            fontSize: '0.85rem', padding: '0 0.75rem',
            fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="ALL">All assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {members.filter((m) => m.role === 'MEMBER').map((m) => (
            <option key={m.userId} value={m.username}>{m.username}</option>
          ))}
        </select>
      )}

      {/* Clear filters — shown when any filter is active */}
      {(taskSearch || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL') && (
        <button
          onClick={() => { setTaskSearch(''); setPriorityFilter('ALL'); setAssigneeFilter('ALL') }}
          style={{
            height: 36, padding: '0 0.75rem',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            background: 'none', color: 'var(--text3)', fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          Clear filters
        </button>
      )}

      <span style={{ fontSize: '0.78rem', color: 'var(--text3)', marginLeft: 'auto' }}>
        {myRole === 'MEMBER'
          ? 'Your assigned tasks'
          : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} on this page`
        }
      </span>
    </div>

    {/* ── Compute filtered tasks ── */}
    {(() => {
      const filtered = tasks.filter((t) => {
        const matchSearch   = !taskSearch || t.title.toLowerCase().includes(taskSearch.toLowerCase())
        const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
        const matchAssignee = assigneeFilter === 'ALL'
          ? true
          : assigneeFilter === 'UNASSIGNED'
            ? !t.assignedToUsername
            : t.assignedToUsername === assigneeFilter
        return matchSearch && matchPriority && matchAssignee
      })

      if (tasks.length === 0) return (
        <div style={{
          textAlign: 'center', padding: '5rem 2rem',
          background: 'var(--bg2)', borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--border)',
        }}>
          {myRole === 'ADMIN' ? (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                No tasks yet
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: 360, margin: '0 auto 1.5rem' }}>
                Create your first task and assign it to a workspace member to get things moving.
              </div>
              <button
                onClick={() => setShowCreateTask(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.9rem', fontWeight: 500, padding: '0.7rem 1.5rem',
                  borderRadius: 'var(--radius)', cursor: 'pointer', border: 'none',
                  background: 'var(--grad2)', color: '#fff', fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.3)', transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
              >
                + Create first task
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                No tasks assigned yet
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.6 }}>
                Your workspace admin will assign tasks to you. Check your inbox for assignment requests.
              </div>
            </>
          )}
        </div>
      )

      if (filtered.length === 0) return (
        <div style={{
          textAlign: 'center', padding: '3rem 2rem',
          background: 'var(--bg2)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.25rem' }}>No tasks match your filters</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>Try adjusting your search or filters</div>
        </div>
      )

      return (
        <TaskBoard
          tasks={filtered}
          myRole={myRole}
          members={members}
          workspaceId={workspaceId}
          onAssign={(task) => { setAssignTask(task); setShowAssign(true) }}
          onEdit={openEditTask}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
        />
      )
    })()}

    {myRole === 'ADMIN' && (
      <Pagination
        page={taskPage}
        totalPages={taskTotalPages}
        onPageChange={(p) => { setTaskPage(p); fetchTasks('ADMIN', p) }}
      />
    )}
  </>
)}
            {/* Members tab */}
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

            {/* Invitations tab — admin only */}
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

            {/* Discussion tab */}
            {((myRole === 'ADMIN' && activeTab === 3) ||
              (myRole === 'MEMBER' && activeTab === 2)) && (
              <DiscussionBoard workspaceId={workspaceId} myRole={myRole} />
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Create task modal ── */}
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

      {/* ── Edit task modal ── */}
      <Modal open={showEditTask} onClose={() => { setShowEditTask(false); setEditingTask(null) }} title="Edit task" subtitle="Update task details.">
        <Input label="Task title" value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} />
        <Textarea label="Description" placeholder="What needs to be done?" value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select label="Priority" value={editTaskForm.priority} onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
          <Input label="Due date" type="date" value={editTaskForm.dueDate} onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })} />
        </div>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => { setShowEditTask(false); setEditingTask(null) }}>Cancel</Button>
          <Button variant="primary" size="sm" loading={savingTask} onClick={handleEditTask}>Save changes</Button>
        </ModalFooter>
      </Modal>

      {/* ── Assign task modal ── */}
      <Modal open={showAssign} onClose={() => { setShowAssign(false); setAssignTask(null); setAssigneeId('') }} title="Assign task" subtitle={`Assign "${assignTask?.title}" to a workspace member.`}>
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
            {members.filter((m) => m.role === 'MEMBER').map((m) => (
              <option key={m.userId} value={m.userId}>{m.username} ({m.email})</option>
            ))}
          </select>
          {members.filter((m) => m.role === 'MEMBER').length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.5rem' }}>No members yet. Invite someone first.</p>
          )}
        </div>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => { setShowAssign(false); setAssignTask(null); setAssigneeId('') }}>Cancel</Button>
          <Button variant="primary" size="sm" loading={assigning} onClick={handleAssign}>Send assignment</Button>
        </ModalFooter>
      </Modal>

      {/* ── Edit workspace modal ── */}
      <Modal open={showEditWs} onClose={() => setShowEditWs(false)} title="Edit workspace" subtitle="Update workspace name and description.">
        <Input
          label="Workspace name"
          value={editWsForm.name}
          onChange={(e) => setEditWsForm({ ...editWsForm, name: e.target.value })}
          placeholder="e.g. Product Team"
        />
        <Textarea
          label="Description (optional)"
          value={editWsForm.description}
          onChange={(e) => setEditWsForm({ ...editWsForm, description: e.target.value })}
          placeholder="What does this workspace focus on?"
          rows={2}
        />
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setShowEditWs(false)}>Cancel</Button>
          <Button variant="primary" size="sm" loading={savingWs} onClick={handleEditWs}>Save changes</Button>
        </ModalFooter>
      </Modal>

      {/* ── Delete workspace modal ── */}
      <Modal
        open={showDeleteWs}
        onClose={() => { setShowDeleteWs(false); setDeleteConfirmName('') }}
        title="Delete workspace"
        subtitle="This action is permanent and cannot be undone. All tasks, members, invitations and discussions will be deleted."
      >
        <div style={{
          background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem',
        }}>
          <div style={{ fontSize: '0.82rem', color: '#DC2626', fontWeight: 500, marginBottom: '0.25rem' }}>
            ⚠ This will permanently delete:
          </div>
          <div style={{ fontSize: '0.78rem', color: '#DC2626', lineHeight: 1.7 }}>
            • All tasks and assignment history<br />
            • All workspace members and invitations<br />
            • All discussion messages and replies
          </div>
        </div>

        <div style={{ marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text2)' }}>
          Type <strong style={{ color: 'var(--text)' }}>{workspace?.name}</strong> to confirm:
        </div>
        <Input
          placeholder={workspace?.name}
          value={deleteConfirmName}
          onChange={(e) => setDeleteConfirmName(e.target.value)}
        />
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => { setShowDeleteWs(false); setDeleteConfirmName('') }}>Cancel</Button>
          <Button
            size="sm"
            loading={deletingWs}
            onClick={handleDeleteWs}
            style={{
              background: deleteConfirmName === workspace?.name ? '#DC2626' : 'var(--bg2)',
              color: deleteConfirmName === workspace?.name ? '#fff' : 'var(--text3)',
              border: 'none',
              cursor: deleteConfirmName === workspace?.name ? 'pointer' : 'not-allowed',
            }}
          >
            Delete workspace
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Leave workspace modal ── */}
      <Modal
        open={showLeaveWs}
        onClose={() => setShowLeaveWs(false)}
        title="Leave workspace"
        subtitle={`Are you sure you want to leave "${workspace?.name}"? You'll lose access to all tasks and discussions.`}
      >
        {myRole === 'ADMIN' && (
          <div style={{
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1rem',
            fontSize: '0.82rem', color: '#F59E0B',
          }}>
            ⚠ As an admin, you can only leave if there is at least one other admin.
            Promote a member before leaving.
          </div>
        )}
        {/* Last member warning */}
      {members.length === 1 && (
        <div style={{
          background: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem',
          marginBottom: '1rem', fontSize: '0.82rem', color: '#DC2626',
        }}>
          ⚠ You are the only member. Leaving will make this workspace empty
          with no admin — consider deleting it instead.
        </div>
      )}
          <div style={{ fontSize: '0.875rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
        You will lose access to all tasks, discussions and workspace data.
        This cannot be undone.
      </div>
        <ModalFooter>
        <Button variant="ghost" size="sm" onClick={() => setShowLeaveWs(false)}>
          Cancel
        </Button>
        {/* Show delete instead of leave if last member */}
        {members.length === 1 ? (
          <Button
            size="sm"
            onClick={() => {
              setShowLeaveWs(false)
              setDeleteConfirmName('')
              setShowDeleteWs(true)
            }}
            style={{ background: '#DC2626', color: '#fff', border: 'none' }}
          >
            Delete workspace instead
          </Button>
          ) : (
      <Button
        size="sm"
        loading={leavingWs}
        onClick={handleLeaveWs}
        style={{ background: '#DC2626', color: '#fff', border: 'none' }}
      >
        Leave workspace
      </Button>
          )}
        </ModalFooter>
      </Modal>

    </div>
  )
}