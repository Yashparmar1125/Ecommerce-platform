import React from 'react'
import { motion } from 'framer-motion'
import type { DashboardStats } from '../../types/admin'

interface AdminDashboardProps {
  stats: DashboardStats
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Users',
      value: stats.total_users,
      icon: '👥',
    },
    {
      label: 'Total Products',
      value: stats.total_products,
      icon: '📦',
    },
    {
      label: 'Total Orders',
      value: stats.total_orders,
      icon: '🛒',
    },
    {
      label: 'Total Revenue',
      value: `Rs. ${typeof stats.total_revenue === 'number' ? stats.total_revenue.toFixed(2) : parseFloat(stats.total_revenue || 0).toFixed(2)}`,
      icon: '💰',
    },
    {
      label: 'Pending Orders',
      value: stats.pending_orders,
      icon: '⏳',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-soft border border-soft p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-xs text-neutral-600 uppercase tracking-wider mb-2">{card.label}</p>
            <p className="text-2xl font-heading font-medium text-primary">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      {stats.recent_orders && stats.recent_orders.length > 0 && (
        <div className="bg-soft border border-soft p-6">
          <h3 className="text-lg font-heading font-medium text-primary mb-6 uppercase tracking-wider text-sm">
            Recent Orders
          </h3>
          <div className="space-y-3">
            {stats.recent_orders.slice(0, 5).map((order: any, index: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-background border border-soft hover:border-primary transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-primary">Order #{order.id}</p>
                  <p className="text-xs text-neutral-600">{order.user_email || order.user_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">Rs. {order.total?.toFixed(2) || '0.00'}</p>
                  <span className={`text-xs px-2 py-1 ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

