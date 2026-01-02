import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ProductsProvider } from './context/ProductsContext'
import Layout from './layouts/Layout'
import PageTransition from './components/PageTransition'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import ProductListingPage from './pages/ProductListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <ScrollToTop />
          <Layout>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route
                  path="/"
                  element={
                    <PageTransition>
                      <HomePage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <PageTransition>
                      <ProductListingPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <PageTransition>
                      <ProductDetailPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <PageTransition>
                      <CartPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <PageTransition>
                      <CheckoutPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PageTransition>
                      <LoginPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PageTransition>
                      <RegisterPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PageTransition>
                      <ProfilePage />
                    </PageTransition>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Layout>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}

export default App
