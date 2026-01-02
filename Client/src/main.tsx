import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import AppProviders from './context/AppProviders'
import './style.css'

// Prevent browser from restoring scroll position
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  
)
