import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { workspaceService } from '../services/endpoints'
import { getGreeting } from '../utils/helpers'
import MetricsRow from '../components/dashboard/MetricsRow'
import WorkspaceGrid from '../components/dashboard/WorkspaceGrid'
import InboxPanel from '../components/dashboard/InboxPanel'
import Modal, { ModalFooter } from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import useToastStore from '../store/toastStore'
import { extractApiError } from '../utils/helpers'

export default function DashboardPage({ refreshWorkspaces }) {
  const { isAuthenticated, user } = useAuthStore()
  const { addToast } = useToastStore()
  const [workspaces, setWorkspaces] = useState([])
  const [myMemberships, setMyMemberships] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await workspaceService.list()
      setWorkspaces(data)
      // Fetch my membership for each workspace
      const memberships = {}
      await Promise.all(
        data.map(async (ws) => {
          try {
            const { data: mem } = await workspaceService.getMyMembership(ws.id)
            memberships[ws.id] = mem
          } catch (_) {}
        })
      )
      setMyMemberships(memberships)
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

  const metrics = {
    workspaces: workspaces.length,
    activeTasks: 0,
    completed: 0,
    pending: 0,
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '0.25rem' }}>
          {getGreeting()},
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          {user?.username || user?.email}
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
        ? <div style={{ fontSize: '0.875rem', color: 'var(--text3)', padding: '2rem 0' }}>Loading workspaces...</div>
        : <WorkspaceGrid workspaces={workspaces} myMemberships={myMemberships} onNew={() => setShowCreateWs(true)} />
      }

      {/* Two column: activity + inbox */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem', marginTop: '1rem' }}>
        {/* Activity placeholder */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            Recent Activity
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text3)', textAlign: 'center', padding: '2rem 0' }}>
            Activity feed coming soon
          </div>
        </div>
        <InboxPanel />
      </div>

      {/* Create workspace modal */}
      <Modal open={showCreateWs} onClose={() => setShowCreateWs(false)} title="Create workspace" subtitle="Give your workspace a name. You'll be the admin.">
        <Input label="Workspace name" placeholder="e.g. Product Team" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Textarea label="Description (optional)" placeholder="What does this workspace focus on?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateWs(false)}>Cancel</Button>
          <Button variant="primary" size="sm" loading={creating} onClick={handleCreate}>Create workspace</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
