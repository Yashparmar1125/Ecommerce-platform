import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { addressApi, orderApi } from '../api/axios.api'
import { productService } from '../services/productService'
import type { Address } from '../types'
import Button from '../components/Button'
import Input from '../components/Input'
import { fadeInUp } from '../utils/animations'

interface ProductSKU {
  id: number
  sku: string
  color: string
  size: string
  price: number
  quantity: number
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [productSKUs, setProductSKUs] = useState<Record<string, ProductSKU[]>>({})
  const [loadingSKUs, setLoadingSKUs] = useState(true)

  const [formData, setFormData] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await addressApi.getAddresses()
        const loadedAddresses = response.data.map((addr: any) => ({
          ...addr,
          zipCode: addr.zip_code || addr.zipCode,
          isDefault: addr.is_default || addr.isDefault
        }))
        setAddresses(loadedAddresses)
        
        // Select default address if exists
        const defaultAddr = loadedAddresses.find((a: Address) => a.isDefault || a.is_default)
        if (defaultAddr) {
          setSelectedAddressId(typeof defaultAddr.id === 'number' ? defaultAddr.id : parseInt(defaultAddr.id))
        }
      } catch (error) {
        console.error('Failed to load addresses:', error)
      } finally {
        setLoadingAddresses(false)
      }
    }
    loadAddresses()
  }, [])

  // Load SKUs for all products in cart
  useEffect(() => {
    const loadSKUs = async () => {
      try {
        const skuMap: Record<string, ProductSKU[]> = {}
        for (const item of items) {
          try {
            const response = await productService.getProductById(item.productId)
            if (response) {
              // Fetch SKUs for this product
              const skuResponse = await fetch(`http://localhost:8000/api/v1/products/${item.productId}/skus`)
              if (skuResponse.ok) {
                const data = await skuResponse.json()
                skuMap[item.productId] = data.skus || []
              }
            }
          } catch (err) {
            console.error(`Failed to load SKUs for product ${item.productId}:`, err)
          }
        }
        setProductSKUs(skuMap)
      } catch (error) {
        console.error('Failed to load SKUs:', error)
      } finally {
        setLoadingSKUs(false)
      }
    }
    if (items.length > 0) {
      loadSKUs()
    } else {
      setLoadingSKUs(false)
    }
  }, [items])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError('')
  }

  const findSKUId = (productId: string, size: string, color: string): number | null => {
    const skus = productSKUs[productId] || []
    const sku = skus.find(s => 
      s.size.toLowerCase() === size.toLowerCase() && 
      s.color.toLowerCase() === color.toLowerCase()
    )
    return sku ? sku.id : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)

    try {
      let addressId: number | null = null

      // If using existing address
      if (selectedAddressId && !showNewAddressForm) {
        addressId = selectedAddressId
      } else {
        // Create new address
        const addressData = {
          name: formData.name || 'Home',
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          phone: formData.phone,
          is_default: addresses.length === 0, // Set as default if first address
        }

        const addressResponse = await addressApi.createAddress(addressData)
        addressId = addressResponse.data.id
      }

      // Prepare order items with SKU IDs or size/color
      const orderItems = []
      for (const item of items) {
        const skuId = findSKUId(item.productId, item.size, item.color)
        const orderItem: any = {
          product_id: parseInt(item.productId),
          quantity: item.quantity,
        }
        
        if (skuId) {
          orderItem.sku_id = skuId
        } else {
          // Fallback to size and color if SKU ID not found
          orderItem.size = item.size
          orderItem.color = item.color
        }
        
        orderItems.push(orderItem)
      }

      // Create order
      const orderData = {
        address_id: addressId,
        items: orderItems,
      }

      const orderResponse = await orderApi.createOrder(orderData)
      
      clearCart()
      navigate('/profile?order=success')
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to place order. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressApi.deleteAddress(id.toString())
        setAddresses(prev => prev.filter(a => {
          const addrId = typeof a.id === 'number' ? a.id : parseInt(a.id)
          return addrId !== id
        }))
        if (selectedAddressId === id) {
          setSelectedAddressId(null)
          setShowNewAddressForm(true)
        }
      } catch (error) {
        console.error('Failed to delete address:', error)
      }
    }
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shipping

  if (loadingAddresses || loadingSKUs) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary">Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-heading font-medium text-primary mb-12">Secure Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-10">
            {/* Shipping Address */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-heading font-medium text-primary uppercase tracking-wider text-xs">
                  Shipping Address
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewAddressForm(!showNewAddressForm)
                    setSelectedAddressId(null)
                  }}
                >
                  {showNewAddressForm ? 'Use Saved Address' : 'Add New Address'}
                </Button>
              </div>

              {error && (
                <motion.div
                  className="bg-soft border border-primary/20 text-primary px-4 py-3 text-sm mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {!showNewAddressForm && addresses.length > 0 && (
                <div className="space-y-3 mb-6">
                  {addresses.map((address) => {
                    const addrId = typeof address.id === 'number' ? address.id : parseInt(address.id)
                    return (
                      <motion.label
                        key={addrId}
                        className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${
                          selectedAddressId === addrId
                            ? 'border-primary bg-soft'
                            : 'border-soft hover:border-primary'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addrId}
                          onChange={() => setSelectedAddressId(addrId)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-primary text-sm">{address.name}</p>
                              <p className="text-xs text-neutral-600 mt-1">
                                {address.street}, {address.city}, {address.state} {address.zip_code || address.zipCode}
                              </p>
                              <p className="text-xs text-neutral-600">{address.phone}</p>
                              {(address.isDefault || address.is_default) && (
                                <span className="inline-block mt-2 text-[10px] text-primary uppercase tracking-wider border border-primary px-2 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAddress(addrId)
                              }}
                              className="text-neutral-400 hover:text-primary transition-colors text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.label>
                    )
                  })}
                </div>
              )}

              {(showNewAddressForm || addresses.length === 0) && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Input
                    label="Address Name (e.g., Home, Office)"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Home"
                    required={showNewAddressForm || addresses.length === 0}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required={showNewAddressForm || addresses.length === 0}
                  />
                  <Input
                    label="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required={showNewAddressForm || addresses.length === 0}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required={showNewAddressForm || addresses.length === 0}
                    />
                    <Input
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required={showNewAddressForm || addresses.length === 0}
                    />
                  </div>
                  <Input
                    label="ZIP Code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    required={showNewAddressForm || addresses.length === 0}
                  />
                </motion.div>
              )}
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-lg font-heading font-medium text-primary mb-6 uppercase tracking-wider text-xs">
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-soft cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium text-primary block">Cash on Delivery</span>
                    <p className="text-xs text-neutral-600">Pay when you receive</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-soft cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium text-primary block">Credit/Debit Card</span>
                    <p className="text-xs text-neutral-600">Secure payment</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-24 border border-soft p-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <h2 className="text-lg font-heading font-medium text-primary mb-6">Order Summary</h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm pb-4 border-b border-soft">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover"
                      style={{
                        objectPosition: 'center top',
                        objectFit: 'cover'
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-primary text-xs">{item.name}</p>
                      <p className="text-neutral-600 text-xs uppercase tracking-wider mt-1">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="text-primary font-medium text-xs mt-2">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 border-t border-soft pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-primary font-medium">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-primary font-medium">
                    {shipping === 0 ? 'Complimentary' : `Rs. ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-soft">
                  <span className="font-medium text-primary">Total</span>
                  <span className="text-lg font-medium text-primary">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isProcessing || items.length === 0 || (!selectedAddressId && !showNewAddressForm && addresses.length > 0)}
                variant="primary"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
