import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isLanding = location.pathname === '/'

  const handleLogout = async () => {
    await logout()
    addToast('Logged out successfully', 'info')
    navigate('/')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 64, padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      background: 'var(--bg-glass)',
      borderBottom: '1px solid var(--border)',
      transition: 'var(--transition)',
    }}>
      {/* LOGO */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <motion.span
          whileHover={{ scale: 1.02 }}
          style={{
            fontFamily: 'var(--font-display)', fontSize: '1.3rem',
            fontWeight: 800, letterSpacing: '-0.02em', cursor: 'pointer',
            background: 'var(--grad2)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >KaamKaaj</motion.span>
      </Link>

      {/* CENTER LINKS — landing only */}
      {isLanding && !isAuthenticated && (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {['Features', 'About'].map((label) => (
            <NavLink key={label} label={label} />
          ))}
        </div>
      )}

      {/* RIGHT ACTIONS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* Home button — shown when NOT on landing */}
        {location.pathname !== '/' && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border2)', background: 'var(--bg3)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text2)',
              transition: 'var(--transition)',
            }}
            title="Home"
          >
            <Home size={15} />
          </motion.button>
        )}

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05, rotate: 12 }} whileTap={{ scale: 0.95 }}
          onClick={toggle}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid var(--border2)', background: 'var(--bg3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text2)',
            transition: 'var(--transition)',
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </motion.button>

        {/* Auth area */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
              {user?.username}
            </span>
            <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}>
              <Avatar name={user?.username || user?.email || 'U'} size={32} />
            </motion.div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Sign in</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>Get started</Button>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ label }) {
  return (
    <button style={{
      fontSize: '0.875rem', fontWeight: 400, color: 'var(--text2)',
      padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)',
      cursor: 'pointer', transition: 'var(--transition)',
      border: 'none', background: 'none', fontFamily: 'var(--font-body)',
    }}
    onMouseEnter={(e) => { e.target.style.background = 'var(--bg2)'; e.target.style.color = 'var(--text)' }}
    onMouseLeave={(e) => { e.target.style.background = 'none'; e.target.style.color = 'var(--text2)' }}
    >
      {label}
    </button>
  )
}
