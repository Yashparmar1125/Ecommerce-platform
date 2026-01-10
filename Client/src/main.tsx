import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import AppProviders from './context/AppProviders'
import ErrorBoundary from './components/ErrorBoundary'
import { initPerformanceMonitoring } from './utils/performance'
import './style.css'

// Prevent browser from restoring scroll position
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  initPerformanceMonitoring()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
