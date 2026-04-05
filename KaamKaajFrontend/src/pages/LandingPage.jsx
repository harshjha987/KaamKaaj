import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import HeroSection from '../components/landing/HeroSection'
import { FeaturesSection, StatsSection, CTASection, Footer } from '../components/landing/Sections'

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show the button once user scrolls more than 400px
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />

      {/* Scroll to top button — appears after scrolling 400px */}
      <button
        onClick={scrollToTop}
        title="Back to top"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--grad2)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
          zIndex: 99,
          transition: 'all 0.3s ease',
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.8)',
          pointerEvents: showScrollTop ? 'auto' : 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.4)' }}
      >
        <ArrowUp size={18} />
      </button>
    </div>
  )
}