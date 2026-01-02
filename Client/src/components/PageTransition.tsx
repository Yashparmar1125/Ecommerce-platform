import { motion } from 'framer-motion'
import { pageTransition } from '../utils/animations'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      transition={{ 
        duration: 0.6, 
        ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number]
      }}
      style={{ scrollBehavior: 'auto' }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
