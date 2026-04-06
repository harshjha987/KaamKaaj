import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.5rem', marginTop: '1.25rem',
    }}>
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'var(--bg3)',
          cursor: page === 0 ? 'not-allowed' : 'pointer',
          color: page === 0 ? 'var(--text3)' : 'var(--text2)',
          opacity: page === 0 ? 0.4 : 1,
          transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => { if (page > 0) e.currentTarget.style.borderColor = 'var(--violet)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, i) => {
        // Always show first, last, current, and neighbours
        const show = i === 0 || i === totalPages - 1 ||
                     Math.abs(i - page) <= 1
        const isGap = !show

        if (isGap && (i === 1 || i === totalPages - 2)) {
          return <span key={i} style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>…</span>
        }
        if (isGap) return null

        return (
          <button
            key={i}
            onClick={() => onPageChange(i)}
            style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              border: `1px solid ${i === page ? 'var(--violet)' : 'var(--border)'}`,
              background: i === page ? 'var(--violet-alpha)' : 'var(--bg3)',
              color: i === page ? 'var(--violet)' : 'var(--text2)',
              fontSize: '0.82rem', fontWeight: i === page ? 600 : 400,
              cursor: 'pointer', transition: 'var(--transition)',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => { if (i !== page) e.currentTarget.style.borderColor = 'var(--violet)' }}
            onMouseLeave={(e) => { if (i !== page) e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {i + 1}
          </button>
        )
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)', background: 'var(--bg3)',
          cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
          color: page === totalPages - 1 ? 'var(--text3)' : 'var(--text2)',
          opacity: page === totalPages - 1 ? 0.4 : 1,
          transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => { if (page < totalPages - 1) e.currentTarget.style.borderColor = 'var(--violet)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <ChevronRight size={14} />
      </button>

      {/* Page info */}
      <span style={{ fontSize: '0.75rem', color: 'var(--text3)', marginLeft: '0.25rem' }}>
        Page {page + 1} of {totalPages}
      </span>
    </div>
  )
}