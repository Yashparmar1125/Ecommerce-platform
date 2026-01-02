import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TopBar: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="bg-neutral-50 border-b border-neutral-100 py-2 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-neutral-600">Welcome to Fashion Store, an online store</p>
          <div className="flex items-center gap-4">
            <select className="bg-transparent border-none text-neutral-600 text-sm cursor-pointer focus:outline-none">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
            {user ? (
              <Link to="/profile" className="text-neutral-600 hover:text-primary transition-smooth">
                {user.name}
              </Link>
            ) : (
              <Link to="/login" className="text-neutral-600 hover:text-primary transition-smooth">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar


