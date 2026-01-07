import type { Product } from '../types'
import { api } from '../api/axios.api'

interface BackendSKU {
  id: number
  sku: string
  color: string
  size: string
  price: number | string
  quantity: number
}

interface BackendProduct {
  id: number
  name: string
  summary: string
  description: string
  category: string
  cover: string
  original_price: number | null
  featured: boolean
  in_stock: boolean
  images: string[]
  sizes: string[]
  colors: string[]
  price: number
  created_at: string
}

interface ProductListResponse {
  count: number
  data: BackendProduct[]
}

interface ProductSkuResponse {
  count: number
  data: BackendSKU[]
}

interface Category {
  id: number
  name: string
  description: string
  product_count: number
}

interface CategoryListResponse {
  count: number
  data: Category[]
}

const transformProduct = (backendProduct: BackendProduct): Product => {
  // Ensure originalPrice is a number or undefined
  let originalPrice: number | undefined = undefined
  if (backendProduct.original_price !== null && backendProduct.original_price !== undefined) {
    const price = typeof backendProduct.original_price === 'string' 
      ? parseFloat(backendProduct.original_price) 
      : backendProduct.original_price
    if (!isNaN(price) && price > 0) {
      originalPrice = price
    }
  }

  return {
    id: backendProduct.id.toString(),
    name: backendProduct.name,
    description: backendProduct.description,
    price: typeof backendProduct.price === 'number' ? backendProduct.price : parseFloat(backendProduct.price) || 0,
    originalPrice,
    images: backendProduct.images.length > 0 ? backendProduct.images : (backendProduct.cover ? [backendProduct.cover] : []),
    category: backendProduct.category,
    sizes: backendProduct.sizes,
    colors: backendProduct.colors,
    inStock: backendProduct.in_stock,
    featured: backendProduct.featured,
  }
}

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<ProductListResponse>('/products')
      return response.data.data.map(transformProduct)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return []
    }
  },

  getProductSkus: async (productId: string): Promise<BackendSKU[]> => {
    const response = await api.get<ProductSkuResponse>(`/products/${productId}/skus/`)
    return response.data.data
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      const response = await api.get<{ 
        data: { 
          product: BackendProduct & { details?: any; review_summary?: any }; 
          skus: BackendSKU[];
          recent_reviews?: any[];
        } 
      }>(`/products/${id}`)
      const productData = response.data.data.product
      const transformed = transformProduct(productData)

      // Map SKUs with quantity and variant info
      const skus = (response.data.data.skus || []).map((sku) => ({
        id: sku.id,
        sku: sku.sku,
        color: sku.color,
        size: sku.size,
        price: typeof sku.price === 'number' ? sku.price : parseFloat(sku.price) || 0,
        quantity: sku.quantity ?? 0,
      }))
      if (skus.length > 0) {
        transformed.skus = skus
        // If every SKU is zero qty, mark as out of stock
        const hasStock = skus.some((s) => s.quantity > 0)
        if (!hasStock) {
          transformed.inStock = false
        }
      }
      
      // Add details and review summary if available
      if (productData.details) {
        transformed.details = productData.details
      }
      if (productData.review_summary) {
        transformed.reviewSummary = productData.review_summary
      }
      
      return transformed
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return undefined
    }
  },

  getFeaturedProducts: async (limit?: number): Promise<Product[]> => {
    try {
      const response = await api.get<ProductListResponse>('/products', {
        params: { featured: 'true' }
      })
      const products = response.data.data.map(transformProduct)
      return limit ? products.slice(0, limit) : products
    } catch (error) {
      console.error('Failed to fetch featured products:', error)
      return []
    }
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const response = await api.get<ProductListResponse>('/products', {
        params: { category }
      })
      return response.data.data.map(transformProduct)
    } catch (error) {
      console.error('Failed to fetch products by category:', error)
      return []
    }
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const response = await api.get<ProductListResponse>('/products/search', {
        params: { q: query }
      })
      return response.data.data.map(transformProduct)
    } catch (error) {
      console.error('Failed to search products:', error)
      return []
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<CategoryListResponse>('/products/categories')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      return []
    }
  },

  // Reviews
  getProductReviews: async (productId: string) => {
    try {
      const response = await api.get<{ count: number; data: any[] }>(`/products/${productId}/reviews/`)
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      return []
    }
  },

  createReview: async (productId: string, data: { rating: number; title?: string; comment: string }) => {
    try {
      const response = await api.post(`/products/${productId}/reviews/create/`, data)
      return response.data.data
    } catch (error) {
      console.error('Failed to create review:', error)
      throw error
    }
  },

  markReviewHelpful: async (reviewId: number) => {
    try {
      const response = await api.post(`/products/reviews/${reviewId}/helpful/`)
      return response.data.data
    } catch (error) {
      console.error('Failed to mark review helpful:', error)
      throw error
    }
  },
}
