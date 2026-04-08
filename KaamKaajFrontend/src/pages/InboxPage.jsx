import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Inbox, RefreshCw } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { invitationService, assignmentService } from '../services/endpoints'
import useToastStore from '../store/toastStore'
import { extractApiError } from '../utils/helpers'

const FILTERS = ['All', 'Invitations', 'Assignments']

export default function InboxPage({ refreshInbox }) {
  const { isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()

  const [invitations, setInvitations] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [filter, setFilter]           = useState('All')

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const fetchInbox = async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    try {
      const [inv, asgn] = await Promise.all([
        invitationService.myPending().catch(() => ({ data: [] })),
        assignmentService.myPending().catch(() => ({ data: [] })),
      ])
      setInvitations(inv.data || [])
      setAssignments(asgn.data || [])
    } catch (_) {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchInbox() }, [])

  const handleInvite = async (id, accept) => {
    try {
      if (accept) await invitationService.accept(id)
      else        await invitationService.decline(id)
      addToast(accept ? 'Invitation accepted!' : 'Invitation declined', accept ? 'success' : 'info')
      fetchInbox(true)
      refreshInbox?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const handleAssignment = async (id, accept) => {
    try {
      if (accept) await assignmentService.accept(id)
      else        await assignmentService.decline(id)
      addToast(accept ? 'Assignment accepted!' : 'Assignment declined', accept ? 'success' : 'info')
      fetchInbox(true)
      refreshInbox?.()
    } catch (err) { addToast(extractApiError(err), 'error') }
  }

  const visibleInvitations = filter === 'Assignments' ? [] : invitations
  const visibleAssignments = filter === 'Invitations' ? [] : assignments
  const total = invitations.length + assignments.length

  const counts = {
    All:         total,
    Invitations: invitations.length,
    Assignments: assignments.length,
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '0.35rem',
        }}>
          {/* Left — icon + title + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--violet-alpha)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Inbox size={18} color="var(--violet)" />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.6rem',
              fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)',
            }}>
              Inbox
            </h1>
            {total > 0 && (
              <span style={{
                background: 'var(--violet)', color: '#fff',
                fontSize: '0.72rem', fontWeight: 600,
                padding: '0.15rem 0.55rem', borderRadius: 99,
              }}>{total}</span>
            )}
          </div>

          {/* Right — refresh button */}
          <button
            onClick={() => fetchInbox(true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.78rem', color: 'var(--text3)',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              if (!refreshing) {
                e.currentTarget.style.borderColor = 'var(--violet)'
                e.currentTarget.style.color = 'var(--violet)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text3)'
            }}
          >
            <RefreshCw
              size={13}
              style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginLeft: '3rem' }}>
          Pending workspace invitations and task assignments
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
      }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: '0.85rem', fontWeight: filter === f ? 500 : 400,
              color: filter === f ? 'var(--violet)' : 'var(--text2)',
              padding: '0.6rem 1rem', cursor: 'pointer',
              border: 'none', background: 'none',
              fontFamily: 'var(--font-body)',
              borderBottom: `2px solid ${filter === f ? 'var(--violet)' : 'transparent'}`,
              marginBottom: -1, transition: 'var(--transition)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {f}
            {counts[f] > 0 && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                padding: '0.1rem 0.4rem', borderRadius: 99,
                background: filter === f ? 'var(--violet)' : 'var(--bg2)',
                color: filter === f ? '#fff' : 'var(--text3)',
                border: `1px solid ${filter === f ? 'transparent' : 'var(--border)'}`,
              }}>{counts[f]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', fontSize: '0.875rem', color: 'var(--text3)' }}>
          Loading inbox...
        </div>
      )}

      {/* Empty state */}
      {!loading && visibleInvitations.length === 0 && visibleAssignments.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--bg3)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✉️</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.35rem' }}>
            {filter === 'All' ? 'All caught up!' : `No ${filter.toLowerCase()} pending`}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
            {filter === 'All'
              ? 'New workspace invitations and task assignments will appear here.'
              : `Switch to "All" to see other pending items.`
            }
          </div>
        </div>
      )}

      {/* Invitations */}
      {!loading && visibleInvitations.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {filter === 'All' && (
            <div style={{
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.75rem',
            }}>
              Workspace Invitations
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {visibleInvitations.map((inv, idx) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                        borderRadius: 99, background: 'var(--violet-alpha)',
                        color: 'var(--violet)', border: '1px solid rgba(124,58,237,0.2)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>
                        Invitation
                      </span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                      {inv.workspaceName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
                      Invited by <strong>{inv.invitedByUsername}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleInvite(inv.id, true)}
                      style={{
                        fontSize: '0.8rem', padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: 'rgba(22,163,74,0.1)', color: '#16A34A',
                        border: '1px solid rgba(22,163,74,0.2)', transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.1)'}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleInvite(inv.id, false)}
                      style={{
                        fontSize: '0.8rem', padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: 'rgba(220,38,38,0.08)', color: '#DC2626',
                        border: '1px solid rgba(220,38,38,0.15)', transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Assignments */}
      {!loading && visibleAssignments.length > 0 && (
        <div>
          {filter === 'All' && (
            <div style={{
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.75rem',
            }}>
              Task Assignments
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {visibleAssignments.map((asgn, idx) => (
              <motion.div
                key={asgn.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                        borderRadius: 99, background: 'rgba(245,158,11,0.1)',
                        color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>
                        Task Assignment
                      </span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                      {asgn.taskTitle}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>
                      Assigned by <strong>{asgn.assignedByUsername}</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleAssignment(asgn.id, true)}
                      style={{
                        fontSize: '0.8rem', padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: 'rgba(22,163,74,0.1)', color: '#16A34A',
                        border: '1px solid rgba(22,163,74,0.2)', transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.18)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22,163,74,0.1)'}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAssignment(asgn.id, false)}
                      style={{
                        fontSize: '0.8rem', padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontWeight: 500, fontFamily: 'var(--font-body)',
                        background: 'rgba(220,38,38,0.08)', color: '#DC2626',
                        border: '1px solid rgba(220,38,38,0.15)', transition: 'var(--transition)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.08)'}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}