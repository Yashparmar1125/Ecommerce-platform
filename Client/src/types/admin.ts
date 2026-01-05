export interface DashboardStats {
  total_users: number
  total_products: number
  total_orders: number
  total_revenue: number
  pending_orders: number
  recent_orders: any[]
}

export interface Product {
  id: number
  name: string
  summary: string
  description: string
  category: number
  category_name: string
  cover: string
  original_price?: number
  featured: boolean
  in_stock: boolean
  images: { id: number; image_url: string; order: number }[]
  skus?: any[]
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface Order {
  id: number
  user_email: string
  user_name: string
  total: number
  status: string
  created_at: string
  items: any[]
  address_details: any
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  is_active: boolean
  order_count: number
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

export type TabType = 'dashboard' | 'products' | 'orders' | 'users' | 'categories' | 'coupons'

