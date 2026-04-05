import React, { useState } from 'react'
import Avatar from '../ui/Avatar'
import { InvitationStatusBadge } from '../ui/Badge'
import { invitationService, userService } from '../../services/endpoints'
import useToastStore from '../../store/toastStore'
import { extractApiError, formatDate } from '../../utils/helpers'
import Modal, { ModalFooter } from '../ui/Modal'
import Button from '../ui/Button'

export default function InvitationsTable({ invitations = [], workspaceId, myRole, onRefresh }) {
  const [showInvite, setShowInvite] = useState(false)
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [searched, setSearched]     = useState(false)  // tracks if search was actually performed
  const [searching, setSearching]   = useState(false)
  const [inviting, setInviting]     = useState(false)
  const { addToast } = useToastStore()

  const handleSearch = async () => {
    if (query.trim().length < 2) { addToast('Enter at least 2 characters', 'info'); return }
    setSearching(true)
    setSearched(false)
    try {
      const { data } = await userService.search(query.trim())
      setResults(data)
      setSearched(true)
    } catch (err) { addToast(extractApiError(err), 'error') }
    setSearching(false)
  }

  const handleInvite = async (userId) => {
    setInviting(true)
    try {
      await invitationService.send(workspaceId, userId)
      addToast('Invitation sent!', 'success')
      closeModal()
      onRefresh?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
    setInviting(false)
  }

  const handleCancel = async (invId) => {
    try {
      await invitationService.cancel(workspaceId, invId)
      addToast('Invitation cancelled', 'info')
      onRefresh?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const closeModal = () => {
    setShowInvite(false)
    setQuery('')
    setResults([])
    setSearched(false)
  }

  return (
    <>
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)' }}>Sent Invitations</span>
          {myRole === 'ADMIN' && (
            <button onClick={() => setShowInvite(true)} style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'var(--grad2)', color: '#fff', border: 'none' }}>
              + Invite user
            </button>
          )}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['User', 'Invited by', 'Status', 'Sent', ...(myRole === 'ADMIN' ? ['Actions'] : [])].map((h) => (
                <th key={h} style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text2)', padding: '0.65rem 1rem', textAlign: 'left', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text3)' }}>
                  No invitations sent yet
                </td>
              </tr>
            )}
            {invitations.map((inv) => (
              <tr key={inv.id}
                style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Avatar name={inv.invitedUsername} size={26} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>{inv.invitedUsername}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{inv.invitedUserEmail}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text2)' }}>{inv.invitedByUsername}</td>
                <td style={{ padding: '0.75rem 1rem' }}><InvitationStatusBadge status={inv.status} /></td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text2)' }}>{formatDate(inv.createdAt)}</td>
                {myRole === 'ADMIN' && (
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {inv.status === 'PENDING' ? (
                      <button onClick={() => handleCancel(inv.id)} style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
                        Cancel
                      </button>
                    ) : (
                      // Show Re-invite button for DECLINED or CANCELLED invitations
                      (inv.status === 'DECLINED' || inv.status === 'CANCELLED') ? (
                        <button onClick={() => handleInvite(inv.invitedUserId)} style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'var(--violet-alpha)', color: 'var(--violet)', border: '1px solid rgba(124,58,237,0.2)' }}>
                          Re-invite
                        </button>
                      ) : <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      <Modal open={showInvite} onClose={closeModal} title="Invite a user" subtitle="Search by username or email to find someone to invite.">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            style={{ flex: 1, height: 40, border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', background: 'var(--bg3)', color: 'var(--text)', fontSize: '0.875rem', padding: '0 0.9rem', fontFamily: 'var(--font-body)', outline: 'none' }}
            placeholder="Search username or email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              // Clear previous results when user types new query
              if (searched) { setResults([]); setSearched(false) }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
          />
          <Button variant="primary" size="sm" loading={searching} onClick={handleSearch}>Search</Button>
        </div>

        {/* Results list */}
        {results.length > 0 && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '0.5rem' }}>
            {results.map((u) => (
              <div key={u.userId}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Avatar name={u.username} size={26} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>{u.username}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{u.email}</div>
                  </div>
                </div>
                <Button variant="primary" size="sm" loading={inviting} onClick={() => handleInvite(u.userId)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>Invite</Button>
              </div>
            ))}
          </div>
        )}

        {/* Only show "no results" AFTER a search was performed, not while typing */}
        {searched && results.length === 0 && !searching && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center', padding: '1rem 0' }}>
            No users found for "{query}"
          </p>
        )}

        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  )
}