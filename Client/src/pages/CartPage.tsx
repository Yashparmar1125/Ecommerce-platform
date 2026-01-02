import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import Button from '../components/Button'

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <svg
              className="w-16 h-16 mx-auto text-neutral-300 mb-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-2xl font-heading font-medium text-primary mb-4">Your bag is empty</h2>
            <p className="text-sm text-neutral-600 mb-8">Continue exploring our collection</p>
            <Link to="/products">
              <Button variant="outline">Explore Collection</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-heading font-medium text-primary mb-12">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-6 pb-6 border-b border-soft"
            >
              <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover"
                />
              </Link>
              <div className="flex-1">
                <Link to={`/products/${item.productId}`}>
                  <h3 className="font-medium text-primary mb-2 hover:opacity-70 transition-opacity">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-xs text-neutral-600 mb-4 uppercase tracking-wider">
                  {item.size} • {item.color}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-soft flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-primary w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-soft flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-medium text-primary">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-400 hover:text-primary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border border-soft p-8">
            <h2 className="text-lg font-heading font-medium text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-primary font-medium">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-primary font-medium">
                  {shipping === 0 ? 'Complimentary' : `Rs. ${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-soft pt-4 flex justify-between">
                <span className="font-medium text-primary">Total</span>
                <span className="text-lg font-medium text-primary">
                  Rs. {total.toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
              variant="primary"
            >
              Secure Checkout
            </Button>
            <Link to="/products" className="block mt-4 text-center text-xs text-neutral-600 hover:text-primary transition-colors uppercase tracking-wider">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
