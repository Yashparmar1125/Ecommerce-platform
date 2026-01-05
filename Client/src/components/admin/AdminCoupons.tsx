import React from 'react'
import { motion } from 'framer-motion'
import type { Coupon } from '../../types/admin'
import Button from '../Button'

interface AdminCouponsProps {
  coupons: Coupon[]
  onCreate: () => void
  onEdit: (coupon: Coupon) => void
  onDelete: (id: number) => void
}

const AdminCoupons: React.FC<AdminCouponsProps> = ({ coupons, onCreate, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-medium text-primary">Coupons</h2>
        <Button onClick={onCreate} size="sm">
          + Create Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="border border-soft p-12 text-center">
          <p className="text-neutral-600 mb-4">No coupons found</p>
          <Button onClick={onCreate} variant="outline" size="sm">
            Create First Coupon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {coupons.map((coupon, index) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border p-6 ${
                !coupon.is_active || isExpired(coupon.valid_until)
                  ? 'border-red-200 bg-red-50'
                  : 'border-soft'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-primary">{coupon.code}</h3>
                    {!coupon.is_active && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Inactive</span>
                    )}
                    {isExpired(coupon.valid_until) && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expired</span>
                    )}
                    {coupon.is_valid && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                    )}
                  </div>
                  
                  {coupon.description && (
                    <p className="text-sm text-neutral-600 mb-3">{coupon.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-600 text-xs uppercase tracking-wider mb-1">Discount</p>
                      <p className="font-medium text-primary">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}% OFF`
                          : `₹${coupon.discount_value} OFF`}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-xs uppercase tracking-wider mb-1">Min Purchase</p>
                      <p className="font-medium text-primary">₹{coupon.min_purchase_amount}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-xs uppercase tracking-wider mb-1">Valid Until</p>
                      <p className="font-medium text-primary">{formatDate(coupon.valid_until)}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 text-xs uppercase tracking-wider mb-1">Usage</p>
                      <p className="font-medium text-primary">
                        {coupon.used_count} / {coupon.usage_limit || '∞'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(coupon)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) {
                        onDelete(coupon.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminCoupons

