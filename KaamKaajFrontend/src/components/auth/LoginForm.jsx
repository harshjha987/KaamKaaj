import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'
import { authService } from '../../services/endpoints'
import { extractApiError } from '../../utils/helpers'

export default function LoginForm({ onSwitch }) {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const { login, loading }  = useAuthStore()
  const { addToast }        = useToastStore()
  const navigate            = useNavigate()

  // Forgot password state
  const [showForgot, setShowForgot]       = useState(false)
  const [forgotEmail, setForgotEmail]     = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent]       = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await login(form.email.trim().toLowerCase(), form.password)
    if (result.success) {
      addToast('Welcome back!', 'success')
      navigate('/dashboard')
    } else {
      addToast(result.error || 'Login failed', 'error')
    }
  }

  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) { addToast('Enter your email address', 'error'); return }
    setForgotLoading(true)
    try {
      await authService.forgotPassword(forgotEmail.trim().toLowerCase())
      setForgotSent(true)
    } catch (err) {
      // Always show success even on error — prevents user enumeration
      setForgotSent(true)
    }
    setForgotLoading(false)
  }

  const handleBackToLogin = () => {
    setShowForgot(false)
    setForgotSent(false)
    setForgotEmail('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <AnimatePresence mode="wait">

        {/* ── Forgot password sent confirmation ── */}
        {showForgot && forgotSent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(22,163,74,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.5rem',
            }}>
              📬
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.4rem',
              fontWeight: 700, color: 'var(--text)',
              marginBottom: '0.5rem', letterSpacing: '-0.02em',
            }}>
              Check your inbox
            </h2>
            <p style={{
              fontSize: '0.875rem', color: 'var(--text2)',
              marginBottom: '0.5rem', lineHeight: 1.6,
            }}>
              If <strong>{forgotEmail}</strong> is registered, you'll receive a
              password reset link shortly.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '2rem', lineHeight: 1.5 }}>
              The link expires in 15 minutes. Check your spam folder if you don't see it.
            </p>
            <Button fullWidth onClick={handleBackToLogin} style={{ height: 44 }}>
              Back to login
            </Button>
          </motion.div>

        ) : showForgot ? (
          /* ── Forgot password form ── */
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.6rem',
              fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)',
              marginBottom: '0.35rem',
            }}>
              Reset password
            </h2>
            <p style={{
              fontSize: '0.875rem', color: 'var(--text2)',
              marginBottom: '2rem', fontWeight: 300, lineHeight: 1.6,
            }}>
              Enter the email address linked to your account and we'll send you a reset link.
            </p>

            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleForgotSubmit() }}
              autoComplete="email"
            />

            <Button
              fullWidth
              loading={forgotLoading}
              onClick={handleForgotSubmit}
              style={{ height: 44, marginTop: '0.25rem' }}
            >
              Send reset link →
            </Button>

            <p style={{
              textAlign: 'center', fontSize: '0.8rem',
              color: 'var(--text3)', marginTop: '1.25rem',
            }}>
              <span
                onClick={handleBackToLogin}
                style={{ color: 'var(--violet)', cursor: 'pointer' }}
              >
                ← Back to login
              </span>
            </p>
          </motion.div>

        ) : (
          /* ── Login form ── */
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.75rem',
              fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)',
              marginBottom: '0.35rem',
            }}>
              Welcome back
            </h2>
            <p style={{
              fontSize: '0.875rem', color: 'var(--text2)',
              marginBottom: '2rem', fontWeight: 300,
            }}>
              Sign in to your KaamKaaj account
            </p>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />

            
              {/* Password label row — forgot link sits beside it */}
              <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{
                  fontSize: '0.8rem', fontWeight: 500,
                  color: 'var(--text2)', letterSpacing: '0.01em',
                }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(form.email) }}
                  style={{
                    fontSize: '0.78rem', color: 'var(--violet)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    padding: 0, transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Forgot password?
                </button>
              </div>

              
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                loading={loading}
                style={{ marginTop: '0.25rem', height: 44 }}
              >
                Sign in →
              </Button>
            </form>

            <p style={{
              textAlign: 'center', fontSize: '0.8rem',
              color: 'var(--text3)', marginTop: '1.25rem',
            }}>
              Don't have an account?{' '}
              <span
                style={{ color: 'var(--violet)', cursor: 'pointer' }}
                onClick={onSwitch}
              >
                Create one
              </span>
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}