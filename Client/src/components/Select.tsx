import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-primary uppercase tracking-wider mb-3">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-4 py-3 border border-soft
          focus:outline-none focus:border-primary
          transition-all duration-200 bg-background text-sm
          ${error ? 'border-error' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}
    </div>
  )
}

export default Select
