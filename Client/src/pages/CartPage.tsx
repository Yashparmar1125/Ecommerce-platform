import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useCoupon } from '../context/CouponContext'
import { couponService } from '../services/couponService'
import { getErrorMessage } from '../utils/errorHandler'
import type { Coupon } from '../types'
import Button from '../components/Button'

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart()
  const { selectedCoupon, couponDiscount, setSelectedCoupon, setCouponDiscount, clearCoupon } = useCoupon()
  const navigate = useNavigate()
  const [showCoupons, setShowCoupons] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoadingCoupons(true)
      try {
        const couponsData = await couponService.getCoupons()
        setCoupons(couponsData)
      } catch (error) {
        console.error('Failed to fetch coupons:', error)
      } finally {
        setLoadingCoupons(false)
      }
    }
    fetchCoupons()
  }, [])

  const handleApplyCoupon = async (coupon: Coupon) => {
    const subtotal = getTotalPrice()
    setCouponError('')
    setApplyingCoupon(true)
    try {
      const result = await couponService.validateCoupon(coupon.code, subtotal)
      setSelectedCoupon(result.coupon)
      setCouponDiscount(result.discount_amount)
      setCouponCode('')
    } catch (error: any) {
      setCouponError(getErrorMessage(error, 'Failed to apply coupon'))
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleApplyCouponCode = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    
    const subtotal = getTotalPrice()
    setCouponError('')
    setApplyingCoupon(true)
    try {
      const result = await couponService.validateCoupon(couponCode.trim(), subtotal)
      setSelectedCoupon(result.coupon)
      setCouponDiscount(result.discount_amount)
      setCouponCode('')
    } catch (error: any) {
      setCouponError(getErrorMessage(error, 'Invalid or expired coupon code'))
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null)
    setCouponDiscount(0)
    setCouponCode('')
    setCouponError('')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
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

  // Calculate totals with mock original prices for discount display
  const calculateItemTotals = () => {
    let bagTotal = 0
    let discountTotal = 0
    let finalTotal = 0

    items.forEach(item => {
      // Mock: assume 40% discount on each item for display purposes
      const mockOriginalPrice = item.price / 0.6
      const itemOriginalTotal = mockOriginalPrice * item.quantity
      const itemDiscount = itemOriginalTotal - (item.price * item.quantity)
      
      bagTotal += itemOriginalTotal
      discountTotal += itemDiscount
      finalTotal += item.price * item.quantity
    })

    return { bagTotal, discountTotal, finalTotal }
  }

  const { bagTotal, discountTotal, finalTotal } = calculateItemTotals()
  const shipping = finalTotal >= 50 ? 0 : 5.99
  const total = finalTotal + shipping - couponDiscount

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-medium text-primary">Bag</h1>
          <p className="text-sm text-neutral-600 mt-1">{items.length} {items.length === 1 ? 'Item' : 'Items'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, index) => {
            // Mock original price for discount display
            const mockOriginalPrice = item.price / 0.6
            const itemOriginalTotal = mockOriginalPrice * item.quantity
            const itemDiscount = itemOriginalTotal - (item.price * item.quantity)
            const discountPercent = Math.round((itemDiscount / itemOriginalTotal) * 100)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 pb-6 border-b border-soft"
              >
                <Link to={`/products/${item.productId}`} className="flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-sm"
                    style={{
                      objectPosition: 'center top',
                      objectFit: 'cover'
                    }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.productId}`}>
                    <h3 className="font-medium text-primary mb-2 hover:opacity-70 transition-opacity text-sm md:text-base line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-neutral-600">
                    <span className="uppercase tracking-wider">Size: {item.size}</span>
                    <span>•</span>
                    <span className="uppercase tracking-wider">Qty:</span>
                    <div className="flex items-center gap-2 border border-soft">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-soft transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium text-primary w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-soft transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Price and Discount */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold text-primary">₹{item.price.toFixed(2)}</span>
                      <span className="text-sm text-neutral-500 line-through">₹{mockOriginalPrice.toFixed(2)}</span>
                      <span className="text-xs font-semibold text-green-600">{discountPercent}% OFF</span>
                    </div>
                    <p className="text-xs text-neutral-600">7 Day Return</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs text-neutral-400 hover:text-primary transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Order Summary - Desktop */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 border border-soft p-6 bg-background">
            {/* You Pay Section */}
            <div className="mb-6">
              <p className="text-sm text-neutral-600 mb-1">You Pay</p>
              <p className="text-2xl font-semibold text-primary">₹{finalTotal.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-600 font-semibold">{Math.round((discountTotal / bagTotal) * 100)}% off</span>
                <span className="text-xs text-neutral-500 line-through">₹{bagTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupons Section */}
            <div className="mb-6 pb-6 border-b border-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-primary">Coupons</span>
                </div>
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="text-xs text-primary hover:underline"
                >
                  {showCoupons ? 'Hide' : 'View All'}
                </button>
              </div>

              {/* Coupon Code Input */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase())
                      setCouponError('')
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border-2 border-soft focus:border-primary outline-none text-sm"
                    disabled={!!selectedCoupon || applyingCoupon}
                  />
                  {selectedCoupon ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="px-4"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCouponCode}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
                {couponError && (
                  <p className="text-xs text-red-600 mt-1">{couponError}</p>
                )}
                {selectedCoupon && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-700">
                      ✓ Coupon <span className="font-semibold">{selectedCoupon.code}</span> applied!
                      {selectedCoupon.discount_type === 'percentage'
                        ? ` Save ${selectedCoupon.discount_value}%`
                        : ` Save ₹${selectedCoupon.discount_value}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Available Coupons List */}
              {showCoupons && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  {loadingCoupons ? (
                    <div className="text-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : coupons.length > 0 ? (
                    coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`flex items-center justify-between p-2 border ${
                          selectedCoupon?.id === coupon.id
                            ? 'bg-green-50 border-green-200'
                            : 'bg-soft border-soft'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-medium text-primary">
                            {coupon.discount_type === 'percentage'
                              ? `Extra ${coupon.discount_value}% off`
                              : `Extra ₹${coupon.discount_value} off`}
                          </p>
                          <p className="text-[10px] text-neutral-600">
                            Code: <span className="font-semibold">{coupon.code}</span>
                            {coupon.min_purchase_amount > 0 && (
                              <span className="ml-1">(Min. ₹{coupon.min_purchase_amount})</span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleApplyCoupon(coupon)}
                          className="text-xs text-primary hover:underline font-medium"
                          disabled={selectedCoupon?.id === coupon.id}
                        >
                          {selectedCoupon?.id === coupon.id ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-600 text-center py-2">No coupons available</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Price Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-primary mb-4">Price Summary</h3>
              <p className="text-[10px] text-neutral-600 mb-4">Prices are inclusive of all taxes</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bag Total ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="text-primary font-medium">₹{bagTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount on MRP</span>
                  <span className="font-medium">-₹{discountTotal.toFixed(2)}</span>
                </div>
                {selectedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount ({selectedCoupon.code})</span>
                    <span className="font-medium">-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-soft">
                  <span className="text-neutral-600">Sub Total</span>
                  <span className="text-primary font-medium">₹{finalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Convenience Charges</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-primary">
                  <span className="font-semibold text-primary">You Pay</span>
                  <span className="text-lg font-semibold text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-700 font-medium text-center">
                  You saved ₹{(discountTotal + couponDiscount).toFixed(2)} on this purchase
                </p>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
              variant="primary"
              className="text-base font-medium"
            >
              Proceed to Buy
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-soft p-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold text-primary">₹{total.toFixed(2)}</p>
            <button className="text-xs text-primary hover:underline">View Details</button>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/checkout')}
            variant="primary"
            className="ml-4 max-w-[200px] text-base font-medium"
          >
            Proceed to Buy
          </Button>
        </div>
      </div>
      <div className="lg:hidden h-24"></div> {/* Spacer for fixed bottom bar */}
    </div>
  )
}

export default CartPage
