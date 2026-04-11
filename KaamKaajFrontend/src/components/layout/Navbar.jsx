import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Home, LayoutDashboard, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

function scrollToSection(id, navigate, location) {
  if (location.pathname !== '/') {
    navigate('/')
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
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    addToast('Logged out successfully', 'info')
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64, padding: '0 1.25rem',
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

        {/* CENTER LINKS — desktop only */}
        {isLanding && (
          <div className="nav-links-desktop" style={{ display: 'flex', gap: '0.25rem' }}>
            <NavLink label="Features" onClick={() => scrollToSection('features', navigate, location)} />
            <NavLink label="About"    onClick={() => scrollToSection('about', navigate, location)} />
          </div>
        )}

        {/* RIGHT — desktop */}
        <div className="nav-right-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {!isLanding && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              style={iconBtnStyle} title="Home"
            >
              <Home size={15} />
            </motion.button>
          )}

          <motion.button whileHover={{ scale: 1.05, rotate: 12 }} whileTap={{ scale: 0.95 }}
            onClick={toggle}
            style={{ ...iconBtnStyle, borderRadius: '50%' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <LayoutDashboard size={13} /> Dashboard
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: 'pointer' }}
                onClick={() => navigate('/dashboard')} title={user?.username}>
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

        {/* HAMBURGER — mobile only */}
        <div className="nav-hamburger" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={toggle}
            style={{ ...iconBtnStyle, borderRadius: '50%' }}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen((o) => !o)}
            style={iconBtnStyle}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
              background: 'var(--bg3)',
              borderBottom: '1px solid var(--border)',
              padding: '1rem 1.25rem 1.5rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {isLanding && (
              <>
                <MobileNavItem label="Features" onClick={() => { scrollToSection('features', navigate, location); closeMenu() }} />
                <MobileNavItem label="About"    onClick={() => { scrollToSection('about', navigate, location); closeMenu() }} />
                <div style={{ height: 1, background: 'var(--border)', margin: '0.25rem 0' }} />
              </>
            )}

            {!isLanding && (
              <MobileNavItem label="Home" onClick={() => { navigate('/'); closeMenu() }} />
            )}

            {isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                  <Avatar name={user?.username || 'U'} size={36} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{user?.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <MobileNavItem label="Dashboard" onClick={() => { navigate('/dashboard'); closeMenu() }} />
                <MobileNavItem label="Log out" onClick={handleLogout} danger />
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
                <Button variant="ghost"   fullWidth onClick={() => { navigate('/auth'); closeMenu() }}>Sign in</Button>
                <Button variant="primary" fullWidth onClick={() => { navigate('/auth'); closeMenu() }}>Get started →</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {menuOpen && (
        <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, top: 64, zIndex: 98, background: 'rgba(0,0,0,0.2)' }} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop  { display: none !important; }
          .nav-right-desktop  { display: none !important; }
          .nav-hamburger      { display: flex !important; }
        }
      `}</style>
    </>
  )
}

const iconBtnStyle = {
  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border2)', background: 'var(--bg3)',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', color: 'var(--text2)',
  transition: 'var(--transition)',
}

function NavLink({ label, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '0.875rem', fontWeight: 400,
        color: hovered ? 'var(--text)' : 'var(--text2)',
        padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', transition: 'var(--transition)',
        border: 'none', background: hovered ? 'var(--bg2)' : 'none',
        fontFamily: 'var(--font-body)',
      }}
    >{label}</button>
  )
}

function MobileNavItem({ label, onClick, danger }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left',
        padding: '0.7rem 0.85rem', borderRadius: 'var(--radius-sm)',
        fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
        border: 'none', fontFamily: 'var(--font-body)',
        background: hovered ? 'var(--bg2)' : 'none',
        color: danger ? '#DC2626' : 'var(--text)',
        transition: 'var(--transition)',
      }}
    >{label}</button>
  )
}