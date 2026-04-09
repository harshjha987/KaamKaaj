import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import useAuthStore from './store/authStore'

// Check if existing session is valid before rendering
// This reads the HttpOnly cookie via /auth/me
useAuthStore.getState().checkAuth().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
})