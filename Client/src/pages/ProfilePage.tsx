import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { addressApi, orderApi, userApi } from '../api/axios.api'
import { getErrorMessage } from '../utils/errorHandler'
import type { Address, Order } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import { fadeInUp } from '../utils/animations'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuth()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders')
  
  // Address management
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    is_default: false,
  })

  // Profile editing
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  })

  useEffect(() => {
    if (searchParams.get('order') === 'success') {
      setShowSuccessModal(true)
      searchParams.delete('order')
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load orders
      const ordersResponse = await orderApi.getOrders()
      const transformedOrders = ordersResponse.data.data.map((order: any) => ({
        id: order.id.toString(),
        date: order.created_at,
        items: order.items.map((item: any) => ({
          id: item.id.toString(),
          productId: item.product.toString(),
          name: item.product_name || 'Product',
          image: item.product_image || '',
          price: parseFloat(item.price),
          size: item.sku?.size || '',
          color: item.sku?.color || '',
          quantity: item.quantity,
        })),
        total: parseFloat(order.total),
        address: order.address_details ? {
          id: order.address_details.id.toString(),
          name: order.address_details.name,
          street: order.address_details.street,
          city: order.address_details.city,
          state: order.address_details.state,
          zipCode: order.address_details.zip_code,
          phone: order.address_details.phone,
        } : {
          id: '',
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
        },
        status: order.status,
      }))
      setOrders(transformedOrders)

      // Load addresses
      const addressesResponse = await addressApi.getAddresses()
      const transformedAddresses = addressesResponse.data.data.map((addr: any) => ({
        ...addr,
        zipCode: addr.zip_code || addr.zipCode,
        isDefault: addr.is_default || addr.isDefault
      }))
      setAddresses(transformedAddresses)
    } catch (error) {
      console.error('Failed to load data:', error)
      setError(getErrorMessage(error, 'Failed to load your data. Please refresh the page.'))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAddress = async () => {
    try {
      if (editingAddress) {
        const addrId = typeof editingAddress.id === 'number' ? editingAddress.id : parseInt(editingAddress.id)
        await addressApi.updateAddress(addrId.toString(), addressForm)
      } else {
        await addressApi.createAddress(addressForm)
      }
      setShowAddressModal(false)
      setEditingAddress(null)
      setAddressForm({
        name: '',
        street: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        is_default: false,
      })
      loadData()
      setError('')
    } catch (error) {
      console.error('Failed to save address:', error)
      setError(getErrorMessage(error, 'Failed to save address. Please try again.'))
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code || address.zipCode || '',
      phone: address.phone,
      is_default: address.isDefault || address.is_default || false,
    })
    setShowAddressModal(true)
  }

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressApi.deleteAddress(id.toString())
        loadData()
        setError('')
      } catch (error) {
        console.error('Failed to delete address:', error)
        setError(getErrorMessage(error, 'Failed to delete address. Please try again.'))
      }
    }
  }

  const handleSaveProfile = async () => {
    try {
      await userApi.updateProfile(profileForm)
      setShowProfileEdit(false)
      // Reload user data
      window.location.reload() // Simple reload to get updated user data
    } catch (error) {
      console.error('Failed to update profile:', error)
      setError(getErrorMessage(error, 'Failed to update profile. Please try again.'))
    }
  }

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await addressApi.updateAddress(id.toString(), { is_default: true })
      loadData()
      setError('')
    } catch (error) {
      console.error('Failed to set default address:', error)
      setError(getErrorMessage(error, 'Failed to set default address. Please try again.'))
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
        <p className="text-sm text-neutral-600 mb-6">Please sign in to view your account</p>
        <Button variant="outline" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-heading font-medium text-primary">My Account</h1>
        <Button variant="outline" size="sm" onClick={logout}>
          Sign Out
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="mb-6 bg-soft border border-primary/20 text-primary px-4 py-3 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-neutral-600 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-soft">
        {[
          { key: 'orders', label: 'My Orders' },
          { key: 'addresses', label: 'Addresses' },
          { key: 'profile', label: 'Profile' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-600 hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-heading font-medium text-primary mb-8 uppercase tracking-wider text-xs">
            My Orders
          </h2>
          
          {orders.length === 0 ? (
            <div className="border border-soft p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-neutral-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm text-neutral-600 mb-2">No orders yet</p>
              <p className="text-xs text-neutral-500 mb-8">Start exploring our collection</p>
              <Button variant="outline" onClick={() => navigate('/products')}>
                Explore Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-soft p-6"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
                        Order #{order.id}
                      </h3>
                      <p className="text-xs text-neutral-600">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-medium text-primary mb-1">
                        Rs. {order.total.toFixed(2)}
                      </p>
                      <span className="text-xs text-neutral-600 uppercase tracking-wider">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {order.items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center gap-3 text-xs">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover"
                          style={{
                            objectPosition: 'center top',
                            objectFit: 'cover'
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-primary">{item.name}</p>
                          <p className="text-neutral-600 uppercase tracking-wider text-[10px]">
                            {item.size} • {item.color} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-primary font-medium">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-neutral-600">
                        +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'piece' : 'pieces'}
                      </p>
                    )}
                  </div>

                  {order.address && order.address.street && (
                    <div className="pt-4 border-t border-soft">
                      <p className="text-xs text-neutral-600 mb-1 uppercase tracking-wider">Shipping Address</p>
                      <p className="text-xs text-primary">
                        {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-soft mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-heading font-medium text-primary uppercase tracking-wider text-xs">
              Saved Addresses
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingAddress(null)
                setAddressForm({
                  name: '',
                  street: '',
                  city: '',
                  state: '',
                  zip_code: '',
                  phone: '',
                  is_default: addresses.length === 0,
                })
                setShowAddressModal(true)
              }}
            >
              Add New Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="border border-soft p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-neutral-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-sm text-neutral-600 mb-2">No addresses saved</p>
              <p className="text-xs text-neutral-500 mb-8">Add an address for faster checkout</p>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingAddress(null)
                  setAddressForm({
                    name: '',
                    street: '',
                    city: '',
                    state: '',
                    zip_code: '',
                    phone: '',
                    is_default: true,
                  })
                  setShowAddressModal(true)
                }}
              >
                Add Address
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => {
                const addrId = typeof address.id === 'number' ? address.id : parseInt(address.id)
                return (
                  <motion.div
                    key={addrId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-soft p-6 relative"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-primary text-sm mb-1">{address.name}</h3>
                        {(address.isDefault || address.is_default) && (
                          <span className="inline-block text-[10px] text-primary uppercase tracking-wider border border-primary px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">
                      {address.street}
                    </p>
                    <p className="text-xs text-neutral-600 mb-2">
                      {address.city}, {address.state} {address.zip_code || address.zipCode}
                    </p>
                    <p className="text-xs text-neutral-600 mb-4">{address.phone}</p>
                    <div className="flex gap-2 pt-4 border-t border-soft">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        Edit
                      </Button>
                      {!(address.isDefault || address.is_default) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultAddress(addrId)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAddress(addrId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="border border-soft p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl font-heading font-medium text-background">
                      {user.first_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-primary">
                      {user.first_name} {user.last_name} {!user.first_name && !user.last_name && user.username}
                    </h2>
                    <p className="text-xs text-neutral-600">{user.email}</p>
                    {user.phone_number && (
                      <p className="text-xs text-neutral-600">{user.phone_number}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setProfileForm({
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                      phone_number: user.phone_number || '',
                    })
                    setShowProfileEdit(true)
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-heading font-medium text-primary mb-8 uppercase tracking-wider text-xs">
                Account Information
              </h2>
              <div className="border border-soft p-8 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <p className="text-sm text-neutral-600">{user.email}</p>
                  <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <p className="text-sm text-neutral-600">
                    {user.first_name} {user.last_name} {!user.first_name && !user.last_name && user.username}
                  </p>
                </div>
                {user.phone_number && (
                  <div>
                    <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <p className="text-sm text-neutral-600">{user.phone_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false)
          setEditingAddress(null)
          setAddressForm({
            name: '',
            street: '',
            city: '',
            state: '',
            zip_code: '',
            phone: '',
            is_default: false,
          })
        }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <div className="space-y-4">
          <Input
            label="Address Name (e.g., Home, Office)"
            name="name"
            value={addressForm.name}
            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
            placeholder="Home"
            required
          />
          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={addressForm.phone}
            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
            required
          />
          <Input
            label="Street Address"
            name="street"
            value={addressForm.street}
            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              required
            />
            <Input
              label="State"
              name="state"
              value={addressForm.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              required
            />
          </div>
          <Input
            label="ZIP Code"
            name="zip_code"
            value={addressForm.zip_code}
            onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })}
            required
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={addressForm.is_default}
              onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
              className="border-soft"
            />
            <span className="text-xs text-neutral-600">Set as default address</span>
          </label>
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowAddressModal(false)
                setEditingAddress(null)
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleSaveAddress}
            >
              Save Address
            </Button>
          </div>
        </div>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <Input
            label="First Name"
            name="first_name"
            value={profileForm.first_name}
            onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
          />
          <Input
            label="Last Name"
            name="last_name"
            value={profileForm.last_name}
            onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
          />
          <Input
            label="Phone Number"
            name="phone_number"
            type="tel"
            value={profileForm.phone_number}
            onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
          />
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowProfileEdit(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Order Confirmed"
      >
        <div className="text-center py-4">
          <p className="text-sm text-neutral-600 mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowSuccessModal(false)}
            >
              Continue Shopping
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setShowSuccessModal(false)
                setActiveTab('orders')
              }}
            >
              View Orders
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfilePage
