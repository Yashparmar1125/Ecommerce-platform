import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = '' }) => {
  return (
    <motion.div
      className={`bg-neutral-100 rounded-lg ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export default SkeletonLoader


