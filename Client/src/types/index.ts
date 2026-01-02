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


