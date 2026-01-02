import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user, addOrder } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      const address = {
        id: Date.now().toString(),
        name: formData.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone: formData.phone,
        isDefault: true,
      }

      addOrder({
        items,
        total: getTotalPrice() + (getTotalPrice() >= 50 ? 0 : 5.99),
        address,
        status: 'pending',
      })

      clearCart()
      setIsProcessing(false)
      navigate('/profile?order=success')
    }, 2000)
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shipping

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-heading font-medium text-primary mb-12">Secure Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-10">
            {/* Shipping Address */}
            <section>
              <h2 className="text-lg font-heading font-medium text-primary mb-6 uppercase tracking-wider text-xs">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
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
            <div className="sticky top-24 border border-soft p-8">
              <h2 className="text-lg font-heading font-medium text-primary mb-6">Order Summary</h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm pb-4 border-b border-soft">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover"
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
                disabled={isProcessing || items.length === 0}
                variant="primary"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
