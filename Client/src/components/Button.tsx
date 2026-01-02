import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-medium focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed relative transition-all duration-200 uppercase tracking-wider text-xs'
  
  const variants = {
    primary: 'bg-primary text-background hover:opacity-90 border border-primary',
    secondary: 'bg-soft text-primary hover:bg-neutral-200 border border-soft',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-background bg-transparent',
    ghost: 'text-primary hover:bg-soft bg-transparent',
  }
  
  const sizes = {
    sm: 'px-6 py-2.5',
    md: 'px-8 py-3',
    lg: 'px-10 py-3.5',
  }
  
  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      whileHover={!disabled ? { opacity: 0.9 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}

export default Button
