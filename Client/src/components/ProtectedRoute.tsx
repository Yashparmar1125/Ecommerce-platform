import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'
import Button from './Button'

interface ProtectedRouteProps {
  children: React.ReactNode
  showModal?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, showModal = true }) => {
  const { user } = useAuth()
  const location = useLocation()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  // Auto-open modal if not authenticated and showModal is true
  useEffect(() => {
    if (!user && showModal) {
      setIsLoginModalOpen(true)
    }
  }, [user, showModal])

  // If user is authenticated, render children
  if (user) {
    return <>{children}</>
  }

  // If showModal is true, show login modal overlay
  if (showModal) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md mx-auto px-6">
            <h2 className="text-2xl font-heading font-medium text-primary mb-4">
              Sign In Required
            </h2>
            <p className="text-sm text-neutral-600 mb-8">
              Please sign in to access this page
            </p>
            <Button
              onClick={() => setIsLoginModalOpen(true)}
              variant="primary"
              size="lg"
            >
              Sign In
            </Button>
          </div>
        </div>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    )
  }

  // Otherwise redirect to login page
  return <Navigate to="/login" state={{ from: location }} replace />
}

export default ProtectedRoute

