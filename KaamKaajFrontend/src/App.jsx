import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ToastContainer from './components/ui/Toast'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import WorkspacePage from './pages/WorkspacePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import MyTasksPage from './pages/MyTasksPage'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
}

function AnimatedRoute({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  const isAppRoute = location.pathname.startsWith('/dashboard') ||
                     location.pathname.startsWith('/workspace')

  return (
    <>
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={
            <AnimatedRoute><LandingPage /></AnimatedRoute>
          } />
          <Route path="/auth" element={
            <AnimatedRoute><AuthPage /></AnimatedRoute>
          } />
        <Route path="/reset-password" element=
        {<ResetPasswordPage />} 
        />
          {/* Protected — wrapped in AppShell (sidebar) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppShell>
                <AnimatedRoute><DashboardPage /></AnimatedRoute>
              </AppShell>
            </ProtectedRoute>
          } />
          <Route path="/workspace/:workspaceId" element={
            <ProtectedRoute>
              <AppShell>
                <AnimatedRoute><WorkspacePage /></AnimatedRoute>
              </AppShell>
            </ProtectedRoute>
          } />
          <Route path="/my-tasks" element={
          <ProtectedRoute>
            <AppShell><MyTasksPage /></AppShell>
          </ProtectedRoute>
        } />

          {/* Fallback */}
          <Route path="*" element={
            <AnimatedRoute>
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 64, gap: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 800, background: 'var(--grad2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>404</div>
                <div style={{ fontSize: '1rem', color: 'var(--text2)' }}>Page not found</div>
                <a href="/" style={{ color: 'var(--violet)', fontSize: '0.875rem' }}>← Back to home</a>
              </div>
            </AnimatedRoute>
          } />
        </Routes>
      </AnimatePresence>

      <ToastContainer />

      {/* Global keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}
