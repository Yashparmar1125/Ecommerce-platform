import React, { useState, useMemo, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Product } from '../types'
import { staggerItem, cardHover, imageHover } from '../utils/animations'

interface ProductCardProps {
  product: Product
  index?: number
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, index = 0 }) => {
  const [imageIndex, setImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Memoize discount calculation
  const discount = useMemo(() => {
    return product.originalPrice && typeof product.originalPrice === 'number' && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  }, [product.originalPrice, product.price])

  // Mouse position tracking for tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

  // Memoize event handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
    setImageIndex(0)
  }, [x, y])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (product.images.length > 1) {
      setImageIndex(1)
    }
  }, [product.images.length])

  // Memoize image source
  const imageSrc = useMemo(() => {
    return product.images[imageIndex] || product.images[0]
  }, [product.images, imageIndex])

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number] }}
      custom={index}
      className="group"
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="bg-background overflow-hidden border border-soft hover:border-primary transition-all duration-500 h-full flex flex-col"
        whileHover={{ y: -12, boxShadow: '0 20px 60px rgba(10, 10, 10, 0.12)' }}
        transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number] }}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
        }}
      >
        <Link
          to={`/products/${product.id}`}
          className="block flex-1 flex flex-col"
          onMouseEnter={handleMouseEnter}
        >
          {/* Image Container */}
          <div className="relative aspect-square bg-soft overflow-hidden w-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={imageIndex}
                src={imageSrc}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block'
                }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number] }}
                whileHover={{ scale: 1.08 }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-neutral-400 bg-soft">Image not available</div>'
                  }
                }}
              />
            </AnimatePresence>

            {/* Badges */}
            <motion.div
              className="absolute top-4 left-4 flex flex-col gap-2 z-10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (index || 0) * 0.1 }}
            >
              {discount > 0 && (
                <motion.span
                  className="bg-primary text-background text-[10px] font-medium px-3 py-1.5 uppercase tracking-wider"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    delay: 0.4,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  -{discount}%
                </motion.span>
              )}
              {product.featured && (
                <motion.span
                  className="bg-background text-primary text-[10px] font-medium px-3 py-1.5 uppercase tracking-wider border border-primary"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    delay: 0.5,
                  }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  NEW
                </motion.span>
              )}
            </motion.div>

            {/* Quick View Overlay */}
            <motion.div
              className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.span
                className="text-xs font-medium text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ y: 20, scale: 0.8 }}
                whileHover={{ y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                View Details
              </motion.span>
            </motion.div>

            {!product.inStock && (
              <motion.div
                className="absolute inset-0 bg-background/95 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="text-primary text-sm font-medium uppercase tracking-wider"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  Out of Stock
                </motion.span>
              </motion.div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            className="p-5 space-y-3 flex-1 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + (index || 0) * 0.05 }}
          >
            <motion.h3
              className="font-medium text-primary text-sm leading-tight min-h-[2.5rem] group-hover:opacity-80 transition-opacity"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3 }}
            >
              {product.name}
            </motion.h3>

            {/* Price */}
            <motion.div
              className="flex items-baseline gap-2 mt-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index || 0) * 0.05 }}
            >
              <motion.span
                className="text-base font-medium text-primary"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Rs. {product.price.toFixed(2)}
              </motion.span>
              {product.originalPrice && typeof product.originalPrice === 'number' && (
                <motion.span
                  className="text-xs text-neutral-500 line-through"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Rs. {product.originalPrice.toFixed(2)}
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.inStock === nextProps.product.inStock &&
    prevProps.product.featured === nextProps.product.featured &&
    prevProps.product.images.length === nextProps.product.images.length &&
    prevProps.index === nextProps.index
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
