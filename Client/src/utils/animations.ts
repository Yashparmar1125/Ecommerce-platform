// Enhanced animation variants for extensive Framer Motion usage

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const fadeInDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 30 },
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.4,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: {
    duration: 0.5,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
}

export const staggerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

export const staggerSlow = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.3,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const hoverLift = {
  y: -8,
  transition: {
    duration: 0.4,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const hoverGlow = {
  boxShadow: '0 10px 40px rgba(10, 10, 10, 0.15)',
  transition: {
    duration: 0.4,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const tapScale = {
  scale: 0.95,
  transition: {
    duration: 0.2,
  },
}

export const pageTransition = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -30,
  },
}

export const imageHover = {
  scale: 1.08,
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const cardHover = {
  y: -12,
  boxShadow: '0 20px 60px rgba(10, 10, 10, 0.12)',
  transition: {
    duration: 0.5,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const rotateIn = {
  initial: { opacity: 0, rotate: -10 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 10 },
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const slideUpFade = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
  transition: {
    duration: 0.7,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const blurIn = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(10px)' },
  transition: {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export const smoothTransition = {
  duration: 0.6,
  ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
}

export const fastTransition = {
  duration: 0.3,
  ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
}

export const slowTransition = {
  duration: 0.9,
  ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
}

// Scroll reveal animations
export const scrollReveal = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: {
    duration: 0.8,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const scrollRevealLeft = {
  initial: { opacity: 0, x: -60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: {
    duration: 0.8,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const scrollRevealRight = {
  initial: { opacity: 0, x: 60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: {
    duration: 0.8,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}

export const scrollRevealScale = {
  initial: { opacity: 0, scale: 0.8 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-100px' },
  transition: {
    duration: 0.8,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  },
}

// Loading animations
export const pulse = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const shimmer = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Gesture animations
export const dragConstraints = { top: 0, bottom: 0, left: 0, right: 0 }

export const whileDrag = {
  scale: 1.1,
  rotate: 5,
  transition: {
    duration: 0.2,
  },
}

// Layout animations
export const layoutAnimation = {
  layout: true,
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: {
    duration: 0.4,
    ease: [0.6, -0.05, 0.01, 0.99],
  },
}
