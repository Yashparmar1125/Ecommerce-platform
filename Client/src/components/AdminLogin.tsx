import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../api/axios.api'
import Button from './Button'
import Input from './Input'

interface AdminLoginProps {
  onLoginSuccess: () => void
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use dedicated admin login endpoint
      const response = await adminApi.login(formData.username, formData.password)
      
      if (response.status === 200) {
        // Store admin tokens separately
        localStorage.setItem('adminToken', response.data.data.tokens.access)
        localStorage.setItem('adminRefreshToken', response.data.data.tokens.refresh)
        localStorage.setItem('adminAuthenticated', 'true')
        
        // Set the token for API calls
        localStorage.setItem('token', response.data.data.tokens.access)
        localStorage.setItem('refreshToken', response.data.data.tokens.refresh)
        
        onLoginSuccess()
      } else {
        setError('Invalid username or password')
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Invalid username or password'
        setError(errorMessage)
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-soft border border-soft p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-medium text-primary mb-2">
              Admin Login
            </h1>
            <p className="text-sm text-neutral-600">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin

