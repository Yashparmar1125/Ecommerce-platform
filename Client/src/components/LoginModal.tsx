import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import Input from './Input'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

type ModalState = 'login' | 'register' | 'otp'

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { login, register, loginWithGoogle } = useAuth()
  const [modalState, setModalState] = useState<ModalState>('login')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError('')
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        onClose()
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
        setModalState('login')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const success = await register(formData.name, formData.email, formData.password)
      if (success) {
        setRegisteredEmail(formData.email)
        setModalState('otp')
        // In production, you would send OTP to email here
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP')
      return
    }

    // Mock OTP verification - in production, verify with backend
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock: Accept any 6-digit OTP for demo
      if (otpValue.length === 6) {
        onClose()
        setOtp(['', '', '', '', '', ''])
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
        setModalState('login')
        navigate('/profile')
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('OTP verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsGoogleLoading(true)

    try {
      const success = await loginWithGoogle()
      if (success) {
        onClose()
        // Google login skips OTP
        navigate('/profile')
      } else {
        setError('Google login failed. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setModalState('login')
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    setOtp(['', '', '', '', '', ''])
    setError('')
  }

  const handleSwitchToRegister = () => {
    setModalState('register')
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    setError('')
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Focus first OTP input when OTP screen opens
      if (modalState === 'otp') {
        setTimeout(() => {
          document.getElementById('otp-0')?.focus()
        }, 100)
      }
    } else {
      document.body.style.overflow = 'unset'
      // Reset to login state when modal closes
      setModalState('login')
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      setOtp(['', '', '', '', '', ''])
      setError('')
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, modalState])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative bg-background border border-soft w-full max-w-md overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-soft p-8">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-neutral-500 hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={modalState}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-heading font-medium text-primary mb-2">
                  {modalState === 'login' && 'Sign In'}
                  {modalState === 'register' && 'Create Account'}
                  {modalState === 'otp' && 'Verify Email'}
                </h2>
                <p className="text-sm text-neutral-600">
                  {modalState === 'login' && 'Access your account'}
                  {modalState === 'register' && 'Join NŌIRÉ'}
                  {modalState === 'otp' && `Enter the OTP sent to ${registeredEmail}`}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* Login Form */}
              {modalState === 'login' && (
                <motion.form
                  key="login"
                  onSubmit={handleLogin}
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {error && (
                    <motion.div
                      className="bg-soft border border-primary/20 text-primary px-4 py-3 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Google Login Button */}
                  <Button
                    type="button"
                    fullWidth
                    size="lg"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLoading}
                    className="flex items-center justify-center gap-3"
                  >
                    {isGoogleLoading ? (
                      'Signing in...'
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-soft"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-neutral-600">Or</span>
                    </div>
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                  />

                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="border-soft" />
                      <span className="text-neutral-600">Remember me</span>
                    </label>
                    <a href="#" className="text-primary hover:opacity-70 transition-opacity">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading || isGoogleLoading}
                    variant="primary"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </motion.form>
              )}

              {/* Register Form */}
              {modalState === 'register' && (
                <motion.form
                  key="register"
                  onSubmit={handleRegister}
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {error && (
                    <motion.div
                      className="bg-soft border border-primary/20 text-primary px-4 py-3 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Google Register Button */}
                  <Button
                    type="button"
                    fullWidth
                    size="lg"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading || isLoading}
                    className="flex items-center justify-center gap-3"
                  >
                    {isGoogleLoading ? (
                      'Signing in...'
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-soft"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-neutral-600">Or</span>
                    </div>
                  </div>

                  <Input
                    label="Full Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                  />

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                  />

                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    placeholder="Create a password"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading || isGoogleLoading}
                    variant="primary"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </motion.form>
              )}

              {/* OTP Verification */}
              {modalState === 'otp' && (
                <motion.form
                  key="otp"
                  onSubmit={handleOtpVerify}
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {error && (
                    <motion.div
                      className="bg-soft border border-primary/20 text-primary px-4 py-3 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <p className="text-sm text-neutral-600 text-center">
                      We've sent a 6-digit OTP to your email
                    </p>
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-lg font-medium border border-soft focus:border-primary focus:outline-none transition-colors"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-600 text-center">
                      Didn't receive OTP?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          // Resend OTP logic here
                          setOtp(['', '', '', '', '', ''])
                          setError('')
                        }}
                        className="text-primary hover:opacity-70 transition-opacity"
                      >
                        Resend
                      </button>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={isLoading || otp.join('').length !== 6}
                    variant="primary"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-soft">
              <AnimatePresence mode="wait">
                {modalState === 'login' && (
                  <motion.p
                    key="login-footer"
                    className="text-center text-sm text-neutral-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Don't have an account?{' '}
                    <button
                      onClick={handleSwitchToRegister}
                      className="text-primary font-medium hover:opacity-70 transition-opacity"
                    >
                      Create account
                    </button>
                  </motion.p>
                )}
                {(modalState === 'register' || modalState === 'otp') && (
                  <motion.p
                    key="back-footer"
                    className="text-center text-sm text-neutral-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Already have an account?{' '}
                    <button
                      onClick={handleBackToLogin}
                      className="text-primary font-medium hover:opacity-70 transition-opacity"
                    >
                      Sign in
                    </button>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoginModal
