import React from 'react'

const inputStyle = {
  width: '100%', height: 42,
  border: '1px solid var(--border2)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg3)', color: 'var(--text)',
  fontSize: '0.9rem', padding: '0 0.9rem',
  fontFamily: 'var(--font-body)',
  transition: 'var(--transition)', outline: 'none',
}

export function Input({ label, error, type = 'text', ...props }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && (
        <label style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.8rem', fontWeight: 500, color: 'var(--text2)',
          marginBottom: '0.4rem', letterSpacing: '0.01em',
        }}>{label}</label>
      )}
      <input
        type={type}
        style={{
          ...inputStyle,
          borderColor: error ? '#DC2626' : focused ? 'var(--violet)' : 'var(--border2)',
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.3rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

export function Select({ label, error, children, ...props }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && (
        <label style={{
          display: 'block', fontSize: '0.8rem', fontWeight: 500,
          color: 'var(--text2)', marginBottom: '0.4rem',
        }}>{label}</label>
      )}
      <select style={{ ...inputStyle, cursor: 'pointer' }} {...props}>
        {children}
      </select>
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.3rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
}

export function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && (
        <label style={{
          display: 'block', fontSize: '0.8rem', fontWeight: 500,
          color: 'var(--text2)', marginBottom: '0.4rem',
        }}>{label}</label>
      )}
      <textarea
        style={{
          ...inputStyle, height: 'auto', minHeight: 80,
          padding: '0.6rem 0.9rem', resize: 'vertical',
        }}
        {...props}
      />
    </div>
  )
}
