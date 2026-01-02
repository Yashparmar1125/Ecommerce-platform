import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { staggerContainer, fadeInUp } from '../utils/animations'

interface Category {
  name: string
  icon: string
  link: string
}

const categories: Category[] = [
  {
    name: 'New Arrivals',
    icon: '/assets/images/icons/tee.svg',
    link: '/products?new=true',
  },
  {
    name: 'Editorial',
    icon: '/assets/images/icons/jacket.svg',
    link: '/products?trending=true',
  },
  {
    name: 'Essentials',
    icon: '/assets/images/icons/bag.svg',
    link: '/products?category=Home',
  },
  {
    name: 'Men',
    icon: '/assets/images/icons/jacket.svg',
    link: '/products?category=Men',
  },
  {
    name: 'Women',
    icon: '/assets/images/icons/dress.svg',
    link: '/products?category=Women',
  },
  {
    name: 'Accessories',
    icon: '/assets/images/icons/tee.svg',
    link: '/products?category=Kids',
  },
]

const CategorySection: React.FC = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  return (
    <section ref={sectionRef} className="py-20 bg-background border-b border-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="flex items-center justify-center gap-8 md:gap-16 flex-wrap"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              variants={fadeInUp}
              whileHover={{ y: -6, scale: 1.05 }}
              transition={{ duration: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
            >
              <Link
                to={category.link}
                className="flex flex-col items-center gap-5 group"
              >
                <motion.div
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-soft flex items-center justify-center overflow-hidden border border-soft group-hover:border-primary transition-all duration-500"
                  whileHover={{ rotate: 5 }}
                >
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <motion.div
                    className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <motion.span
                  className="text-xs font-medium text-primary uppercase tracking-wider group-hover:opacity-70 transition-opacity"
                  whileHover={{ y: -2 }}
                >
                  {category.name}
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default CategorySection
