import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../Modal'
import Button from '../Button'
import Input from '../Input'
import type { Coupon } from '../../types/admin'

interface CouponFormModalProps {
  isOpen: boolean
  onClose: () => void
  formData: {
    code: string
    description: string
    discount_type: 'percentage' | 'fixed'
    discount_value: string
    min_purchase_amount: string
    max_discount_amount: string
    is_active: boolean
    valid_from: string
    valid_until: string
    usage_limit: string
  }
  onChange: (data: any) => void
  onSubmit: () => void
  editing?: Coupon | null
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  editing,
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Edit Coupon' : 'Create Coupon'}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="space-y-4"
      >
        <Input
          label="Coupon Code"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          placeholder="NFLAT10"
          required
        />

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Extra 10% off on all products"
        />

        <div>
          <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-2">
            Discount Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="percentage"
                checked={formData.discount_type === 'percentage'}
                onChange={(e) => handleChange('discount_type', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-primary">Percentage</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="fixed"
                checked={formData.discount_type === 'fixed'}
                onChange={(e) => handleChange('discount_type', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-primary">Fixed Amount</span>
            </label>
          </div>
        </div>

        <Input
          label={formData.discount_type === 'percentage' ? 'Discount Percentage' : 'Discount Amount (₹)'}
          type="number"
          value={formData.discount_value}
          onChange={(e) => handleChange('discount_value', e.target.value)}
          placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
          required
          min="0"
          step={formData.discount_type === 'percentage' ? '1' : '0.01'}
        />

        {formData.discount_type === 'percentage' && (
          <Input
            label="Max Discount Amount (₹) - Optional"
            type="number"
            value={formData.max_discount_amount}
            onChange={(e) => handleChange('max_discount_amount', e.target.value)}
            placeholder="500"
            min="0"
            step="0.01"
          />
        )}

        <Input
          label="Minimum Purchase Amount (₹)"
          type="number"
          value={formData.min_purchase_amount}
          onChange={(e) => handleChange('min_purchase_amount', e.target.value)}
          placeholder="0"
          required
          min="0"
          step="0.01"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valid From"
            type="date"
            value={formData.valid_from}
            onChange={(e) => handleChange('valid_from', e.target.value)}
            required
          />
          <Input
            label="Valid Until"
            type="date"
            value={formData.valid_until}
            onChange={(e) => handleChange('valid_until', e.target.value)}
            required
          />
        </div>

        <Input
          label="Usage Limit (Leave empty for unlimited)"
          type="number"
          value={formData.usage_limit}
          onChange={(e) => handleChange('usage_limit', e.target.value)}
          placeholder="100"
          min="1"
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="is_active" className="text-sm text-primary">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {editing ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CouponFormModal

