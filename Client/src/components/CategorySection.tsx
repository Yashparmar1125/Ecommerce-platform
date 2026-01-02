import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { staggerContainer, fadeInUp } from '../utils/animations'
import { useProducts } from '../context/ProductsContext'

interface Category {
  id: number
  name: string
  description: string
  product_count: number
}

// Icon mapping using image files - only using SVG files that exist
const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    'Kurtis Kurtas & Tunics': '/assets/images/icons/dress.svg',
    'Kurtis': '/assets/images/icons/dress.svg',
    'Kurtas': '/assets/images/icons/dress.svg',
    'Tunics': '/assets/images/icons/dress.svg',
    'Ethnic Fusion': '/assets/images/icons/jacket.svg',
    'Ethnic': '/assets/images/icons/jacket.svg',
    'Fusion': '/assets/images/icons/jacket.svg',
    'Men': '/assets/images/icons/jacket.svg',
    'Women': '/assets/images/icons/dress.svg',
    'Clothing': '/assets/images/icons/tee.svg',
    'Fashion': '/assets/images/icons/tee.svg',
    'Accessories': '/assets/images/icons/bag.svg',
    'Bags': '/assets/images/icons/bag.svg',
    'Handbags': '/assets/images/icons/bag.svg',
    'Essentials': '/assets/images/icons/bag.svg',
    'Jewelry': '/assets/images/icons/jewelry.svg',
    'Jewellery': '/assets/images/icons/jewelry.svg',
    'Shoes': '/assets/images/icons/shoes.svg',
    'Footwear': '/assets/images/icons/shoes.svg',
    'Electronics': '/assets/images/icons/watch.svg',
    'Home': '/assets/images/icons/bag.svg',
    'Beauty': '/assets/images/icons/perfume.svg',
    'Health & Beauty': '/assets/images/icons/perfume.svg',
    'Cosmetics': '/assets/images/icons/cosmetics.svg',
  }
  
  // Try exact match first
  if (iconMap[categoryName]) {
    return iconMap[categoryName]
  }
  
  // Try partial match (case insensitive)
  const lowerName = categoryName.toLowerCase()
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return icon
    }
  }
  
  // Default icon
  return '/assets/images/icons/tee.svg'
}

const CategorySection: React.FC = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const navigate = useNavigate()
  const { categoryObjects, loading } = useProducts()
  const [imageErrors, setImageErrors] = useState<Record<number, string>>({})

  // Preload category icons when categories are loaded
  useEffect(() => {
    if (categoryObjects.length > 0) {
      const iconPaths = new Set<string>()
      categoryObjects.forEach(category => {
        const iconPath = getCategoryIcon(category.name)
        iconPaths.add(iconPath)
      })
      
      // Preload icons
      iconPaths.forEach(iconPath => {
        const img = new Image()
        img.src = iconPath
      })
    }
  }, [categoryObjects])

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`)
  }

  // Skeleton loading component
  const CategorySkeleton = () => (
    <motion.div
      className="flex flex-col items-center gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-soft animate-pulse border border-soft">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-neutral-300/50"></div>
        </div>
      </div>
      <div className="h-4 w-20 bg-soft animate-pulse rounded"></div>
      <div className="h-3 w-16 bg-soft animate-pulse rounded"></div>
    </motion.div>
  )

  if (loading) {
    return (
      <section className="py-20 bg-background border-b border-soft">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="flex items-center justify-center gap-8 md:gap-16 flex-wrap"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={fadeInUp}
              >
                <CategorySkeleton />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="py-20 bg-background border-b border-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {categoryObjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-neutral-600 mb-2">No categories found</p>
            <p className="text-xs text-neutral-500">Categories will appear here once products are added</p>
          </div>
        ) : (
          <motion.div
            className="flex items-center justify-center gap-8 md:gap-16 flex-wrap"
            variants={staggerContainer}
            initial="initial"
            animate={isInView ? 'animate' : 'initial'}
          >
            {categoryObjects.map((category, index) => (
              <motion.div
                key={category.id}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => handleCategoryClick(category.name)}
                  className="flex flex-col items-center gap-5 group cursor-pointer"
                >
                  <motion.div
                    className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-soft flex items-center justify-center overflow-hidden border border-soft group-hover:border-primary transition-all duration-500"
                    whileHover={{ rotate: 5 }}
                  >
                    <img
                      key={`icon-${category.id}`}
                      src={imageErrors[category.id] || getCategoryIcon(category.name)}
                      alt={category.name}
                      className="w-12 h-12 md:w-14 md:h-14 object-contain"
                      style={{ 
                        display: 'block',
                        maxWidth: '100%',
                        height: 'auto',
                        opacity: 1,
                        visibility: 'visible',
                        minWidth: '48px',
                        minHeight: '48px',
                        position: 'relative',
                        zIndex: 1
                      }}
                      loading="eager"
                      onError={(e) => {
                        // Fallback to a default icon if image fails to load
                        const target = e.target as HTMLImageElement
                        const fallbackIcon = '/assets/images/icons/tee.svg'
                        console.warn(`Failed to load icon for category "${category.name}" (${target.src}), using fallback`)
                        if (!imageErrors[category.id]) {
                          setImageErrors(prev => ({
                            ...prev,
                            [category.id]: fallbackIcon
                          }))
                          // Force reload with fallback
                          setTimeout(() => {
                            target.src = fallbackIcon
                          }, 0)
                        }
                      }}
                      onLoad={(e) => {
                        // Ensure image is visible when loaded
                        const target = e.target as HTMLImageElement
                        target.style.opacity = '1'
                        target.style.visibility = 'visible'
                        target.style.display = 'block'
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                  <motion.span
                    className="text-xs font-medium text-primary uppercase tracking-wider group-hover:opacity-70 transition-opacity text-center max-w-[100px]"
                    whileHover={{ y: -2 }}
                  >
                    {category.name}
                  </motion.span>
                  {category.product_count > 0 && (
                    <motion.span
                      className="text-[10px] text-neutral-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      {category.product_count} {category.product_count === 1 ? 'item' : 'items'}
                    </motion.span>
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default CategorySection
