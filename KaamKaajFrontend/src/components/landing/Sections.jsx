import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Inbox, Building2, Zap, BarChart3, Search } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const FEATURES = [
  { icon: Shield,    title: 'Role-based access',       desc: 'Admins manage workspaces, members execute. Fine-grained permissions that make sense for real teams.',   accent: 'var(--violet)' },
  { icon: Inbox,     title: 'Smart assignment inbox',  desc: 'Tasks come to you as requests. Accept what matters, decline what doesn\'t. Your work, your control.',    accent: 'var(--cyan)'   },
  { icon: Building2, title: 'Multi-workspace isolation', desc: 'Belong to multiple workspaces with complete data isolation. W1 never bleeds into W2.',               accent: '#4F46E5'       },
  { icon: Zap,       title: 'JWT authentication',      desc: 'Stateless, fast, and secure. Access tokens rotate every 15 minutes. Refresh tokens live 7 days.',        accent: 'var(--violet)' },
  { icon: BarChart3, title: 'Task state machine',      desc: 'Every status transition is intentional. NOT_STARTED → IN_PROGRESS → COMPLETED. No going back.',          accent: 'var(--cyan)'   },
  { icon: Search,    title: 'Privacy-safe search',     desc: 'Find users to invite without exposing their workspace memberships. Search returns identity, never context.', accent: '#4F46E5'   },
]

export function FeaturesSection() {
  const ref = useScrollReveal()
  return (
    <section id="features" style={{ padding: '6rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={ref} className="reveal">
          <div style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--violet)', marginBottom: '0.75rem' }}>
            Why KaamKaaj
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Built for teams that ship.
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'var(--text2)', maxWidth: 460, lineHeight: 1.7, marginBottom: '3rem' }}>
            Every feature is intentional. No bloat, no noise — just the tools your team needs to move fast.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.08} />)}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, desc, accent, delay }) {
  const ref = useScrollReveal()
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      ref={ref}
      className={`reveal reveal-d${Math.min(delay > 0.16 ? 3 : delay > 0.08 ? 2 : 1, 3)}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem',
        transition: 'var(--transition)', cursor: 'default',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
        opacity: hovered ? 1 : 0, transition: 'var(--transition)',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-sm)',
        background: `${accent}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '1rem',
      }}>
        <Icon size={20} color={accent} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.88rem', fontWeight: 300, color: 'var(--text2)', lineHeight: 1.65 }}>
        {desc}
      </p>
    </div>
  )
}

export function StatsSection() {
  const ref = useScrollReveal()
  return (
    <section id="about" style={{ padding: '4rem 2rem', background: 'var(--bg3)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
        {[
          { num: '15min', label: 'Access token lifetime' },
          { num: '∞',     label: 'Workspaces you can create' },
          { num: '0ms',   label: 'Auth latency overhead' },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--grad2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {s.num}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text2)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function CTASection() {
  const navigate = useNavigate()
  const ref = useScrollReveal()
  return (
    <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
      <div ref={ref} className="reveal" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Ready to ship?
        </h2>
        <p style={{ fontSize: '1rem', fontWeight: 300, color: 'var(--text2)', marginBottom: '2rem', lineHeight: 1.65 }}>
          Join teams using KaamKaaj to get work done without the noise.
        </p>
        <button onClick={() => navigate('/auth')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '1rem', fontWeight: 500, padding: '0.8rem 2rem',
          borderRadius: 'var(--radius)', cursor: 'pointer',
          background: 'var(--grad2)', color: '#fff', border: 'none',
          boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
          fontFamily: 'var(--font-body)', transition: 'var(--transition)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.4)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.3)' }}
        >
          Create your workspace →
        </button>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, background: 'var(--grad2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            KaamKaaj
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.2rem' }}>Work that matters.</div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
          © 2026 KaamKaaj · Built with Spring Boot + React
        </div>
      </div>
    </footer>
  )
}
