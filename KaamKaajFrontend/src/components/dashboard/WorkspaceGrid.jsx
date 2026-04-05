import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { getInitials, getAvatarColor } from '../../utils/helpers'

const WS_GRADS = [
  'linear-gradient(135deg,#7C3AED,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#10B981,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
  'linear-gradient(135deg,#3B82F6,#10B981)',
]

export default function WorkspaceGrid({ workspaces = [], myMemberships = {}, onNew }) {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      {workspaces.map((ws, i) => {
        const grad = WS_GRADS[i % WS_GRADS.length]
        const abbr = getInitials(ws.name)
        const membership = myMemberships[ws.id]

        return (
          <motion.div
            key={ws.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(`/workspace/${ws.id}`)}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              cursor: 'pointer', transition: 'var(--transition)',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {/* Top gradient stripe on hover handled via CSS */}
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              {abbr}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
              {ws.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1rem' }}>
              {ws.description || 'No description'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: getAvatarColor(ws.createdByUsername || ''), border: '2px solid var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 600, color: '#fff' }}>
                  {getInitials(ws.createdByUsername || '?')}
                </div>
              </div>
              {membership && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                  borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: membership.role === 'ADMIN' ? 'var(--violet-alpha)' : 'var(--cyan-alpha)',
                  color: membership.role === 'ADMIN' ? 'var(--violet)' : 'var(--cyan-dark)',
                }}>
                  {membership.role}
                </span>
              )}
            </div>
          </motion.div>
        )
      })}

      {/* New workspace card */}
      <motion.div
        whileHover={{ y: -4 }}
        onClick={onNew}
        style={{
          border: '1.5px dashed var(--border2)', borderRadius: 'var(--radius-lg)',
          padding: '1.5rem', cursor: 'pointer', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 140, color: 'var(--text3)', gap: '0.5rem',
          transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--violet)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text3)' }}
      >
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px dashed currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={16} />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>New workspace</span>
        <span style={{ fontSize: '0.75rem' }}>Create a new team space</span>
      </motion.div>
    </div>
  )
}
