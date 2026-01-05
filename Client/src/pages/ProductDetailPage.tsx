import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productService } from '../services/productService'
import { couponService } from '../services/couponService'
import { getErrorMessage } from '../utils/errorHandler'
import type { Product, Coupon } from '../types'
import Button from '../components/Button'
import LoginModal from '../components/LoginModal'
import { fadeInUp } from '../utils/animations'

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProductById } = useProducts()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | undefined>(id ? getProductById(id) : undefined)
  const [loading, setLoading] = useState(!product)
  const [error, setError] = useState('')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    if (id && !product) {
      const fetchProduct = async () => {
        try {
          const fetchedProduct = await productService.getProductById(id)
          if (!fetchedProduct) {
            setError('Product not found')
          } else {
            setProduct(fetchedProduct)
          }
        } catch (error) {
          console.error('Failed to fetch product:', error)
          setError(getErrorMessage(error, 'Failed to load product. Please try again.'))
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [id, product])

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [pincode, setPincode] = useState('')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: false,
    description: false,
    returns: false,
  })

  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  
  // Get review summary from product or use defaults
  const reviewSummary = product?.reviewSummary || {
    average_rating: 0,
    total_ratings: 0,
    total_reviews: 0,
    rating_breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }
  
  const rating = reviewSummary.average_rating
  const ratingCount = reviewSummary.total_ratings
  const reviewCount = reviewSummary.total_reviews

  // Fetch reviews when product is loaded
  useEffect(() => {
    if (id && product) {
      const fetchReviews = async () => {
        setLoadingReviews(true)
        try {
          const reviewsData = await productService.getProductReviews(id)
          setReviews(reviewsData)
        } catch (error) {
          console.error('Failed to fetch reviews:', error)
        } finally {
          setLoadingReviews(false)
        }
      }
      fetchReviews()
    }
  }, [id, product])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product && !loading) {
    return (
      <motion.div
        className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {error ? (
          <>
            <p className="text-sm text-neutral-600 mb-6">{error}</p>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Back to Collection
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-neutral-600 mb-6">Product not found</p>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Back to Collection
            </Button>
          </>
        )}
      </motion.div>
    )
  }

  const handleAddToCart = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

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

  const discount = product.originalPrice && typeof product.originalPrice === 'number' && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const savings = product.originalPrice && typeof product.originalPrice === 'number' && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )
      } else {
        stars.push(
          <svg key={i} className="w-4 h-4 text-neutral-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )
      }
    }
    return stars
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-neutral-600">
        <ol className="flex items-center space-x-2">
          <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li className="text-neutral-400">/</li>
          <li><Link to="/products" className="hover:text-primary transition-colors">Products</Link></li>
          <li className="text-neutral-400">/</li>
          <li><span className="text-primary capitalize">{product.category}</span></li>
          <li className="text-neutral-400">/</li>
          <li className="text-primary truncate max-w-xs">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <motion.div
            className="aspect-square bg-soft overflow-hidden mb-4 rounded-sm"
            whileHover={{ opacity: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block'
                }}
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
                  className={`aspect-square bg-soft overflow-hidden border-2 transition-all duration-200 rounded-sm ${
                    selectedImage === index ? 'border-primary' : 'border-soft hover:border-primary/50'
                  }`}
                  whileHover={{ opacity: 0.8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block'
                    }}
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
          className="space-y-6"
        >
          {/* Badge */}
          {product.featured && (
            <span className="inline-block text-[10px] font-semibold text-primary uppercase tracking-wider bg-yellow-100 px-3 py-1 rounded">
              BESTSELLER
            </span>
          )}

          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl font-heading font-medium text-primary leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {renderStars(rating)}
            </div>
            <span className="text-sm font-medium text-primary">{rating}</span>
            <span className="text-sm text-neutral-600">({ratingCount} Ratings)</span>
            <span className="text-sm text-neutral-600">•</span>
            <span className="text-sm text-neutral-600">{reviewCount} Reviews</span>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-primary">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && typeof product.originalPrice === 'number' && (
                <>
                  <span className="text-lg text-neutral-500 line-through">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm font-semibold text-green-600">
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm text-green-600 font-medium">
                You save ₹{savings.toFixed(2)} on this purchase
              </p>
            )}
            <p className="text-xs text-neutral-600">Inclusive of all taxes</p>
          </div>

          {/* Color Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-primary">
                Select Color: <span className="text-primary font-semibold">{selectedColor || 'Select'}</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`relative border-2 transition-all duration-200 rounded-sm overflow-hidden ${
                    selectedColor === color
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-soft hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-16 h-16 bg-soft flex items-center justify-center">
                    <span className="text-xs font-medium text-primary uppercase">{color}</span>
                  </div>
                  {selectedColor === color && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-primary">
                Select Size {!selectedSize && <span className="text-red-500">*</span>}
              </label>
              <button className="text-xs text-primary hover:underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <motion.button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2.5 border-2 transition-all duration-200 text-sm font-medium uppercase tracking-wider ${
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

          {/* Quantity Selector */}
          <div>
            <label className="block text-sm font-medium text-primary mb-3">
              Quantity
            </label>
            <div className="flex items-center gap-4 w-fit">
              <motion.button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border-2 border-soft flex items-center justify-center hover:border-primary transition-colors"
                whileHover={{ opacity: 0.7 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
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
                className="w-10 h-10 border-2 border-soft flex items-center justify-center hover:border-primary transition-colors"
                whileHover={{ opacity: 0.7 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              disabled={isAdding || !product.inStock}
              variant="primary"
              className="text-base font-medium"
            >
              {isAdding ? 'Adding...' : 'Add to Bag'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Button>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm rounded"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ✓ Added to bag successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {!product.inStock && (
            <p className="text-sm text-red-600 font-medium">This item is currently out of stock</p>
          )}

          {/* Delivery Location */}
          <div className="border-t border-soft pt-6">
            <label className="block text-sm font-medium text-primary mb-3">
              Select Delivery Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 px-4 py-2 border-2 border-soft focus:border-primary outline-none text-sm"
                maxLength={6}
              />
              <Button variant="outline" size="sm" className="px-6">
                Check
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-soft">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-medium text-primary">COD Available</p>
                <button className="text-[10px] text-primary hover:underline mt-0.5">Know More</button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-medium text-primary">7 Day Return</p>
                <button className="text-[10px] text-primary hover:underline mt-0.5">Know More</button>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-primary">Usually ships in 1 day</p>
                <button className="text-[10px] text-primary hover:underline mt-0.5">Know More</button>
              </div>
            </div>
          </div>

          {/* Coupons */}
          {coupons.length > 0 && (
            <div className="border-t border-soft pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-primary">Coupons</span>
                </div>
                <span className="text-xs text-primary">{coupons.length} available</span>
              </div>
              {loadingCoupons ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {coupons.slice(0, 3).map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-3 bg-soft border border-soft">
                      <div>
                        <p className="text-sm font-medium text-primary">
                          {coupon.discount_type === 'percentage'
                            ? `Extra ${coupon.discount_value}% off`
                            : `Extra ₹${coupon.discount_value} off`}
                        </p>
                        <p className="text-xs text-neutral-600">
                          Use code: <span className="font-semibold text-primary">{coupon.code}</span>
                          {coupon.min_purchase_amount > 0 && (
                            <span className="ml-1">• Min. ₹{coupon.min_purchase_amount}</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/cart')}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collapsible Sections */}
          <div className="border-t border-soft pt-6 space-y-4">
            {/* Product Details */}
            <div>
              <button
                onClick={() => toggleSection('details')}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-medium text-primary">Product Details</span>
                <svg
                  className={`w-5 h-5 text-primary transition-transform ${expandedSections.details ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.details && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-neutral-600 space-y-2 pt-2"
                >
                  <p>Material: Premium Quality</p>
                  <p>Care Instructions: Machine Wash</p>
                  <p>Fit: Regular Fit</p>
                </motion.div>
              )}
            </div>

            {/* Description */}
            <div>
              <button
                onClick={() => toggleSection('description')}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-medium text-primary">Know your product (Description)</span>
                <svg
                  className={`w-5 h-5 text-primary transition-transform ${expandedSections.description ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.description && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-neutral-600 pt-2"
                >
                  <p className="leading-relaxed">{product.description}</p>
                </motion.div>
              )}
            </div>

            {/* Return & Exchange */}
            <div>
              <button
                onClick={() => toggleSection('returns')}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <span className="text-sm font-medium text-primary">Return & Exchange Policy</span>
                <svg
                  className={`w-5 h-5 text-primary transition-transform ${expandedSections.returns ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.returns && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-neutral-600 pt-2"
                >
                  <p>7 days easy return & exchange available. Items must be in original condition with tags attached.</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-soft pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-primary mb-1">Rating & Reviews</h3>
                {rating > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(rating)}
                    </div>
                    <span className="text-sm font-medium text-primary">{rating}</span>
                    <span className="text-sm text-neutral-600">({ratingCount} Ratings, {reviewCount} Reviews)</span>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">No ratings yet</p>
                )}
              </div>
              {reviewCount > 0 && (
                <button className="text-sm text-primary hover:underline font-medium">Read all Reviews</button>
              )}
            </div>
            
            {/* Reviews List */}
            {loadingReviews ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-soft p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm font-medium text-primary">{review.user_name}</span>
                      {review.is_verified_purchase && (
                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded">Verified Purchase</span>
                      )}
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium text-primary mb-1">{review.title}</p>
                    )}
                    <p className="text-sm text-neutral-600">{review.comment}</p>
                    {review.helpful_count > 0 && (
                      <p className="text-xs text-neutral-500 mt-2">{review.helpful_count} people found this helpful</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </motion.div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}

export default ProductDetailPage
