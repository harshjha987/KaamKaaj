import React, { useState } from 'react'
import Avatar from '../ui/Avatar'
import { RoleBadge } from '../ui/Badge'
import Button from '../ui/Button'
import Modal, { ModalFooter } from '../ui/Modal'
import { workspaceService } from '../../services/endpoints'
import useToastStore from '../../store/toastStore'
import useAuthStore from '../../store/authStore'
import { extractApiError, formatDate } from '../../utils/helpers'

export default function MembersTable({ members = [], workspaceId, myRole, onRefresh }) {
  const [removing, setRemoving]   = useState(null)
  const [promoting, setPromoting] = useState(null)
  const { addToast } = useToastStore()
  const { user } = useAuthStore()

  const handleRemove = async () => {
    try {
      await workspaceService.removeMember(workspaceId, removing.userId)
      addToast(`${removing.username} removed`, 'info')
      setRemoving(null)
      onRefresh?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const handlePromote = async (member, role) => {
    try {
      await workspaceService.changeMemberRole(workspaceId, member.userId, role)
      addToast(`${member.username} is now ${role}`, 'success')
      setPromoting(null)
      onRefresh?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  return (
    <>
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Member', 'Email', 'Role', 'Joined', ...(myRole === 'ADMIN' ? ['Actions'] : [])].map((h) => (
                <th key={h} style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text2)', padding: '0.7rem 1rem', textAlign: 'left', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isMe = m.email === user?.email
              return (
                <tr key={m.memberId} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Avatar name={m.username} size={28} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>
                        {m.username}
                        {isMe && <span style={{ fontSize: '0.68rem', color: 'var(--text3)', marginLeft: '0.3rem' }}>(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--text2)' }}>{m.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><RoleBadge role={m.role} /></td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text2)' }}>{formatDate(m.joinedAt)}</td>
                  {myRole === 'ADMIN' && (
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {!isMe && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setPromoting(m)}
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'var(--violet-alpha)', color: 'var(--violet)', border: '1px solid rgba(124,58,237,0.2)', transition: 'var(--transition)' }}
                          >{m.role === 'ADMIN' ? 'Demote' : 'Promote'}</button>
                          {m.role !== 'ADMIN' && (
                            <button
                              onClick={() => setRemoving(m)}
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)', transition: 'var(--transition)' }}
                            >Remove</button>
                          )}
                        </div>
                      )}
                      {isMe && <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>—</span>}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Remove confirm modal */}
      <Modal open={!!removing} onClose={() => setRemoving(null)} title="Remove member" subtitle={`Remove ${removing?.username} from this workspace?`}>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setRemoving(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleRemove}>Remove</Button>
        </ModalFooter>
      </Modal>

      {/* Promote/demote confirm modal */}
      <Modal open={!!promoting} onClose={() => setPromoting(null)} title={promoting?.role === 'ADMIN' ? 'Demote to Member' : 'Promote to Admin'} subtitle={promoting?.role === 'ADMIN' ? `${promoting?.username} will lose admin privileges` : `${promoting?.username} will gain full admin access`}>
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setPromoting(null)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => handlePromote(promoting, promoting?.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
