import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { ProductsProvider } from './ProductsContext'
import { CartProvider } from './CartContext'

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}

export default AppProviders
