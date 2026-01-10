import { Suspense, lazy } from 'react'
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
import ErrorBoundary from './components/ErrorBoundary'
import SkeletonLoader from './components/SkeletonLoader'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductListingPage = lazy(() => import('./pages/ProductListingPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

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
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Suspense
                  fallback={
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      <SkeletonLoader />
                    </div>
                  }
                >
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
                </Suspense>
              </AnimatePresence>
            </ErrorBoundary>
          </Layout>
          </CouponProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  )
}

export default App
