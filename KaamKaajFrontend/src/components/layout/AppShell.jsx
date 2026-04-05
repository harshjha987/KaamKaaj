import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Modal from '../ui/Modal'
import { ModalFooter } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import Button from '../ui/Button'
import { workspaceService } from '../../services/endpoints'
import useToastStore from '../../store/toastStore'
import { extractApiError } from '../../utils/helpers'

export default function AppShell({ children }) {
  const [workspaces, setWorkspaces] = useState([])
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const { addToast } = useToastStore()

  const fetchWorkspaces = async () => {
    try {
      const { data } = await workspaceService.list()
      setWorkspaces(data)
    } catch (_) {}
  }

  useEffect(() => { fetchWorkspaces() }, [])

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
      <Sidebar workspaces={workspaces} onNewWorkspace={() => setShowCreateWs(true)} />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {/* Pass fetchWorkspaces down so child pages can refresh the sidebar */}
        {React.cloneElement(children, { refreshWorkspaces: fetchWorkspaces })}
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
