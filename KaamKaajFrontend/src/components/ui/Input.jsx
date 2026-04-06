import React from 'react'
import { Eye, EyeOff } from 'lucide-react'

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
  const [focused, setFocused]       = React.useState(false)
  const [showText, setShowText]     = React.useState(false)

  // Is this a password field?
  const isPassword = type === 'password'

  // Effective input type — toggle between password and text
  const effectiveType = isPassword ? (showText ? 'text' : 'password') : type

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && (
        <label style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '0.8rem', fontWeight: 500, color: 'var(--text2)',
          marginBottom: '0.4rem', letterSpacing: '0.01em',
        }}>{label}</label>
      )}

      {/* Wrap in a relative container when password so we can position the eye */}
      <div style={{ position: 'relative' }}>
        <input
          type={effectiveType}
          style={{
            ...inputStyle,
            // Add right padding to make room for the eye icon
            paddingRight: isPassword ? '2.5rem' : '0.9rem',
            borderColor: error ? '#DC2626' : focused ? 'var(--violet)' : 'var(--border2)',
            boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Eye toggle — only renders for password fields */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowText((v) => !v)}
            tabIndex={-1}  // don't steal tab focus from the input
            style={{
              position: 'absolute', right: '0.75rem', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer', color: 'var(--text3)',
              display: 'flex', alignItems: 'center',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--violet)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text3)'}
          >
            {showText ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

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