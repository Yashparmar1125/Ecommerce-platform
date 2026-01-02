import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Modal from '../components/Modal'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, orders, logout } = useAuth()
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    if (searchParams.get('order') === 'success') {
      setShowSuccessModal(true)
      searchParams.delete('order')
    }
  }, [searchParams])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
        <p className="text-sm text-neutral-600 mb-6">Please sign in to view your account</p>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-heading font-medium text-primary">My Account</h1>
        <Button variant="outline" size="sm" onClick={logout}>
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="border border-soft p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-heading font-medium text-background">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-medium text-primary">{user.name}</h2>
                <p className="text-xs text-neutral-600">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-heading font-medium text-primary mb-8 uppercase tracking-wider text-xs">
            My Orders
          </h2>
          
          {orders.length === 0 ? (
            <div className="border border-soft p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-neutral-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm text-neutral-600 mb-2">No orders yet</p>
              <p className="text-xs text-neutral-500 mb-8">Start exploring our collection</p>
              <Button variant="outline" onClick={() => navigate('/products')}>
                Explore Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-soft p-6"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
                        Order #{order.id.slice(-8)}
                      </h3>
                      <p className="text-xs text-neutral-600">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-primary mb-1">
                        Rs. {order.total.toFixed(2)}
                      </p>
                      <span className="text-xs text-neutral-600 uppercase tracking-wider">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {order.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center gap-3 text-xs">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-primary">{item.name}</p>
                          <p className="text-neutral-600 uppercase tracking-wider text-[10px]">
                            {item.size} • {item.color} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-primary font-medium">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-neutral-600">
                        +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'piece' : 'pieces'}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-soft">
                    <p className="text-xs text-neutral-600 mb-1 uppercase tracking-wider">Shipping Address</p>
                    <p className="text-xs text-primary">
                      {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Order Confirmed"
      >
        <div className="text-center py-4">
          <p className="text-sm text-neutral-600 mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowSuccessModal(false)}
            >
              Continue Shopping
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setShowSuccessModal(false)
                navigate('/products')
              }}
            >
              View Orders
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfilePage
