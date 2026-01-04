import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../api/axios.api'
import Button from '../components/Button'
import AdminLogin from '../components/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminProducts from '../components/admin/AdminProducts'
import AdminOrders from '../components/admin/AdminOrders'
import AdminUsers from '../components/admin/AdminUsers'
import AdminCategories from '../components/admin/AdminCategories'
import ProductFormModal from '../components/admin/ProductFormModal'
import CategoryFormModal from '../components/admin/CategoryFormModal'
import type { DashboardStats, Product, Category, Order, User, TabType } from '../types/admin'

const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null)
  
  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    summary: '',
    description: '',
    category: '',
    cover: '',
    original_price: '',
    featured: false,
    in_stock: true,
    images: [] as string[],
    skus: [] as Array<{
      sku: string
      price: string
      quantity: string
      size_attribute_id: string
      color_attribute_id: string
    }>,
  })
  
  // Product attributes for SKU creation
  const [sizeAttributes, setSizeAttributes] = useState<Array<{id: number, value: string}>>([])
  const [colorAttributes, setColorAttributes] = useState<Array<{id: number, value: string}>>([])
  
  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [orderStatusFilter, setOrderStatusFilter] = useState('')
  
  // Users
  const [users, setUsers] = useState<User[]>([])
  
  // Categories
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })

  useEffect(() => {
    checkAdminAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, orderStatusFilter, isAdminAuthenticated])

  const checkAdminAccess = async () => {
    setCheckingAuth(true)
    try {
      const adminAuth = localStorage.getItem('adminAuthenticated')
      const adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken || !adminAuth) {
        setIsAdminAuthenticated(false)
        setCheckingAuth(false)
        return
      }

      localStorage.setItem('token', adminToken)
      const response = await adminApi.getDashboard()
      if (response.status === 200) {
        setIsAdminAuthenticated(true)
        setStats(response.data.data)
        setLoading(false)
      }
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.removeItem('adminAuthenticated')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminRefreshToken')
        setIsAdminAuthenticated(false)
      } else {
        setError('Failed to load admin dashboard')
      }
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true)
    checkAdminAccess()
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setIsAdminAuthenticated(false)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      switch (activeTab) {
        case 'dashboard':
          const dashboardRes = await adminApi.getDashboard()
          setStats(dashboardRes.data)
          break
        case 'products':
          const [productsRes, categoriesRes, sizesRes, colorsRes] = await Promise.all([
            adminApi.getProducts(),
            adminApi.getCategories(),
            adminApi.getAttributes('size'),
            adminApi.getAttributes('color'),
          ])
          setProducts(productsRes.data.data)
          setCategories(categoriesRes.data.data)
          setSizeAttributes(sizesRes.data.data.map((attr: any) => ({ id: attr.id, value: attr.value })))
          setColorAttributes(colorsRes.data.data.map((attr: any) => ({ id: attr.id, value: attr.value })))
          break
        case 'orders':
          const ordersRes = await adminApi.getOrders(orderStatusFilter || undefined)
          setOrders(ordersRes.data.data)
          break
        case 'users':
          const usersRes = await adminApi.getUsers()
          setUsers(usersRes.data.data)
          break
        case 'categories':
          const catsRes = await adminApi.getCategories()
          setCategories(catsRes.data.data)
          break
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      const images = productForm.images.map((url, idx) => ({
        image_url: url,
        order: idx,
      }))
      
      const skus = productForm.skus.map(sku => ({
        sku: sku.sku,
        price: parseFloat(sku.price),
        quantity: parseInt(sku.quantity),
        size_attribute_id: sku.size_attribute_id ? parseInt(sku.size_attribute_id) : null,
        color_attribute_id: sku.color_attribute_id ? parseInt(sku.color_attribute_id) : null,
      }))
      
      const data = {
        ...productForm,
        category: parseInt(productForm.category),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        images,
        skus,
      }
      
      await adminApi.createProduct(data)
      setShowProductModal(false)
      resetProductForm()
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create product')
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    
    try {
      const images = productForm.images.map((url, idx) => ({
        image_url: url,
        order: idx,
      }))
      
      const skus = productForm.skus.map(sku => ({
        sku: sku.sku,
        price: parseFloat(sku.price),
        quantity: parseInt(sku.quantity),
        size_attribute_id: sku.size_attribute_id ? parseInt(sku.size_attribute_id) : null,
        color_attribute_id: sku.color_attribute_id ? parseInt(sku.color_attribute_id) : null,
      }))
      
      const data = {
        ...productForm,
        category: parseInt(productForm.category),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        images,
        skus,
      }
      
      await adminApi.updateProduct(editingProduct.id.toString(), data)
      setShowProductModal(false)
      setEditingProduct(null)
      resetProductForm()
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update product')
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await adminApi.deleteProduct(id.toString())
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product')
    }
  }

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId.toString(), status)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update order status')
    }
  }

  const handleCreateCategory = async () => {
    try {
      await adminApi.createCategory(categoryForm)
      setShowCategoryModal(false)
      setCategoryForm({ name: '', description: '' })
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create category')
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return
    
    try {
      await adminApi.updateCategory(editingCategory.id.toString(), categoryForm)
      setShowCategoryModal(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '' })
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update category')
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await adminApi.deleteCategory(id.toString())
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete category')
    }
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      summary: '',
      description: '',
      category: '',
      cover: '',
      original_price: '',
      featured: false,
      in_stock: true,
      images: [],
      skus: [],
    })
    setEditingProduct(null)
  }

  const addSKU = () => {
    setProductForm({
      ...productForm,
      skus: [...productForm.skus, {
        sku: '',
        price: '',
        quantity: '',
        size_attribute_id: '',
        color_attribute_id: '',
      }]
    })
  }

  const removeSKU = (index: number) => {
    setProductForm({
      ...productForm,
      skus: productForm.skus.filter((_, i) => i !== index)
    })
  }

  const updateSKU = (index: number, field: string, value: string) => {
    const updatedSKUs = [...productForm.skus]
    updatedSKUs[index] = { ...updatedSKUs[index], [field]: value }
    setProductForm({ ...productForm, skus: updatedSKUs })
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      summary: product.summary || '',
      description: product.description,
      category: product.category.toString(),
      cover: product.cover || '',
      original_price: product.original_price?.toString() || '',
      featured: product.featured,
      in_stock: product.in_stock,
      images: product.images.map(img => img.image_url),
      skus: product.skus?.map((sku: any) => ({
        sku: sku.sku || '',
        price: sku.price?.toString() || '',
        quantity: sku.quantity?.toString() || '',
        size_attribute_id: sku.size_attribute?.toString() || '',
        color_attribute_id: sku.color_attribute?.toString() || '',
      })) || [],
    })
    setShowProductModal(true)
  }

  const openEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    })
    setShowCategoryModal(true)
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'products', label: 'Products', icon: '📦' },
    { key: 'orders', label: 'Orders', icon: '🛒' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'categories', label: 'Categories', icon: '📁' },
  ]

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdminAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-background border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-medium">Admin Dashboard</h1>
              <p className="text-sm text-background/80 mt-1">Manage your e-commerce platform</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-background/70">Administrator</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAdminLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-soft p-1 rounded-lg border border-soft">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-all rounded-md ${
                activeTab === tab.key
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-neutral-600 hover:text-primary'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between"
          >
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && stats && (
            <AdminDashboard stats={stats} />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              onEdit={openEditProduct}
              onDelete={handleDeleteProduct}
              onCreate={() => { resetProductForm(); setShowProductModal(true) }}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              statusFilter={orderStatusFilter}
              onStatusFilterChange={setOrderStatusFilter}
              onStatusUpdate={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsers users={users} />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              onEdit={openEditCategory}
              onDelete={handleDeleteCategory}
              onCreate={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '' }); setShowCategoryModal(true) }}
            />
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => { setShowProductModal(false); resetProductForm() }}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        sizeAttributes={sizeAttributes}
        colorAttributes={colorAttributes}
        isEditing={!!editingProduct}
        addSKU={addSKU}
        removeSKU={removeSKU}
        updateSKU={updateSKU}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); setCategoryForm({ name: '', description: '' }) }}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        isEditing={!!editingCategory}
      />
    </div>
  )
}

export default AdminPage
