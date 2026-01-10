/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure function execution time
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  label?: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()
    
    if (import.meta.env.DEV) {
      console.log(
        `%c${label || fn.name || 'Function'}: ${(end - start).toFixed(2)}ms`,
        'color: #0a0a0a; font-weight: bold'
      )
    }
    
    return result
  }) as T
}

/**
 * Measure async function execution time
 */
export const measureAsyncPerformance = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  label?: string
): T => {
  return (async (...args: Parameters<T>) => {
    const start = performance.now()
    const result = await fn(...args)
    const end = performance.now()
    
    if (import.meta.env.DEV) {
      console.log(
        `%c${label || fn.name || 'Async Function'}: ${(end - start).toFixed(2)}ms`,
        'color: #0a0a0a; font-weight: bold'
      )
    }
    
    return result
  }) as T
}

/**
 * Get Web Vitals metrics
 */
export const getWebVitals = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return null
  }

  try {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      if (import.meta.env.DEV) {
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (import.meta.env.DEV) {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
        if (import.meta.env.DEV) {
          console.log('CLS:', clsValue)
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  } catch (error) {
    console.warn('Performance monitoring not supported:', error)
  }
}

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    getWebVitals()
  }
}

