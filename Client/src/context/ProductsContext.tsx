import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '../types'
import { productService } from '../services/productService'

interface Category {
  id: number
  name: string
  description: string
  product_count: number
}

interface ProductsContextType {
  products: Product[]
  categories: string[]
  categoryObjects: Category[]
  loading: boolean
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [categoryObjects, setCategoryObjects] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      try {
        // Load products and categories in parallel for faster loading
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          productService.getCategories()
        ])
        
        // Only update state if component is still mounted
        if (isMounted) {
          setProducts(productsData)
          setCategoryObjects(categoriesData)
          const uniqueCategories = Array.from(new Set(productsData.map(p => p.category)))
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadData()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [])

  // Memoize functions to prevent unnecessary re-renders
  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id)
  }, [products])

  const getProductsByCategory = useCallback((category: string) => {
    return products.filter(p => p.category === category)
  }, [products])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      products,
      categories,
      categoryObjects,
      loading,
      getProductById,
      getProductsByCategory,
    }),
    [products, categories, categoryObjects, loading, getProductById, getProductsByCategory]
  )

  return (
    <ProductsContext.Provider value={contextValue}>
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

