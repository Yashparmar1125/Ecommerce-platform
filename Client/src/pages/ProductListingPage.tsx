import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'
import Select from '../components/Select'
import { staggerContainer } from '../utils/animations'

const ProductListingPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { products } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [priceRange, setPriceRange] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [selectedColor, setSelectedColor] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  const sizes = ['All', ...Array.from(new Set(products.flatMap(p => p.sizes)))]
  const colors = ['All', ...Array.from(new Set(products.flatMap(p => p.colors)))]

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      if (max) {
        filtered = filtered.filter(p => p.price >= min && p.price <= max)
      } else {
        filtered = filtered.filter(p => p.price >= min)
      }
    }

    if (selectedSize !== 'all') {
      filtered = filtered.filter(p => p.sizes.includes(selectedSize))
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(p => p.colors.includes(selectedColor))
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.reverse()
        break
      default:
        break
    }

    return filtered
  }, [products, selectedCategory, priceRange, selectedSize, selectedColor, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <motion.aside
          className="w-full md:w-64 flex-shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="sticky top-24 space-y-8">
            <h2 className="text-xs font-medium text-primary uppercase tracking-wider mb-6">Filters</h2>

            {/* Category */}
            <div>
              <h3 className="text-xs font-medium text-primary uppercase tracking-wider mb-4">Category</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 ${
                      selectedCategory === category
                        ? 'border-l-2 border-primary text-primary font-medium'
                        : 'text-neutral-600 hover:text-primary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-xs font-medium text-primary uppercase tracking-wider mb-4">Price</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: '0-50', label: 'Rs. 0 - Rs. 50' },
                  { value: '50-100', label: 'Rs. 50 - Rs. 100' },
                  { value: '100-150', label: 'Rs. 100 - Rs. 150' },
                  { value: '150-', label: 'Rs. 150+' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriceRange(option.value)}
                    className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 ${
                      priceRange === option.value
                        ? 'border-l-2 border-primary text-primary font-medium'
                        : 'text-neutral-600 hover:text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="text-xs font-medium text-primary uppercase tracking-wider mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs border transition-all duration-200 uppercase tracking-wider ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-background'
                        : 'border-soft text-primary hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-xs font-medium text-primary uppercase tracking-wider mb-4">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-xs border transition-all duration-200 uppercase tracking-wider ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-background'
                        : 'border-soft text-primary hover:border-primary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <motion.div
            className="flex items-center justify-between mb-8 pb-6 border-b border-soft"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-xs text-neutral-600 uppercase tracking-wider"
              key={filteredProducts.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </motion.p>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'default', label: 'Default' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'newest', label: 'Newest' },
              ]}
              className="w-48 text-xs"
            />
          </motion.div>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <motion.div
                key="products"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="text-center py-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-sm text-neutral-600 mb-2">No pieces found</p>
                <p className="text-xs text-neutral-500">Try adjusting your filters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default ProductListingPage
