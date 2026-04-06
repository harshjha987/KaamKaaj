import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { invitationService, assignmentService } from '../../services/endpoints'
import useToastStore from '../../store/toastStore'
import { extractApiError } from '../../utils/helpers'

export default function InboxPanel({ onRespond }) {
  const [invitations, setInvitations] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const { addToast } = useToastStore()
  const navigate = useNavigate()

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
      onRespond?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const handleAssignment = async (id, accept) => {
    try {
      if (accept) await assignmentService.accept(id)
      else        await assignmentService.decline(id)
      addToast(accept ? 'Assignment accepted!' : 'Assignment declined', accept ? 'success' : 'info')
      fetchInbox()
      onRespond?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const total = invitations.length + assignments.length

  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-display)',
        letterSpacing: '-0.01em', color: 'var(--text)',
        marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Inbox
          {total > 0 && (
            <span style={{ background: 'var(--violet)', color: '#fff', fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.45rem', borderRadius: 99 }}>
              {total}
            </span>
          )}
        </div>
        {/* View all link */}
        <button
          onClick={() => navigate('/inbox')}
          style={{
            fontSize: '0.75rem', color: 'var(--violet)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', padding: 0,
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          View all →
        </button>
      </div>

      {loading && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center', padding: '1rem' }}>Loading...</div>
      )}

      {!loading && total === 0 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)', textAlign: 'center', padding: '1.5rem 0', flex: 1 }}>
          All caught up ✓
        </div>
      )}

      {invitations.map((inv) => (
        <InboxItem
          key={inv.id}
          tag="Invitation"
          tagColor="var(--violet)"
          title={inv.workspaceName}
          sub={`from ${inv.invitedByUsername}`}
          onAccept={() => handleInvite(inv.id, true)}
          onDecline={() => handleInvite(inv.id, false)}
        />
      ))}

      {assignments.map((asgn) => (
        <InboxItem
          key={asgn.id}
          tag="Assignment"
          tagColor="#F59E0B"
          title={asgn.taskTitle}
          sub={`from ${asgn.assignedByUsername}`}
          onAccept={() => handleAssignment(asgn.id, true)}
          onDecline={() => handleAssignment(asgn.id, false)}
        />
      ))}

      {/* Footer link to full page */}
      {total > 0 && (
        <button
          onClick={() => navigate('/inbox')}
          style={{
            marginTop: '1rem', paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.78rem', color: 'var(--violet)',
            background: 'none', border: 'none', borderTop: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            textAlign: 'center', width: '100%',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          View all in Inbox →
        </button>
      )}
    </div>
  )
}

function InboxItem({ tag, tagColor, title, sub, onAccept, onDecline }) {
  return (
    <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{
        fontSize: '0.62rem', fontWeight: 600, padding: '0.1rem 0.4rem',
        borderRadius: 99, background: `${tagColor}15`, color: tagColor,
        border: `1px solid ${tagColor}30`, textTransform: 'uppercase',
        letterSpacing: '0.04em', marginBottom: '0.3rem', display: 'inline-block',
      }}>
        {tag}
      </span>
      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.1rem' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>{sub}</div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button onClick={onAccept} style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'rgba(22,163,74,0.1)', color: '#16A34A', border: '1px solid rgba(22,163,74,0.2)' }}>Accept</button>
        <button onClick={onDecline} style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, fontFamily: 'var(--font-body)', background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)' }}>Decline</button>
      </div>
    </div>
  )
}