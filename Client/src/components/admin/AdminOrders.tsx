import React from 'react'
import { motion } from 'framer-motion'
import Select from '../Select'
import type { Order } from '../../types/admin'

interface AdminOrdersProps {
  orders: Order[]
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  onStatusUpdate: (orderId: number, status: string) => void
}

const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  statusFilter,
  onStatusFilterChange,
  onStatusUpdate,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-soft text-neutral-600 border-soft'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-medium text-primary">Orders</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage customer orders</p>
        </div>
        <Select
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-48"
        />
      </div>

      {orders.length === 0 ? (
        <div className="border border-soft border-dashed p-12 text-center bg-soft">
          <p className="text-sm text-neutral-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-soft bg-background hover:border-primary transition-colors p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-primary">Order #{order.id}</h3>
                    <span className={`text-xs px-2 py-1 border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-1">{order.user_email}</p>
                  {order.user_name && (
                    <p className="text-xs text-neutral-500">{order.user_name}</p>
                  )}
                  <p className="text-base font-medium text-primary mt-2">
                    Rs. {order.total ? (typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total).toFixed(2)) : '0.00'}
                  </p>
                </div>
                <div className="w-40">
                  <Select
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-soft flex items-center justify-between">
                <p className="text-xs text-neutral-600">
                  {new Date(order.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {order.items && order.items.length > 0 && (
                  <p className="text-xs text-neutral-600">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrders

