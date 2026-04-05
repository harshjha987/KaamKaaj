import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Mail, CheckSquare, Plus, Settings, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'

export default function Sidebar({ workspaces = [], inboxCount = 0, onNewWorkspace, onSettings }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuthStore()

  const NAV = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Mail,            label: 'Inbox',    path: '/dashboard', badge: inboxCount },
    { icon: CheckSquare,     label: 'My Tasks', path: '/dashboard' },
  ]

  return (
    <aside style={{
      width: 256, flexShrink: 0,
      background: 'var(--bg3)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 64, height: 'calc(100vh - 64px)',
      overflowY: 'auto', padding: '1.25rem 0',
    }}>
      {/* USER CHIP */}
      <div style={{ padding: '0 1rem', marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg2)',
        }}>
          <Avatar name={user?.username || user?.email || 'U'} size={28} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username || user?.email}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text3)' }}>Free plan</div>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div style={{ padding: '0 0.75rem', marginBottom: '1.5rem' }}>
        {NAV.map(({ icon: Icon, label, path, badge }) => {
          const active = location.pathname === path
          return (
            <motion.button
              key={label} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                width: '100%', padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                border: 'none', textAlign: 'left',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--violet)' : 'var(--text2)',
                background: active ? 'var(--violet-alpha)' : 'none',
                transition: 'var(--transition)', marginBottom: '0.15rem',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text)' }}}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text2)' }}}
            >
              <Icon size={15} style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && (
                <span style={{
                  background: 'var(--violet)', color: '#fff',
                  fontSize: '0.62rem', fontWeight: 600,
                  padding: '0.1rem 0.45rem', borderRadius: 99,
                }}>{badge}</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* WORKSPACES */}
      <div style={{ padding: '0 0.75rem', flex: 1 }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text3)',
          padding: '0 0.75rem', marginBottom: '0.5rem',
        }}>Workspaces</div>

        {workspaces.map((ws) => {
          const active = location.pathname === `/workspace/${ws.id}`
          return (
            <motion.button
              key={ws.id} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/workspace/${ws.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                width: '100%', padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                border: 'none', textAlign: 'left',
                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--violet)' : 'var(--text2)',
                background: active ? 'var(--violet-alpha)' : 'none',
                transition: 'var(--transition)', marginBottom: '0.15rem',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text)' }}}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text2)' }}}
            >
              <WsColorDot name={ws.name} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ws.name}
              </span>
              {active && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
            </motion.button>
          )
        })}

        <motion.button
          whileTap={{ scale: 0.98 }} onClick={onNewWorkspace}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            width: '100%', padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            border: 'none', textAlign: 'left',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            color: 'var(--text3)', background: 'none', transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--violet)'; e.currentTarget.style.background = 'var(--violet-alpha)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'none' }}
        >
          <Plus size={14} />
          New workspace
        </motion.button>
      </div>

      {/* SETTINGS — now wired up */}
      <div style={{ padding: '0 0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '1rem' }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onSettings}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            width: '100%', padding: '0.55rem 0.75rem',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            border: 'none', textAlign: 'left',
            fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            color: 'var(--text2)', background: 'none', transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text2)' }}
        >
          <Settings size={15} style={{ opacity: 0.65 }} />
          Settings
        </motion.button>
      </div>
    </aside>
  )
}

const WS_COLORS = [
  'linear-gradient(135deg,#7C3AED,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#10B981,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#8B5CF6)',
  'linear-gradient(135deg,#3B82F6,#06B6D4)',
]

function WsColorDot({ name = '' }) {
  const idx = name.charCodeAt(0) % WS_COLORS.length
  return (
    <div style={{ width: 14, height: 14, borderRadius: 4, background: WS_COLORS[idx], flexShrink: 0 }} />
  )
}