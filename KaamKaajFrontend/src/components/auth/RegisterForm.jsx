import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Input } from '../ui/Input'
import Button from '../ui/Button'
import useAuthStore from '../../store/authStore'
import useToastStore from '../../store/toastStore'

export default function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const { register, loading } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.username || form.username.length < 3) e.username = 'Username must be 3–15 characters'
    if (!form.email) e.email = 'Email is required'
    const pwRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/
    if (!pwRe.test(form.password)) e.password = 'Min 8 chars with upper, lower, number & special character (@$!%*?&) — # not supported'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await register(form.username, form.email.trim().toLowerCase(), form.password)
    if (result.success) {
      addToast('Account created! Welcome to KaamKaaj 🎉', 'success')
      navigate('/dashboard')
    } else {
      addToast(result.error || 'Registration failed', 'error')
    }
  }
 const pwRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/

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
      }}>Create account</h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '2rem', fontWeight: 300 }}>
        Start your KaamKaaj journey today
      </p>

      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          placeholder="yourname"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          error={errors.username}
          autoComplete="username"
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars, upper + lower + number + symbol (@$!%*?&)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.25rem', height: 44 }}>
          Create account →
        </Button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text3)', marginTop: '1.25rem' }}>
        Already have an account?{' '}
        <span style={{ color: 'var(--violet)', cursor: 'pointer' }} onClick={onSwitch}>
          Sign in
        </span>
      </p>
    </motion.div>
  )
}
