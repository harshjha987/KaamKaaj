import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] },
})

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(5rem,10vw,7rem) clamp(1rem,4vw,2rem) 4rem',
      textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <Orb style={{ width: 600, height: 600, background: 'var(--violet)', top: -200, left: -200, animationDelay: '0s' }} />
      <Orb style={{ width: 500, height: 500, background: 'var(--cyan)',   bottom: -200, right: -200, animationDelay: '-4s' }} />
      <Orb style={{ width: 380, height: 380, background: '#4F46E5',       top: '30%',   right: '8%',  animationDelay: '-2s' }} />

      {/* Badge */}
      <motion.div {...fadeUp(0)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.35rem 0.9rem', borderRadius: 99,
        border: '1px solid rgba(124,58,237,0.3)',
        background: 'rgba(124,58,237,0.08)',
        marginBottom: '2rem', backdropFilter: 'blur(10px)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'pulse-dot 2s ease infinite', display: 'block' }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--violet)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Now in Beta — Free Forever
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1 {...fadeUp(0.1)} style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
        fontWeight: 700, lineHeight: 1.08,
        letterSpacing: '-0.02em', marginBottom: '1.5rem',
      }}>
        <span style={{ display: 'block', color: 'var(--text)' }}>Work that moves.</span>
        <span style={{
          display: 'block',
          background: 'var(--grad2)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Teams that thrive.</span>
      </motion.h1>

      <motion.p {...fadeUp(0.2)} style={{
        fontSize: '1.15rem', fontWeight: 300, color: 'var(--text2)',
        maxWidth: 520, lineHeight: 1.65, marginBottom: '2.5rem',
        padding: '0 0.5rem',
      }}>
        KaamKaaj brings your team's work into focus. Assign, track, and complete tasks
        with a platform that's as sharp as you are.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div {...fadeUp(0.3)} style={{
        display: 'flex', gap: '1rem', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '4rem', padding: '0 1rem',
      }}>
        <HeroBtn primary onClick={() => navigate('/auth')}>
          Start for free <ArrowRight size={16} />
        </HeroBtn>
        <HeroBtn onClick={() => navigate('/auth')}>
          <Play size={14} /> Watch demo
        </HeroBtn>
      </motion.div>

      {/* Dashboard mockup */}
      <motion.div
        {...fadeUp(0.4)}
        style={{
          width: '100%', maxWidth: 900,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border2)',
          boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(124,58,237,0.08)',
          background: 'var(--bg3)', position: 'relative', zIndex: 1,
        }}
      >
        {/* Browser bar */}
        <div style={{ height: 40, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem' }}>
          {['#FF5F57','#FEBC2E','#28C840'].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
          ))}
          <div style={{ flex: 1, margin: '0 1rem', height: 22, background: 'var(--bg)', borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>app.kaamkaaj.io/workspace/product-team</span>
          </div>
        </div>

        {/* Mockup body */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0,180px) 1fr', gap: '1rem', minHeight: 300 }}>
          {/* Sidebar preview — hidden on mobile */}
          <div className="hero-mockup-sidebar" style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '0.4rem' }}>Workspaces</div>
            {[
              { label: '⚡ Product Team', active: true },
              { label: '🎨 Design Studio', active: false },
              { label: '🔧 Backend Infra', active: false },
            ].map((ws) => (
              <div key={ws.label} style={{
                padding: '0.45rem 0.65rem', borderRadius: 6,
                fontSize: '0.72rem', fontWeight: ws.active ? 500 : 400,
                background: ws.active ? 'var(--violet-alpha)' : 'none',
                color: ws.active ? 'var(--violet)' : 'var(--text2)',
              }}>{ws.label}</div>
            ))}
          </div>

          {/* Task board preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>Sprint Tasks</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Chip color="var(--violet)">5 Active</Chip>
                <Chip color="var(--cyan-dark)">2 In Review</Chip>
              </div>
            </div>
            {[
              { title: 'Setup auth with JWT refresh tokens', done: true },
              { title: 'Build workspace invitation flow',   active: true },
              { title: 'Design dashboard UI components',   done: false },
              { title: 'Write API documentation',          done: false },
            ].map((t, i) => (
              <div key={i} style={{
                background: 'var(--bg2)', borderRadius: 8, padding: '0.55rem 0.7rem',
                border: `1px solid ${t.active ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', gap: '0.65rem',
              }}>
                <div style={{
                  width: 13, height: 13, borderRadius: 4, flexShrink: 0,
                  background: t.done ? 'var(--violet)' : 'none',
                  border: t.done ? 'none' : `1.5px solid ${t.active ? 'var(--violet)' : 'var(--border2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.done && <span style={{ fontSize: 7, color: '#fff', fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: '0.7rem', color: t.done ? 'var(--text3)' : 'var(--text)', textDecoration: t.done ? 'line-through' : 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <Chip color={t.done ? '#16A34A' : t.active ? 'var(--violet)' : 'var(--text3)'}>
                  {t.done ? 'Done' : t.active ? 'Active' : 'Queue'}
                </Chip>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes orb-float {
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(30px,-20px) scale(1.05)}
          66%{transform:translate(-20px,30px) scale(0.95)}
        }
        @keyframes pulse-dot {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0.5;transform:scale(1.4)}
        }
        @media (max-width: 560px) {
          .hero-mockup-sidebar { display: none !important; }
        }
      `}</style>
    </section>
  )
}

function Orb({ style }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%',
      filter: 'blur(80px)', opacity: 0.13, pointerEvents: 'none',
      animation: 'orb-float 8s ease-in-out infinite',
      ...style,
    }} />
  )
}

function HeroBtn({ children, primary, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      fontSize: '1rem', fontWeight: 500,
      padding: '0.8rem 2rem', borderRadius: 'var(--radius)',
      cursor: 'pointer', transition: 'var(--transition)',
      fontFamily: 'var(--font-body)',
      ...(primary
        ? { background: 'var(--grad2)', color: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }
        : { background: 'var(--bg-glass)', color: 'var(--text)', border: '1px solid var(--border2)', backdropFilter: 'blur(10px)' }
      ),
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
    >{children}</button>
  )
}

function Chip({ children, color }) {
  return (
    <span style={{
      fontSize: '0.6rem', padding: '0.15rem 0.45rem', borderRadius: 99,
      fontWeight: 500, background: `${color}18`, color,
    }}>{children}</span>
  )
}