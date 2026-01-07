export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  featured?: boolean
  skus?: ProductSKU[]
  details?: ProductDetails
  reviewSummary?: ReviewSummary
}

export interface ProductSKU {
  id: number
  sku: string
  color: string
  size: string
  price: number
  quantity: number
}

export interface ProductDetails {
  material?: string
  care_instructions?: string
  fit?: string
  brand?: string
}

export interface ReviewSummary {
  average_rating: number
  total_ratings: number
  total_reviews: number
  rating_breakdown: Record<number, number>
}

export interface ProductReview {
  id: number
  user_name: string
  user_email: string
  rating: number
  title?: string
  comment: string
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: number
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount: number
  max_discount_amount?: number
  is_active: boolean
  valid_from: string
  valid_until: string
  usage_limit?: number
  used_count: number
  is_valid: boolean
}

export interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  price: number
  size: string
  color: string
  quantity: number
  skuId?: number // Optional SKU ID for order creation
}

export interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

export interface Address {
  id: number | string
  name: string
  street: string
  city: string
  state: string
  zip_code?: string
  zipCode?: string // For backward compatibility
  phone: string
  is_default?: boolean
  isDefault?: boolean // For backward compatibility
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  date: string
  items: CartItem[]
  total: number
  address: Address
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}


