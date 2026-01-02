import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from './Button'

interface Banner {
  image: string
  badge?: string
  title: string
  subtitle?: string
  cta: string
  link: string
}

const banners: Banner[] = [
  {
    image: '/assets/images/banner-1.jpg',
    badge: 'New Collection',
    title: "WOMEN'S COLLECTION",
    subtitle: 'Starting at Rs. 20.30',
    cta: 'Explore Collection',
    link: '/products',
  },
  {
    image: '/assets/images/banner-2.jpg',
    badge: 'Editorial',
    title: "MEN'S COLLECTION",
    subtitle: 'Starting at Rs. 29.99',
    cta: 'Explore Collection',
    link: '/products',
  },
  {
    image: '/assets/images/banner-3.jpg',
    badge: 'Seasonal',
    title: 'SUMMER 2024',
    subtitle: 'Limited pieces',
    cta: 'Explore Collection',
    link: '/products',
  },
]

const BannerCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  }

  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${banners[currentIndex].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Minimal overlay */}
          <div className="absolute inset-0 bg-background/40" />
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full">
            <div className="h-full flex items-center">
              <div className="max-w-2xl">
                {banners[currentIndex].badge && (
                  <motion.span
                    className="inline-block text-primary text-xs font-medium uppercase tracking-wider mb-8 border-b border-primary pb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {banners[currentIndex].badge}
                  </motion.span>
                )}
                <motion.h1
                  className="text-5xl md:text-6xl lg:text-7xl font-heading font-medium text-primary mb-6 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {banners[currentIndex].title}
                </motion.h1>
                {banners[currentIndex].subtitle && (
                  <motion.p
                    className="text-lg md:text-xl text-neutral-700 font-light mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {banners[currentIndex].subtitle}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Link to={banners[currentIndex].link}>
                    <Button variant="outline" size="lg">
                      {banners[currentIndex].cta}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-background/80 hover:bg-background p-2 transition-all duration-200"
        aria-label="Previous banner"
      >
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-background/80 hover:bg-background p-2 transition-all duration-200"
        aria-label="Next banner"
      >
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-neutral-300 hover:bg-neutral-400 w-1'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default BannerCarousel
