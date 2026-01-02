import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '../types'
import { productService } from '../services/productService'

interface ProductsContextType {
  products: Product[]
  categories: string[]
  loading: boolean
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getAllProducts()
        setProducts(data)
        const uniqueCategories = Array.from(new Set(data.map(p => p.category)))
        setCategories(uniqueCategories)
      } catch (error) {
        console.error('Failed to load products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const getProductById = (id: string) => {
    return products.find(p => p.id === id)
  }

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category)
  }

  return (
    <ProductsContext.Provider value={{ products, categories, loading, getProductById, getProductsByCategory }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider')
  }
  return context
}

