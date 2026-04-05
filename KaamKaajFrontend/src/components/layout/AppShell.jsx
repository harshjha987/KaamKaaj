import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Modal from '../ui/Modal'
import { ModalFooter } from '../ui/Modal'
import { Input, Textarea } from '../ui/Input'
import Button from '../ui/Button'
import { workspaceService, invitationService, assignmentService } from '../../services/endpoints'
import useToastStore from '../../store/toastStore'
import useAuthStore from '../../store/authStore'
import { extractApiError } from '../../utils/helpers'
import api from '../../services/api'

export default function AppShell({ children }) {
  const [workspaces, setWorkspaces]     = useState([])
  const [inboxCount, setInboxCount]     = useState(0)
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const { addToast } = useToastStore()
  const { user, login } = useAuthStore()

  // Settings form state
  const [settingsTab, setSettingsTab]         = useState('account')
  const [usernameForm, setUsernameForm]       = useState({ username: '' })
  const [passwordForm, setPasswordForm]       = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingUsername, setSavingUsername]   = useState(false)
  const [savingPassword, setSavingPassword]   = useState(false)

  const fetchWorkspaces = async () => {
    try {
      const { data } = await workspaceService.list()
      setWorkspaces(data)
    } catch (_) {}
  }

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

  const openSettings = () => {
    setUsernameForm({ username: user?.username || '' })
    setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' })
    setSettingsTab('account')
    setShowSettings(true)
  }

  const handleUpdateUsername = async () => {
    if (!usernameForm.username.trim()) { addToast('Username is required', 'error'); return }
    if (usernameForm.username === user?.username) { addToast('That is already your username', 'info'); return }
    setSavingUsername(true)
    try {
      await api.patch('/users/me/username', { username: usernameForm.username.trim() })
      addToast('Username updated!', 'success')
      // Refresh user info
      const { data } = await api.get('/auth/me')
      // Update store if your authStore supports it
      useAuthStore.setState({ user: data })
    } catch (err) { addToast(extractApiError(err), 'error') }
    setSavingUsername(false)
  }

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword) { addToast('Enter your current password', 'error'); return }
    if (passwordForm.newPassword.length < 8) { addToast('New password must be at least 8 characters', 'error'); return }
    if (passwordForm.newPassword !== passwordForm.confirm) { addToast('Passwords do not match', 'error'); return }
    setSavingPassword(true)
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      addToast('Password updated!', 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { addToast(extractApiError(err), 'error') }
    setSavingPassword(false)
  }

  const TABS = [
    { key: 'account',  label: 'Account' },
    { key: 'password', label: 'Password' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', paddingTop: 64 }}>
      <Sidebar
        workspaces={workspaces}
        inboxCount={inboxCount}
        onNewWorkspace={() => setShowCreateWs(true)}
        onInboxRefresh={fetchInboxCount}
        onSettings={openSettings}
      />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {React.cloneElement(children, {
          refreshWorkspaces: fetchWorkspaces,
          refreshInbox: fetchInboxCount,
        })}
      </main>

      {/* Create workspace modal */}
      <Modal open={showCreateWs} onClose={() => setShowCreateWs(false)} title="Create workspace" subtitle="Give your workspace a name — your team will be added via invitations.">
        <Input label="Workspace name" placeholder="e.g. Product Team" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Textarea label="Description (optional)" placeholder="What does this workspace focus on?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setShowCreateWs(false)}>Cancel</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleCreate}>Create workspace</Button>
        </ModalFooter>
      </Modal>

      {/* Settings modal */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Settings" subtitle="Manage your account preferences.">

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setSettingsTab(t.key)}
              style={{
                fontSize: '0.85rem', fontWeight: settingsTab === t.key ? 500 : 400,
                color: settingsTab === t.key ? 'var(--violet)' : 'var(--text2)',
                padding: '0.5rem 1rem', cursor: 'pointer', border: 'none',
                background: 'none', fontFamily: 'var(--font-body)',
                borderBottom: `2px solid ${settingsTab === t.key ? 'var(--violet)' : 'transparent'}`,
                marginBottom: -1, transition: 'var(--transition)',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Account tab */}
        {settingsTab === 'account' && (
          <div>
            {/* Read-only info */}
            <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Row label="Email" value={user?.email} />
              <Row label="Role"  value={user?.role || 'USER'} />
            </div>

            {/* Change username */}
            <Input
              label="Username"
              value={usernameForm.username}
              onChange={(e) => setUsernameForm({ username: e.target.value })}
              placeholder="New username"
            />
            <div style={{ marginTop: '0.75rem' }}>
              <Button variant="primary" size="sm" loading={savingUsername} onClick={handleUpdateUsername}>
                Save username
              </Button>
            </div>
          </div>
        )}

        {/* Password tab */}
        {settingsTab === 'password' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Input
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Your current password"
            />
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min 8 characters, upper + lower + number + symbol"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              placeholder="Repeat new password"
            />
            <div style={{ marginTop: '0.25rem' }}>
              <Button variant="primary" size="sm" loading={savingPassword} onClick={handleUpdatePassword}>
                Update password
              </Button>
            </div>
          </div>
        )}

      </Modal>
    </div>
  )
}

// Small read-only row for account info
function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}