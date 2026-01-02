import React, { createContext, useContext, useState, useEffect } from 'react'
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

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error)
  }
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage())

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items)
  }, [items])

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setItems(prev => {
      const existingItem = prev.find(
        i => i.productId === item.productId && 
        i.size === item.size && 
        i.color === item.color
      )
      
      if (existingItem) {
        const updated = prev.map(i =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
        return updated
      }
      
      return [...prev, { ...item, id: Date.now().toString() }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getItemCount,
    }}>
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

