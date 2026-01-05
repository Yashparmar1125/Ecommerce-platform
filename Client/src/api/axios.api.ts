import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

const URL_HOST = import.meta.env.VITE_API_HOST
const api = axios.create({
    baseURL: `${URL_HOST}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
    config: InternalAxiosRequestConfig
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            // Update the request config with new token
            if (prom.config.headers) {
                prom.config.headers.Authorization = `Bearer ${token}`
            }
            prom.resolve(api(prom.config))
        }
    })
    failedQueue = []
}

// Request interceptor - add token to requests
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Check if error is 401 (Unauthorized) - attempt token refresh for all 401s
        // Skip refresh for login/register/refresh endpoints to avoid infinite loops
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            const url = originalRequest.url || ''
            const isAuthEndpoint = url.includes('/users/login/') || 
                                  url.includes('/users/register/') || 
                                  url.includes('/users/token/refresh/') ||
                                  url.includes('/admin/login')
            
            // Don't try to refresh if this is already an auth endpoint
            if (isAuthEndpoint) {
                return Promise.reject(error)
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ 
                        resolve, 
                        reject,
                        config: originalRequest
                    })
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                // No refresh token, clear everything and redirect
                isRefreshing = false
                handleSessionExpired()
                return Promise.reject(error)
            }

            try {
                // Attempt to refresh the token
                const response = await axios.post(
                    `${api.defaults.baseURL}/users/token/refresh/`,
                    { refresh: refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )

                const { access, refresh: newRefreshToken } = response.data.data

                // Update tokens in localStorage
                localStorage.setItem('token', access)
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken)
                }

                // Update the default authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`

                // Update the original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access}`
                }

                // Process queued requests with the new token
                processQueue(null, access)

                isRefreshing = false

                // Retry the original request
                return api(originalRequest)
            } catch (refreshError: any) {
                // Refresh failed, clear tokens and redirect
                isRefreshing = false
                processQueue(refreshError, null)
                handleSessionExpired()
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// Function to handle session expiration
const handleSessionExpired = () => {
    // Clear all auth data
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminAuthenticated')

    // Show session expired message
    const event = new CustomEvent('session-expired', {
        detail: { message: 'Your session has expired. Please login again.' }
    })
    window.dispatchEvent(event)

    // Redirect to login page
    if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login'
    } else if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin'
    }
}

export const emailLogin = (email: string, password: string) => {
    return api.post('/users/login/', { email, password })
}

export const getUser = () => {
    return api.get('/users/me/')
}

export const registerUser = (email: string, password: string, first_name: string, last_name: string) => {
    return api.post('/users/register/', { email, password, first_name, last_name})
}

// Address API functions
export const addressApi = {
    getAddresses: () => api.get('/users/addresses/'),
    getAddress: (id: string) => api.get(`/users/addresses/${id}/`),
    createAddress: (data: any) => api.post('/users/addresses/', data),
    updateAddress: (id: string, data: any) => api.patch(`/users/addresses/${id}/`, data),
    deleteAddress: (id: string) => api.delete(`/users/addresses/${id}/`),
}

// Order API functions
export const orderApi = {
    getOrders: () => api.get('/orders/'),
    getOrder: (id: string) => api.get(`/orders/${id}/`),
    createOrder: (data: any) => api.post('/orders/', data),
}

// User API functions
export const userApi = {
    updateProfile: (data: any) => api.patch('/users/me/', data),
}

// Export api instance for use in services
export { api }

// Admin API functions
export const adminApi = {
    // Authentication
    login: (username: string, password: string) => {
        return api.post('/admin/login', { username, password })
    },
    
    // Dashboard
    getDashboard: () => api.get('/admin/dashboard'),
    
    // Product Attributes
    getAttributes: (type?: 'size' | 'color') => {
        const params = type ? { params: { type } } : {}
        return api.get('/admin/attributes', params)
    },
    
    // Products
    getProducts: () => api.get('/admin/products'),
    getProduct: (id: string) => api.get(`/admin/products/${id}`),
    createProduct: (data: any) => api.post('/admin/products', data),
    updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
    
    // Categories
    getCategories: () => api.get('/admin/categories'),
    getCategory: (id: string) => api.get(`/admin/categories/${id}`),
    createCategory: (data: any) => api.post('/admin/categories', data),
    updateCategory: (id: string, data: any) => api.patch(`/admin/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
    
    // Orders
    getOrders: (status?: string) => {
        const params = status ? { params: { status } } : {}
        return api.get('/admin/orders', params)
    },
    getOrder: (id: string) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}`, { status }),
    
    // Users
    getUsers: () => api.get('/admin/users'),
    getUser: (id: string) => api.get(`/admin/users/${id}`),
    updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
    
    // Reviews
    getReviews: (productId?: string) => {
        const params = productId ? { params: { product_id: productId } } : {}
        return api.get('/admin/reviews', params)
    },
    getReview: (id: string) => api.get(`/admin/reviews/${id}`),
    deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
    
    // Coupons
    getCoupons: () => api.get('/admin/coupons'),
    getCoupon: (id: string) => api.get(`/admin/coupons/${id}`),
    createCoupon: (data: any) => api.post('/admin/coupons', data),
    updateCoupon: (id: string, data: any) => api.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),
    getCouponUsage: (couponId?: string) => {
        const params = couponId ? { params: { coupon_id: couponId } } : {}
        return api.get('/admin/coupons/usage', params)
    },
}
