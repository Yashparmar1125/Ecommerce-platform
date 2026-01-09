/**
 * Error handling utility for sanitizing and displaying user-friendly error messages
 */

interface ApiError {
  response?: {
    status?: number
    data?: {
      error?: string
      detail?: string
      message?: string
      [key: string]: any
    }
  }
  message?: string
}

/**
 * Maps HTTP status codes to user-friendly messages
 */
const statusCodeMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data. Please try again.',
  422: 'Invalid data provided. Please check your input.',
  429: 'Too many requests. Please try again later.',
  500: 'A server error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service is currently unavailable. Please try again later.',
}

/**
 * Maps common backend error messages to user-friendly messages
 */
const errorMessageMap: Record<string, string> = {
  'Invalid credentials': 'Invalid email or password. Please try again.',
  'Authentication credentials were not provided': 'Please sign in to continue.',
  'Token is expired': 'Your session has expired. Please sign in again.',
  'Invalid or expired refresh token': 'Your session has expired. Please sign in again.',
  'Insufficient stock': 'This item is currently out of stock.',
  'Order must have at least one item': 'Your cart is empty. Please add items before checkout.',
  'Address not found': 'The address you selected was not found.',
  'Product not found': 'The product you are looking for is no longer available.',
  'Order not found': 'The order you are looking for was not found.',
}

/**
 * Sanitizes error messages to prevent exposing sensitive information
 */
const sanitizeErrorMessage = (error: string): string => {
  // Remove potential sensitive information patterns
  let sanitized = error
  
  // Remove stack traces
  sanitized = sanitized.replace(/at\s+.*\n/g, '')
  
  // Remove file paths
  sanitized = sanitized.replace(/\/[^\s]+/g, '')
  
  // Remove database-related errors
  if (sanitized.includes('database') || sanitized.includes('SQL')) {
    return 'A database error occurred. Please try again later.'
  }
  
  // Remove internal server details
  if (sanitized.includes('Traceback') || sanitized.includes('Exception')) {
    return 'An unexpected error occurred. Please try again.'
  }
  
  return sanitized
}

/**
 * Extracts user-friendly error message from API error
 */
export const getErrorMessage = (error: unknown, fallbackMessage = 'An error occurred. Please try again.'): string => {
  const apiError = error as ApiError

  // Check for network errors
  if (!apiError.response) {
    if (apiError.message?.includes('Network Error') || apiError.message?.includes('timeout')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }
    return fallbackMessage
  }

  const status = apiError.response.status
  const errorData = apiError.response.data

  // Check for status code messages first
  if (status && statusCodeMessages[status]) {
    return statusCodeMessages[status]
  }

  // Check for mapped error messages
  if (errorData?.error) {
    const errorKey = errorData.error
    if (errorMessageMap[errorKey]) {
      return errorMessageMap[errorKey]
    }
    // Sanitize and return if not in map
    return sanitizeErrorMessage(errorData.error)
  }

  // Check for detail message
  if (errorData?.detail) {
    const detailKey = errorData.detail
    if (errorMessageMap[detailKey]) {
      return errorMessageMap[detailKey]
    }
    // Sanitize and return if not in map
    return sanitizeErrorMessage(errorData.detail)
  }

  // Check for message field
  if (errorData?.message) {
    const messageKey = errorData.message
    if (errorMessageMap[messageKey]) {
      return errorMessageMap[messageKey]
    }
    return sanitizeErrorMessage(errorData.message)
  }

  // Fallback to status code message or default
  return status && statusCodeMessages[status] ? statusCodeMessages[status] : fallbackMessage
}

/**
 * Checks if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  const apiError = error as ApiError
  return !apiError.response && (apiError.message?.includes('Network Error') || apiError.message?.includes('timeout'))
}

/**
 * Checks if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  const apiError = error as ApiError
  return apiError.response?.status === 401 || apiError.response?.status === 403
}

/**
 * Checks if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  const apiError = error as ApiError
  return apiError.response?.status === 400 || apiError.response?.status === 422
}






