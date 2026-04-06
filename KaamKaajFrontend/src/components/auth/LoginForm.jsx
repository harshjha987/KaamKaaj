import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'

export default function LoginForm({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const { login, loading } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: '1.75rem',
        fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)',
        marginBottom: '0.35rem',
      }}>Welcome back</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '2rem', fontWeight: 300 }}>
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
        <div style={{ position: 'relative' }}>
          <Link to = "/reset-password">
          <div style={{
            position: 'absolute', top: 0, right: 0,
            fontSize: '0.78rem', color: 'var(--violet)', cursor: 'pointer',
          }}>Forgot Password?</div>
          </Link>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.25rem', height: 44 }}>
          Sign in →
        </Button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text3)', marginTop: '1.25rem' }}>
        Don't have an account?{' '}
        <span style={{ color: 'var(--violet)', cursor: 'pointer' }} onClick={onSwitch}>
          Create one
        </span>
      </p>
    </motion.div>
  )
}
