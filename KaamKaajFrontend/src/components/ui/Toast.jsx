import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import useToastStore from '../../store/toastStore'

const icons = {
  success: <CheckCircle size={15} color="#16A34A" />,
  error:   <XCircle    size={15} color="#DC2626" />,
  info:    <Info       size={15} color="#7C3AED" />,
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      zIndex: 300, display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)', padding: '0.7rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: 'var(--shadow-lg)', maxWidth: 320,
              fontSize: '0.85rem', color: 'var(--text)',
            }}
          >
            {icons[t.type]}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text3)', display: 'flex', padding: 2,
            }}>
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
