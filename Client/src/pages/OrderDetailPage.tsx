import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { orderApi } from '../api/axios.api'
import type { Order } from '../types'
import Button from '../components/Button'
import { fadeInUp } from '../utils/animations'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface TrackingStep {
  status: OrderStatus
  label: string
  description: string
  icon: string
}

const trackingSteps: TrackingStep[] = [
  {
    status: 'pending',
    label: 'Order Placed',
    description: 'Your order has been received',
    icon: '📦',
  },
  {
    status: 'processing',
    label: 'Processing',
    description: 'We are preparing your order',
    icon: '⚙️',
  },
  {
    status: 'shipped',
    label: 'Shipped',
    description: 'Your order is on the way',
    icon: '🚚',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    description: 'Your order has been delivered',
    icon: '✅',
  },
]

const getStatusIndex = (status: OrderStatus): number => {
  const index = trackingSteps.findIndex(step => step.status === status)
  return index === -1 ? 0 : index
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await orderApi.getOrder(id!)
      const orderData = response.data.data

      // Transform the order data to match our Order interface
      const transformedOrder: Order = {
        id: orderData.id.toString(),
        date: orderData.created_at,
        items: orderData.items.map((item: any) => ({
          id: item.id.toString(),
          productId: item.product.toString(),
          name: item.product_name || 'Product',
          image: item.product_image || '',
          price: parseFloat(item.price),
          size: item.sku?.size || '',
          color: item.sku?.color || '',
          quantity: item.quantity,
        })),
        total: parseFloat(orderData.total),
        address: orderData.address_details ? {
          id: orderData.address_details.id.toString(),
          name: orderData.address_details.name,
          street: orderData.address_details.street,
          city: orderData.address_details.city,
          state: orderData.address_details.state,
          zipCode: orderData.address_details.zip_code,
          phone: orderData.address_details.phone,
        } : {
          id: '',
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
        },
        status: orderData.status,
      }
      setOrder(transformedOrder)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-sm text-neutral-600 mb-6">{error || 'Order not found'}</p>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-neutral-600 hover:text-primary mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
          <h1 className="text-3xl font-heading font-medium text-primary">
            Order Details
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Order #{order.id} • Placed on {new Date(order.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-600 uppercase tracking-wider mb-2">Status</p>
          <span className={`inline-block px-4 py-2 text-xs font-medium uppercase tracking-wider ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Tracking */}
          <motion.section
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="border border-soft p-8"
          >
            <h2 className="text-lg font-heading font-medium text-primary mb-8 uppercase tracking-wider text-xs">
              Order Tracking
            </h2>
            
            {isCancelled ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">❌</div>
                <p className="text-sm font-medium text-primary mb-2">Order Cancelled</p>
                <p className="text-xs text-neutral-600">This order has been cancelled</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-soft">
                  <motion.div
                    className="absolute top-0 left-0 w-full bg-primary"
                    initial={{ height: '0%' }}
                    animate={{ height: `${(currentStatusIndex / (trackingSteps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: `${(currentStatusIndex / (trackingSteps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="space-y-8">
                  {trackingSteps.map((step, index) => {
                    const isActive = index <= currentStatusIndex
                    const isCurrent = index === currentStatusIndex

                    return (
                      <motion.div
                        key={step.status}
                        className="relative flex items-start gap-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* Icon */}
                        <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                          isActive
                            ? 'bg-primary text-background'
                            : 'bg-soft text-neutral-400'
                        }`}>
                          {step.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <h3 className={`text-sm font-medium mb-1 ${
                            isActive ? 'text-primary' : 'text-neutral-400'
                          }`}>
                            {step.label}
                          </h3>
                          <p className="text-xs text-neutral-600 mb-2">
                            {step.description}
                          </p>
                          {isCurrent && (
                            <span className="inline-block text-[10px] text-primary uppercase tracking-wider border border-primary px-2 py-0.5">
                              Current Status
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.section>

          {/* Order Items */}
          <motion.section
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="border border-soft p-8"
          >
            <h2 className="text-lg font-heading font-medium text-primary mb-8 uppercase tracking-wider text-xs">
              Order Items ({order.items.length})
            </h2>
            
            <div className="space-y-6">
              {order.items.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex gap-4 pb-6 border-b border-soft last:border-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover"
                    style={{
                      objectPosition: 'center top',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/assets/images/placeholder.png'
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-primary mb-2">{item.name}</h3>
                    <div className="flex flex-wrap gap-4 text-xs text-neutral-600 mb-3">
                      {item.size && (
                        <span className="uppercase tracking-wider">Size: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="uppercase tracking-wider">Color: {item.color}</span>
                      )}
                      <span className="uppercase tracking-wider">Quantity: {item.quantity}</span>
                    </div>
                    <p className="text-sm font-medium text-primary">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Shipping Address */}
          {order.address && order.address.street && (
            <motion.section
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="border border-soft p-8"
            >
              <h2 className="text-lg font-heading font-medium text-primary mb-6 uppercase tracking-wider text-xs">
                Shipping Address
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-primary">{order.address.name}</p>
                <p className="text-neutral-600">{order.address.street}</p>
                <p className="text-neutral-600">
                  {order.address.city}, {order.address.state} {order.address.zipCode}
                </p>
                <p className="text-neutral-600">Phone: {order.address.phone}</p>
              </div>
            </motion.section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="border border-soft p-8 sticky top-24"
          >
            <h2 className="text-lg font-heading font-medium text-primary mb-6 uppercase tracking-wider text-xs">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-primary font-medium">Rs. {order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-primary font-medium">Complimentary</span>
              </div>
              <div className="pt-4 border-t border-soft">
                <div className="flex justify-between">
                  <span className="font-medium text-primary">Total</span>
                  <span className="text-lg font-medium text-primary">Rs. {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-soft space-y-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/profile')}
              >
                Back to Orders
              </Button>
            </div>

            {/* Order Info */}
            <div className="pt-6 border-t border-soft mt-6">
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-neutral-600 mb-1">Order Number</p>
                  <p className="text-primary font-medium">#{order.id}</p>
                </div>
                <div>
                  <p className="text-neutral-600 mb-1">Order Date</p>
                  <p className="text-primary">
                    {new Date(order.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600 mb-1">Payment Method</p>
                  <p className="text-primary">Cash on Delivery</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage



