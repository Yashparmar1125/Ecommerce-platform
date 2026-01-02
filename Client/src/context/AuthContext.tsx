import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User, Order } from '../types'

interface AuthContextType {
  user: User | null
  orders: Order[]
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  logout: () => void
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedOrders = localStorage.getItem('orders')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would call an API
    try {
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email,
        phone: '+1234567890',
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
      return true
    } catch (error) {
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock registration
    try {
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone: '',
      }
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
      return true
    } catch (error) {
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    // Mock Google login - in production, this would use Google OAuth
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const googleUser: User = {
        id: Date.now().toString(),
        name: 'Google User',
        email: 'user@gmail.com',
        phone: '',
      }
      setUser(googleUser)
      localStorage.setItem('user', JSON.stringify(googleUser))
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const addOrder = (order: Omit<Order, 'id' | 'date'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    }
    setOrders(prev => {
      const updated = [newOrder, ...prev]
      localStorage.setItem('orders', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, orders, login, register, loginWithGoogle, logout, addOrder }}>
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
