import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { getItemCount } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = getItemCount()
  const { scrollY } = useScroll()
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.95, 1])
  const navbarBlur = useTransform(scrollY, [0, 100], [8, 12])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }


  return (
    <>
      <motion.nav
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-soft"
        style={{
          opacity: navbarOpacity,
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6,
          ease: [0.6, -0.05, 0.01, 0.99],
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-8">
            {/* Logo - Wordmark Only */}
            <motion.div
              whileHover={{ scale: 1.05, opacity: 0.8 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="brand-wordmark text-xl text-primary">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  NŌIRÉ
                </motion.span>
              </Link>
            </motion.div>

            {/* Search Bar - Center */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8 hidden lg:block">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search collection..."
                  className="w-full px-4 py-2.5 pl-10 border border-soft focus:outline-none focus:border-primary transition-all duration-300 bg-background text-sm"
                  whileFocus={{ 
                    borderColor: '#0A0A0A',
                    scale: 1.02,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                  whileHover={{ scale: 1.2, color: '#0A0A0A' }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.button>
                <AnimatePresence>
                  {isSearchFocused && searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-background border border-soft p-2"
                    >
                      <p className="text-xs text-neutral-600">Press Enter to search</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </form>

            {/* Right Icons */}
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Wishlist */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 relative"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault()
                    setIsLoginModalOpen(true)
                  }
                }}
              >
                <Link to="/profile" className="text-primary">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </motion.svg>
                </Link>
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 relative"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault()
                    setIsLoginModalOpen(true)
                  }
                }}
              >
                <Link to="/cart" className="text-primary">
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </motion.svg>
                  <AnimatePresence mode="popLayout">
                    {cartCount > 0 && (
                      <motion.span
                        className="absolute top-0 right-0 bg-primary text-background text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                        whileHover={{ scale: 1.2 }}
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.button>

              {/* Profile / Login */}
              {user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 text-primary"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </motion.button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-40 bg-background border border-soft py-2 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-primary hover:bg-soft transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                        </motion.div>
                        <motion.button
                          onClick={() => {
                            logout()
                            setIsMenuOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-primary hover:bg-soft transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          Sign Out
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="p-2 text-primary"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </motion.button>
              )}

              {/* Mobile Menu */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-primary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: isMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </motion.svg>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}

export default Navbar
