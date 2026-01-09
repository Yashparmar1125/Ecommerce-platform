import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Coupon } from '../types'

interface CouponContextType {
  selectedCoupon: Coupon | null
  couponDiscount: number
  setSelectedCoupon: (coupon: Coupon | null) => void
  setCouponDiscount: (discount: number) => void
  clearCoupon: () => void
}

const CouponContext = createContext<CouponContextType | undefined>(undefined)

const COUPON_STORAGE_KEY = 'selected_coupon'
const COUPON_DISCOUNT_STORAGE_KEY = 'coupon_discount'

// Helper to load coupon from local storage
const loadCouponFromStorage = (): Coupon | null => {
  try {
    const serializedCoupon = localStorage.getItem(COUPON_STORAGE_KEY)
    return serializedCoupon ? JSON.parse(serializedCoupon) : null
  } catch (error) {
    console.error('Failed to load coupon from local storage:', error)
    return null
  }
}

// Helper to save coupon to local storage
const saveCouponToStorage = (coupon: Coupon | null) => {
  try {
    if (coupon) {
      const serializedCoupon = JSON.stringify(coupon)
      localStorage.setItem(COUPON_STORAGE_KEY, serializedCoupon)
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY)
    }
  } catch (error) {
    console.error('Failed to save coupon to local storage:', error)
  }
}

// Helper to save discount to local storage
const saveDiscountToStorage = (discount: number) => {
  try {
    if (discount > 0) {
      localStorage.setItem(COUPON_DISCOUNT_STORAGE_KEY, discount.toString())
    } else {
      localStorage.removeItem(COUPON_DISCOUNT_STORAGE_KEY)
    }
  } catch (error) {
    console.error('Failed to save discount to local storage:', error)
  }
}

export const CouponProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCoupon, setSelectedCouponState] = useState<Coupon | null>(() => loadCouponFromStorage())
  const [couponDiscount, setCouponDiscountState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(COUPON_DISCOUNT_STORAGE_KEY)
      return saved ? parseFloat(saved) : 0
    } catch {
      return 0
    }
  })

  // Save coupon to localStorage whenever it changes
  useEffect(() => {
    saveCouponToStorage(selectedCoupon)
  }, [selectedCoupon])

  // Save discount to localStorage whenever it changes
  useEffect(() => {
    saveDiscountToStorage(couponDiscount)
  }, [couponDiscount])

  const setSelectedCoupon = useCallback((coupon: Coupon | null) => {
    setSelectedCouponState(coupon)
    if (!coupon) {
      setCouponDiscountState(0)
    }
  }, [])

  const setCouponDiscount = useCallback((discount: number) => {
    setCouponDiscountState(discount)
  }, [])

  const clearCoupon = useCallback(() => {
    setSelectedCouponState(null)
    setCouponDiscountState(0)
    localStorage.removeItem(COUPON_STORAGE_KEY)
    localStorage.removeItem(COUPON_DISCOUNT_STORAGE_KEY)
  }, [])

  return (
    <CouponContext.Provider
      value={{
        selectedCoupon,
        couponDiscount,
        setSelectedCoupon,
        setCouponDiscount,
        clearCoupon,
      }}
    >
      {children}
    </CouponContext.Provider>
  )
}

export const useCoupon = () => {
  const context = useContext(CouponContext)
  if (!context) {
    throw new Error('useCoupon must be used within CouponProvider')
  }
  return context
}






