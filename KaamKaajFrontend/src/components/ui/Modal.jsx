import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 480 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', padding: '1rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-xl)', padding: '2rem',
              width: '100%', maxWidth,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: subtitle ? '0.3rem' : 0 }}>
                  {title}
                </h2>
                {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 300 }}>{subtitle}</p>}
              </div>
              <button onClick={onClose} style={{
                width: 32, height: 32, border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-sm)', background: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--text2)',
                transition: 'var(--transition)', flexShrink: 0,
              }}>
                <X size={14} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ModalFooter({ children }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
      {children}
    </div>
  )
}
