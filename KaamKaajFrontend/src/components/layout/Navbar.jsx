import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Home, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

// Smoothly scrolls to a section by id.
// If we're not on the landing page, navigate there first then scroll.
function scrollToSection(id, navigate, location) {
  if (location.pathname !== '/') {
    navigate('/')
    // Wait for navigation + render then scroll
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
}

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
      <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
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

      {/* CENTER LINKS — always visible on landing page, logged in or not */}
      {isLanding && (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <NavLink
            label="Features"
            onClick={() => scrollToSection('features', navigate, location)}
          />
          <NavLink
            label="About"
            onClick={() => scrollToSection('about', navigate, location)}
          />
        </div>
      )}

      {/* RIGHT ACTIONS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>

        {/* Home button — shown when NOT on landing */}
        {!isLanding && (
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
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </motion.button>

        {/* Auth area */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Dashboard button — always visible when logged in */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <LayoutDashboard size={13} /> Dashboard
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
              title={user?.username}
            >
              <Avatar name={user?.username || user?.email || 'U'} size={32} />
            </motion.div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
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

function NavLink({ label, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '0.875rem', fontWeight: 400,
        color: hovered ? 'var(--text)' : 'var(--text2)',
        padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', transition: 'var(--transition)',
        border: 'none',
        background: hovered ? 'var(--bg2)' : 'none',
        fontFamily: 'var(--font-body)',
      }}
    >
      {label}
    </button>
  )
}