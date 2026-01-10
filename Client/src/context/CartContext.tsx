import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'cart_items'

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (storedCart) {
      return JSON.parse(storedCart)
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error)
  }
  return []
}

// Save cart to localStorage with debouncing
let saveTimeout: ReturnType<typeof setTimeout> | null = null
const saveCartToStorage = (items: CartItem[]) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, 300) // Debounce saves by 300ms
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage())

  // Save cart to localStorage whenever items change (debounced)
  useEffect(() => {
    saveCartToStorage(items)
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [items])

  // Memoize functions with useCallback to prevent unnecessary re-renders
  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      const existingItem = prev.find(
        i => i.productId === item.productId && 
        i.size === item.size && 
        i.color === item.color
      )
      
      if (existingItem) {
        return prev.map(i =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      
      return [...prev, { ...item, id: `${Date.now()}-${Math.random()}` }]
    })
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  // Memoize computed values
  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }, [items])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getItemCount,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getItemCount]
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

