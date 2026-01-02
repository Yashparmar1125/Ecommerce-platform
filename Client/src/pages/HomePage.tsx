import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'
import Button from '../components/Button'
import BannerCarousel from '../components/BannerCarousel'
import CategorySection from '../components/CategorySection'
import { 
  staggerContainer, 
  staggerFast, 
  scrollReveal, 
  scrollRevealLeft, 
  scrollRevealRight,
  scrollRevealScale,
  smoothTransition 
} from '../utils/animations'

const HomePage: React.FC = () => {
  const { products } = useProducts()
  const newArrivals = products.slice(0, 6)
  const editorial = products.slice(6, 10)
  const collection = products.slice(0, 12)

  const newArrivalsRef = useRef(null)
  const editorialRef = useRef(null)
  const collectionRef = useRef(null)
  const servicesRef = useRef(null)
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const newArrivalsInView = useInView(newArrivalsRef, { once: true, amount: 0.2 })
  const editorialInView = useInView(editorialRef, { once: true, amount: 0.2 })
  const collectionInView = useInView(collectionRef, { once: true, amount: 0.2 })
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.3 })

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6])

  const services = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Worldwide Delivery',
      desc: 'Complimentary shipping on orders over Rs. 50',
      highlight: 'Free Shipping',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Secure Checkout',
      desc: 'Protected transactions with encryption',
      highlight: 'SSL Encrypted',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Easy Returns',
      desc: '30-day return policy, hassle-free',
      highlight: '30 Days',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: 'Customer Care',
      desc: 'Dedicated support team available',
      highlight: '24/7 Support',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Quality Assured',
      desc: 'Premium materials, curated selection',
      highlight: 'Premium',
    },
  ]

  return (
    <div ref={containerRef} className="overflow-hidden relative">
      {/* Hero Banner Carousel */}
      <motion.div style={{ y: y1, opacity }}>
        <BannerCarousel />
      </motion.div>

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={smoothTransition}
      >
        <CategorySection />
      </motion.div>

      {/* New Arrivals */}
      <section ref={newArrivalsRef} className="py-32 bg-background relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-20">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={newArrivalsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
              transition={{ ...smoothTransition, delay: 0.2 }}
            >
              <motion.span
                className="text-xs font-medium text-primary uppercase tracking-wider mb-6 block border-b border-primary pb-3 inline-block"
                initial={{ opacity: 0, width: 0 }}
                animate={newArrivalsInView ? { opacity: 1, width: 'auto' } : { opacity: 0, width: 0 }}
                transition={{ delay: 0.4, ...smoothTransition }}
              >
                New Arrivals
              </motion.span>
              <motion.h2
                className="text-5xl md:text-6xl lg:text-7xl font-heading font-medium text-primary leading-[1.1] mb-4"
                initial={{ opacity: 0, y: 40 }}
                animate={newArrivalsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ delay: 0.3, ...smoothTransition }}
              >
                Latest Collection
              </motion.h2>
              <motion.p
                className="text-sm text-neutral-600 max-w-xl mt-6"
                initial={{ opacity: 0 }}
                animate={newArrivalsInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.5, ...smoothTransition }}
              >
                Discover our newest pieces, carefully curated for the modern wardrobe
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={newArrivalsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
              transition={{ delay: 0.4, ...smoothTransition }}
            >
              <Link to="/products">
                <Button variant="outline" size="lg">
                  View All
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate={newArrivalsInView ? 'animate' : 'initial'}
          >
            {newArrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Editorial */}
      <section ref={editorialRef} className="py-32 bg-soft relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-primary/5"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
          style={{ transformOrigin: 'left' }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            variants={scrollReveal}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.span
              className="text-xs font-medium text-primary uppercase tracking-wider mb-6 block border-b border-primary pb-3 inline-block"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, ...smoothTransition }}
            >
              Editorial
            </motion.span>
            <motion.h2
              className="text-5xl md:text-6xl lg:text-7xl font-heading font-medium text-primary leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, ...smoothTransition }}
            >
              Featured Pieces
            </motion.h2>
            <motion.p
              className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, ...smoothTransition }}
            >
              Curated selection of our most essential pieces, designed for timeless elegance
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate={editorialInView ? 'animate' : 'initial'}
          >
            {editorial.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Full Collection */}
      <section ref={collectionRef} className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            variants={scrollReveal}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.span
              className="text-xs font-medium text-primary uppercase tracking-wider mb-6 block border-b border-primary pb-3 inline-block"
              initial={{ width: 0 }}
              whileInView={{ width: 'auto' }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              Collection
            </motion.span>
            <motion.h2
              className="text-5xl md:text-6xl lg:text-7xl font-heading font-medium text-primary leading-[1.1] mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, ...smoothTransition }}
            >
              Complete Collection
            </motion.h2>
            <motion.p
              className="text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, ...smoothTransition }}
            >
              Explore our full range of carefully selected pieces, each designed with intention
            </motion.p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate={collectionInView ? 'animate' : 'initial'}
          >
            {collection.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section ref={servicesRef} className="py-24 bg-background border-t border-soft relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={scrollReveal}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            <motion.span
              className="text-xs font-medium text-primary uppercase tracking-wider mb-4 block border-b border-primary pb-2 inline-block"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, ...smoothTransition }}
            >
              Services
            </motion.span>
            <motion.h2
              className="text-3xl md:text-4xl font-heading font-medium text-primary leading-tight mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, ...smoothTransition }}
            >
              Why Choose NŌIRÉ
            </motion.h2>
            <motion.p
              className="text-sm text-neutral-600 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, ...smoothTransition }}
            >
              Experience premium service at every step of your journey
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={scrollRevealScale}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
                className="group relative"
              >
                <motion.div
                  className="border border-soft p-8 h-full flex flex-col items-center text-center transition-all duration-500 hover:border-primary bg-background"
                  whileHover={{ boxShadow: '0 20px 60px rgba(10, 10, 10, 0.08)' }}
                >
                  {/* Icon Container */}
                  <motion.div
                    className="mb-6 text-primary"
                    whileHover={{ scale: 1.15, rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
                  >
                    {service.icon}
                  </motion.div>

                  {/* Highlight Badge */}
                  <motion.span
                    className="text-[10px] font-medium text-primary uppercase tracking-wider mb-4 border-b border-primary pb-1 inline-block"
                    initial={{ opacity: 0.6, scale: 0.9 }}
                    whileHover={{ opacity: 1, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {service.highlight}
                  </motion.span>

                  {/* Title */}
                  <motion.h3
                    className="text-sm font-medium text-primary uppercase tracking-wider mb-3 leading-tight"
                    initial={{ opacity: 0.9 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {service.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    className="text-xs text-neutral-600 leading-relaxed mt-auto"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {service.desc}
                  </motion.p>

                  {/* Hover Effect Line */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
