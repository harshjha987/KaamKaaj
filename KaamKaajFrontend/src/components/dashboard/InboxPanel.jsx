import React, { useEffect, useState } from 'react'
import { invitationService, assignmentService } from '../../services/endpoints'
import useToastStore from '../../store/toastStore'
import { extractApiError } from '../../utils/helpers'

export default function InboxPanel({ onRespond }) {
  const [invitations, setInvitations] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()

  const fetchInbox = async () => {
    setLoading(true)
    try {
      const [inv, asgn] = await Promise.all([
        invitationService.myPending().catch(() => ({ data: [] })),
        assignmentService.myPending().catch(() => ({ data: [] })),
      ])
      setInvitations(inv.data || [])
      setAssignments(asgn.data || [])
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { fetchInbox() }, [])

  const handleInvite = async (id, accept) => {
    try {
      if (accept) await invitationService.accept(id)
      else        await invitationService.decline(id)
      addToast(accept ? 'Invitation accepted!' : 'Invitation declined', accept ? 'success' : 'info')
      fetchInbox()
      onRespond?.()   // tell dashboard to refresh metrics
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const handleAssignment = async (id, accept) => {
    try {
      if (accept) await assignmentService.accept(id)
      else        await assignmentService.decline(id)
      addToast(accept ? 'Assignment accepted!' : 'Assignment declined', accept ? 'success' : 'info')
      fetchInbox()
      onRespond?.()   // tell dashboard to refresh metrics
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const total = invitations.length + assignments.length

  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
      <div style={{
        fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-display)',
        letterSpacing: '-0.01em', color: 'var(--text)',
        marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        Inbox
        {total > 0 && (
          <span style={{ background: 'var(--violet)', color: '#fff', fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: 99 }}>
            {total}
          </span>
        )}
      </div>

      {loading && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center', padding: '1rem' }}>Loading...</div>
      )}

      {!loading && total === 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center', padding: '1.5rem 0' }}>
          All caught up ✓
        </div>
      )}

      {invitations.map((inv) => (
        <InboxItem
          key={inv.id}
          title="Workspace invitation"
          sub={`${inv.invitedByUsername} invited you to ${inv.workspaceName}`}
          onAccept={() => handleInvite(inv.id, true)}
          onDecline={() => handleInvite(inv.id, false)}
        />
      ))}

      {assignments.map((asgn) => (
        <InboxItem
          key={asgn.id}
          title="Task assignment"
          sub={`"${asgn.taskTitle}" · from ${asgn.assignedByUsername}`}
          onAccept={() => handleAssignment(asgn.id, true)}
          onDecline={() => handleAssignment(asgn.id, false)}
        />
      ))}
    </div>
  )
}

function InboxItem({ title, sub, onAccept, onDecline }) {
  return (
    <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>{sub}</div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button onClick={onAccept} style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'rgba(22,163,74,0.1)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}>
          Accept
        </button>
        <button onClick={onDecline} style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>
          Decline
        </button>
      </div>
    </div>
  )
}