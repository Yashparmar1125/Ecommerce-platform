import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

const SessionExpiredModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('Your session has expired. Please login again.')
  const navigate = useNavigate()

  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      setMessage(event.detail?.message || 'Your session has expired. Please login again.')
      setIsOpen(true)
    }

    window.addEventListener('session-expired', handleSessionExpired as EventListener)

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired as EventListener)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    navigate('/login')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              className="bg-background border border-soft p-8 max-w-md w-full relative"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-soft rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-heading font-medium text-primary mb-4">
                  Session Expired
                </h2>
                <p className="text-sm text-neutral-600 mb-8">
                  {message}
                </p>
                <Button
                  fullWidth
                  onClick={handleClose}
                  variant="primary"
                >
                  Go to Login
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default SessionExpiredModal









