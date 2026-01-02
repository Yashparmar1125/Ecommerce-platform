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
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
}

export interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  phone: string
  isDefault?: boolean
}

export interface Order {
  id: string
  date: string
  items: CartItem[]
  total: number
  address: Address
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}


