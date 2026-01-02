import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import Button from '../components/Button'
import { fadeInUp } from '../utils/animations'

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProductById } = useProducts()
  const { addToCart } = useCart()
  const product = id ? getProductById(id) : undefined

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!product) {
    return (
      <motion.div
        className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-sm text-neutral-600 mb-6">Product not found</p>
        <Button variant="outline" onClick={() => navigate('/products')}>
          Back to Collection
        </Button>
      </motion.div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color')
      return
    }

    setIsAdding(true)
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    setTimeout(() => {
      setIsAdding(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    }, 300)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <motion.div
            className="aspect-square bg-soft overflow-hidden mb-4"
            whileHover={{ opacity: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
          </motion.div>
          {product.images.length > 1 && (
            <motion.div
              className="grid grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-soft overflow-hidden border transition-all duration-200 ${
                    selectedImage === index ? 'border-primary' : 'border-soft'
                  }`}
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-medium text-primary mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-2xl font-medium text-primary">Rs. {product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-neutral-500 line-through">
                    Rs. {product.originalPrice.toFixed(2)}
                  </span>
                  {discount > 0 && (
                    <span className="text-xs font-medium text-primary uppercase tracking-wider border-b border-primary pb-1">
                      {discount}% off
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed mb-8">{product.description}</p>
          </div>

          {/* Size Selector */}
          <div>
            <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-4">
              Size {!selectedSize && <span className="text-error">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <motion.button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 border transition-all duration-200 text-sm uppercase tracking-wider ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-background'
                      : 'border-soft text-primary hover:border-primary bg-background'
                  }`}
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-4">
              Color {!selectedColor && <span className="text-error">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-6 py-3 border transition-all duration-200 text-sm uppercase tracking-wider ${
                    selectedColor === color
                      ? 'border-primary bg-primary text-background'
                      : 'border-soft text-primary hover:border-primary bg-background'
                  }`}
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {color}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-4">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-soft flex items-center justify-center hover:border-primary transition-colors"
                whileHover={{ opacity: 0.7 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                </svg>
              </motion.button>
              <motion.span
                className="text-base font-medium text-primary w-12 text-center"
                key={quantity}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {quantity}
              </motion.span>
              <motion.button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-soft flex items-center justify-center hover:border-primary transition-colors"
                whileHover={{ opacity: 0.7 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              disabled={isAdding || !product.inStock}
              variant="primary"
            >
              {isAdding ? 'Adding...' : 'Add to Bag'}
            </Button>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="border border-soft bg-soft p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-sm text-primary">Added to bag</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!product.inStock && (
            <p className="text-sm text-neutral-600">This piece is currently unavailable</p>
          )}

          {/* Description */}
          <div className="pt-8 border-t border-soft">
            <h3 className="text-xs font-medium text-primary uppercase tracking-wider mb-4">Details</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{product.description}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProductDetailPage
