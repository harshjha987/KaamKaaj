import React from 'react'
import HeroSection from '../components/landing/HeroSection'
import { FeaturesSection, StatsSection, CTASection, Footer } from '../components/landing/Sections'

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
