/**
 * Request cancellation utility
 * Prevents race conditions and unnecessary API calls
 * Uses AbortController (modern standard) instead of deprecated CancelToken
 */

class RequestCancellationManager {
  private abortControllers: Map<string, AbortController> = new Map()

  /**
   * Create a new AbortController for a request
   */
  createAbortController(key: string): AbortController {
    // Cancel previous request with same key if exists
    this.cancel(key)
    
    const controller = new AbortController()
    this.abortControllers.set(key, controller)
    return controller
  }

  /**
   * Get existing AbortController or create a new one
   */
  getAbortController(key: string): AbortController {
    const existing = this.abortControllers.get(key)
    if (existing && !existing.signal.aborted) {
      return existing
    }
    return this.createAbortController(key)
  }

  /**
   * Cancel a request by key
   */
  cancel(key: string): void {
    const controller = this.abortControllers.get(key)
    if (controller && !controller.signal.aborted) {
      controller.abort(`Request ${key} was cancelled`)
      this.abortControllers.delete(key)
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll(): void {
    this.abortControllers.forEach((controller, key) => {
      if (!controller.signal.aborted) {
        controller.abort(`Request ${key} was cancelled`)
      }
    })
    this.abortControllers.clear()
  }

  /**
   * Remove abort controller after request completes
   */
  remove(key: string): void {
    this.abortControllers.delete(key)
  }

  /**
   * Check if request is pending
   */
  hasPending(key: string): boolean {
    const controller = this.abortControllers.get(key)
    return controller !== undefined && !controller.signal.aborted
  }
}

// Singleton instance
export const requestCancellationManager = new RequestCancellationManager()

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    requestCancellationManager.cancelAll()
  })
}

