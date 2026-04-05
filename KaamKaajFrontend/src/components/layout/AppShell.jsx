import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Modal from '../ui/Modal'
import { ModalFooter } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import Button from '../ui/Button'
import { workspaceService, invitationService, assignmentService } from '../../services/endpoints'
import useToastStore from '../../store/toastStore'
import { extractApiError } from '../../utils/helpers'

export default function AppShell({ children }) {
  const [workspaces, setWorkspaces]   = useState([])
  const [inboxCount, setInboxCount]   = useState(0)
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [form, setForm]   = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const { addToast } = useToastStore()

  const fetchWorkspaces = async () => {
    try {
      const { data } = await workspaceService.list()
      setWorkspaces(data)
    } catch (_) {}
  }

  // Fetch real inbox count — sum of pending invitations + pending assignments
  const fetchInboxCount = async () => {
    try {
      const [inv, asgn] = await Promise.all([
        invitationService.myPending().catch(() => ({ data: [] })),
        assignmentService.myPending().catch(() => ({ data: [] })),
      ])
      setInboxCount((inv.data?.length || 0) + (asgn.data?.length || 0))
    } catch (_) {}
  }

  useEffect(() => {
    fetchWorkspaces()
    fetchInboxCount()
    // Refresh inbox count every 60 seconds
    const interval = setInterval(fetchInboxCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) { addToast('Workspace name is required', 'error'); return }
    setLoading(true)
    try {
      await workspaceService.create(form)
      addToast(`Workspace "${form.name}" created!`, 'success')
      setForm({ name: '', description: '' })
      setShowCreateWs(false)
      fetchWorkspaces()
    } catch (err) {
      addToast(extractApiError(err), 'error')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', paddingTop: 64 }}>
      <Sidebar
        workspaces={workspaces}
        inboxCount={inboxCount}
        onNewWorkspace={() => setShowCreateWs(true)}
        onInboxRefresh={fetchInboxCount}
      />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {React.cloneElement(children, {
          refreshWorkspaces: fetchWorkspaces,
          refreshInbox: fetchInboxCount,
        })}
      </main>

      <Modal
        open={showCreateWs}
        onClose={() => setShowCreateWs(false)}
        title="Create workspace"
        subtitle="Give your workspace a name — your team will be added via invitations."
      >
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
          rows={2}
        />
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateWs(false)}>Cancel</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleCreate}>
            Create workspace
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}