import React from 'react'
import { motion } from 'framer-motion'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-primary uppercase tracking-wider mb-3"
        >
          {label}
        </label>
      )}
      <motion.input
        id={inputId}
        className={`
          w-full px-4 py-3 border border-soft
          focus:outline-none focus:border-primary
          transition-all duration-200 bg-background text-sm
          ${error ? 'border-error' : ''}
          ${className}
        `}
        whileFocus={{ borderColor: '#0A0A0A' }}
        transition={{ duration: 0.2 }}
        {...(props as any)}
      />
      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}
    </div>
  )
}

export default Input
