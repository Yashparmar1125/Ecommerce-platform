import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ProductsProvider } from './context/ProductsContext'
import { CouponProvider } from './context/CouponContext'
import Layout from './layouts/Layout'
import PageTransition from './components/PageTransition'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import SessionExpiredModal from './components/SessionExpiredModal'
import HomePage from './pages/HomePage'
import ProductListingPage from './pages/ProductListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrderDetailPage from './pages/OrderDetailPage'
import AdminPage from './pages/AdminPage'

function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <CouponProvider>
            <ScrollToTop />
            <SessionExpiredModal />
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
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    </PageTransition>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <PageTransition>
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
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
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    </PageTransition>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <PageTransition>
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    </PageTransition>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PageTransition>
                      <AdminPage />
                    </PageTransition>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Layout>
          </CouponProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}

export default App
