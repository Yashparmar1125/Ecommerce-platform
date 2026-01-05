import { api } from '../api/axios.api'
import type { Coupon } from '../types'

interface CouponListResponse {
  count: number
  data: Coupon[]
}

interface CouponValidateResponse {
  data: {
    coupon: Coupon
    discount_amount: number
    message: string
  }
}

export const couponService = {
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const response = await api.get<CouponListResponse>('/products/coupons/')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      return []
    }
  },

  validateCoupon: async (code: string, total_amount: number): Promise<{ coupon: Coupon; discount_amount: number }> => {
    try {
      const response = await api.post<CouponValidateResponse>('/products/coupons/validate/', {
        code: code.toUpperCase(),
        amount: total_amount
      })
      return {
        coupon: response.data.data.coupon,
        discount_amount: parseFloat(response.data.data.discount_amount.toString())
      }
    } catch (error: any) {
      console.error('Failed to validate coupon:', error)
      throw error
    }
  },
}

