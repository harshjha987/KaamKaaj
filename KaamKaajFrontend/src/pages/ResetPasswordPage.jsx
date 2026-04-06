import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react'
import { authService } from '../services/endpoints'
import useToastStore from '../store/toastStore'
import { extractApiError } from '../utils/helpers'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addToast } = useToastStore()

  const token = searchParams.get('token')

  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // If no token in URL, show error immediately
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.')
    }
  }, [token])

  const validate = () => {
    if (form.newPassword.length < 8) return 'Password must be at least 8 characters'
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/
    if (!pattern.test(form.newPassword)) return 'Password must contain uppercase, lowercase, number and special character (@$!%*?&)'
    if (form.newPassword !== form.confirm) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(token, form.newPassword)
      setDone(true)
      addToast('Password reset successfully!', 'success')
    } catch (err) {
      setError(extractApiError(err))
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'var(--violet)', filter: 'blur(120px)', opacity: 0.07, top: -150, left: -150, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'var(--cyan)', filter: 'blur(120px)', opacity: 0.07, bottom: -100, right: -100, pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800,
            background: 'var(--grad2)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: '2rem', cursor: 'pointer', display: 'inline-block',
          }}
        >
          KaamKaaj
        </div>

        {/* ── Success state ── */}
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(22,163,74,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <CheckCircle2 size={32} color="#16A34A" />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.4rem',
              fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}>
              Password reset!
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/auth')}
              style={{
                width: '100%', padding: '0.8rem',
                borderRadius: 'var(--radius)', border: 'none',
                background: 'var(--grad2)', color: '#fff',
                fontSize: '0.95rem', fontWeight: 500,
                fontFamily: 'var(--font-body)', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.92'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Go to login
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── Invalid token state ── */}
            {!token ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(220,38,38,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>
                  <XCircle size={32} color="#DC2626" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                  Invalid link
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  This reset link is invalid or has already been used. Please request a new one.
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  style={{
                    width: '100%', padding: '0.8rem',
                    borderRadius: 'var(--radius)', border: 'none',
                    background: 'var(--grad2)', color: '#fff',
                    fontSize: '0.95rem', fontWeight: 500,
                    fontFamily: 'var(--font-body)', cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  Back to login
                </button>
              </div>
            ) : (
              <>
                {/* ── Reset form ── */}
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius)',
                  background: 'var(--violet-alpha)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <KeyRound size={24} color="var(--violet)" />
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.4rem',
                  fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem',
                  letterSpacing: '-0.02em',
                }}>
                  Set new password
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  Choose a strong password. Must be 8-16 characters with uppercase, lowercase, number and special character.
                </p>

                {/* Error banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(220,38,38,0.08)',
                      border: '1px solid rgba(220,38,38,0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.9rem',
                      fontSize: '0.82rem', color: '#DC2626',
                      marginBottom: '1.25rem', lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* New password field */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text2)', marginBottom: '0.4rem' }}>
                    New password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); setError('') }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                      placeholder="Enter new password"
                      style={{
                        width: '100%', height: 44,
                        border: '1px solid var(--border2)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg2)', color: 'var(--text)',
                        fontSize: '0.9rem', padding: '0 2.5rem 0 0.9rem',
                        fontFamily: 'var(--font-body)', outline: 'none',
                        boxSizing: 'border-box', transition: 'var(--transition)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--violet)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text3)', padding: 0, display: 'flex',
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password field */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text2)', marginBottom: '0.4rem' }}>
                    Confirm new password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setError('') }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                      placeholder="Repeat new password"
                      style={{
                        width: '100%', height: 44,
                        border: '1px solid var(--border2)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg2)', color: 'var(--text)',
                        fontSize: '0.9rem', padding: '0 2.5rem 0 0.9rem',
                        fontFamily: 'var(--font-body)', outline: 'none',
                        boxSizing: 'border-box', transition: 'var(--transition)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--violet)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text3)', padding: 0, display: 'flex',
                      }}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password match indicator */}
                  {form.confirm && (
                    <div style={{
                      fontSize: '0.72rem', marginTop: '0.35rem', fontWeight: 500,
                      color: form.newPassword === form.confirm ? '#16A34A' : '#DC2626',
                    }}>
                      {form.newPassword === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.85rem',
                    borderRadius: 'var(--radius)', border: 'none',
                    background: loading ? 'var(--bg2)' : 'var(--grad2)',
                    color: loading ? 'var(--text3)' : '#fff',
                    fontSize: '0.95rem', fontWeight: 500,
                    fontFamily: 'var(--font-body)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
                    transition: 'var(--transition)',
                  }}
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                  <button
                    onClick={() => navigate('/auth')}
                    style={{
                      fontSize: '0.82rem', color: 'var(--text3)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--violet)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
                  >
                    ← Back to login
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}