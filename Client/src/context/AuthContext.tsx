import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { User, Order } from '../types'

import { emailLogin, getUser, registerUser, logoutUser } from '../api/axios.api'

interface AuthContextType {
  user: User | null
  orders: Order[]
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  logout: () => Promise<void>
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
  
    try {
      if (refreshToken) {
        await logoutUser(refreshToken)
      }
    } catch (error) {
      console.error('Logout API failed:', error)
      // still continue cleanup
    } finally {
      setUser(null)
      setOrders([])
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('orders')
    }
  }, [])
  

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedOrders = localStorage.getItem('orders')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }

    // Listen for session expired events
    const handleSessionExpired = () => {
      logout()
    }

    window.addEventListener('session-expired', handleSessionExpired as EventListener)

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired as EventListener)
    }
  }, [logout])

  // Memoize functions with useCallback to prevent unnecessary re-renders
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await emailLogin(email, password)
      if (response.status === 200) {
        localStorage.setItem('token', response.data.data.tokens.access)
        localStorage.setItem('refreshToken', response.data.data.tokens.refresh)
        const user = await getUser()
        if (user.status === 200) {
          setUser(user.data.data)
          localStorage.setItem('user', JSON.stringify(user.data.data))
        } else {
          return false
        }
        return true
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const nameParts = name.split(' ')
      const first_name = nameParts[0] || ''
      const last_name = nameParts.slice(1).join(' ') || ''
      const response = await registerUser(email, password, first_name, last_name)
      if (response.status === 201) {
        setUser(response.data.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
        localStorage.setItem('token', response.data.data.tokens.access)
        localStorage.setItem('refreshToken', response.data.data.tokens.refresh)
        return true
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }, [])

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const googleUser: User = {
        id: Date.now().toString(),
        username: 'Google User',
        first_name: '',
        last_name: '',
        email: 'user@gmail.com',
        phone_number: '',
      }
      setUser(googleUser)
      localStorage.setItem('user', JSON.stringify(googleUser))
      return true
    } catch (error) {
      return false
    }
  }, [])

  const addOrder = useCallback((order: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...order,
      id: `${Date.now()}-${Math.random()}`,
      date: new Date().toISOString(),
    }
    setOrders(prev => {
      const updated = [newOrder, ...prev]
      localStorage.setItem('orders', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      orders,
      login,
      register,
      loginWithGoogle,
      logout,
      addOrder,
    }),
    [user, orders, login, register, loginWithGoogle, logout, addOrder]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
