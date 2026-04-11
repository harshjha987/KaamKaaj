import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import useAuthStore from '../store/authStore'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div style={{ minHeight: '100vh', display: 'flex', paddingTop: 64 }}>

      {/* LEFT BRAND PANEL — hidden on mobile */}
      <div className="auth-brand-panel" style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4rem 3rem',
        background: 'linear-gradient(135deg,#1a0533 0%,#0c1a3a 50%,#03181f 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'var(--violet)', top: -100, right: -100, filter: 'blur(60px)', opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'var(--cyan)', bottom: -100, left: -100, filter: 'blur(60px)', opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#A78BFA,#67E8F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            KaamKaaj
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '2rem' }}>
            The task management platform for teams that mean business.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {['Ship faster', 'Stay organized', 'Team-ready', 'Always in sync', 'Zero noise'].map((pill) => (
              <span key={pill} style={{ fontSize: '0.72rem', padding: '0.3rem 0.8rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.25rem',
        background: 'var(--bg)', minWidth: 0,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '0.3rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
            {[{ key: 'login', label: 'Sign in' }, { key: 'register', label: 'Create account' }].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                transition: 'var(--transition)', textAlign: 'center',
                border: 'none', fontFamily: 'var(--font-body)',
                background: tab === t.key ? 'var(--bg3)' : 'none',
                color:      tab === t.key ? 'var(--text)' : 'var(--text2)',
                boxShadow:  tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>{t.label}</button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login'
              ? <LoginForm    key="login"    onSwitch={() => setTab('register')} />
              : <RegisterForm key="register" onSwitch={() => setTab('login')} />
            }
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .auth-brand-panel { display: flex; }
        @media (max-width: 768px) {
          .auth-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}