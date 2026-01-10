/**
 * Image optimization utilities
 * Lazy loading and responsive image handling
 */

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (baseUrl: string, widths: number[] = [400, 800, 1200, 1600]): string => {
  return widths.map(width => `${baseUrl}?w=${width} ${width}w`).join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (breakpoints: { [key: string]: string }): string => {
  return Object.entries(breakpoints)
    .map(([condition, size]) => `(${condition}) ${size}`)
    .join(', ')
}

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (
  imgRef: React.RefObject<HTMLImageElement>,
  src: string,
  onLoad?: () => void
): (() => void) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imgRef.current) {
          imgRef.current.src = src
          if (onLoad) {
            imgRef.current.onload = onLoad
          }
          observer.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '50px', // Start loading 50px before image comes into view
    }
  )

  if (imgRef.current) {
    observer.observe(imgRef.current)
  }

  // Return cleanup function
  return () => {
    if (imgRef.current) {
      observer.unobserve(imgRef.current)
    }
    observer.disconnect()
  }
}

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Get optimized image URL (placeholder or blur data URL)
 */
export const getPlaceholderImage = (width: number = 400, height: number = 400): string => {
  // Generate a simple SVG placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23ededed' width='100%25' height='100%25'/%3E%3C/svg%3E`
}

