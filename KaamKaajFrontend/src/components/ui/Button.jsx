import React from 'react'
import { cn } from '../../utils/helpers'

const styles = {
  base: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.4rem', fontFamily: 'var(--font-body)', fontWeight: 500,
    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    transition: 'var(--transition)', border: 'none', outline: 'none',
    whiteSpace: 'nowrap',
  },
  primary: {
    background: 'var(--grad2)', color: '#fff',
    boxShadow: '0 2px 12px rgba(124,58,237,0.25)',
  },
  ghost: {
    background: 'none', color: 'var(--text2)',
    border: '1px solid var(--border2)',
  },
  danger: {
    background: 'rgba(220,38,38,0.1)', color: '#DC2626',
    border: '1px solid rgba(220,38,38,0.2)',
  },
  success: {
    background: 'rgba(22,163,74,0.1)', color: '#16A34A',
    border: '1px solid rgba(22,163,74,0.2)',
  },
  sm:  { fontSize: '0.8rem',   padding: '0.4rem 0.9rem' },
  md:  { fontSize: '0.875rem', padding: '0.5rem 1.1rem' },
  lg:  { fontSize: '1rem',     padding: '0.75rem 2rem'  },
  full: { width: '100%' },
}

export default function Button({
  children, variant = 'primary', size = 'md',
  fullWidth = false, loading = false, disabled = false,
  onClick, style = {}, type = 'button',
}) {
  const s = {
    ...styles.base,
    ...styles[variant],
    ...styles[size],
    ...(fullWidth ? styles.full : {}),
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    ...style,
  }

  return (
    <button type={type} style={s} disabled={disabled || loading} onClick={onClick}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.88' }}
      onMouseLeave={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '1' }}
      onMouseDown={(e) => { if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', display: 'inline-block',
    }} />
  )
}
