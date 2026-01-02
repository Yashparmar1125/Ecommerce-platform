import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../Button'
import Input from '../Input'
import Select from '../Select'
import Modal from '../Modal'

interface ProductFormData {
  name: string
  summary: string
  description: string
  category: string
  cover: string
  original_price: string
  featured: boolean
  in_stock: boolean
  images: string[]
  skus: Array<{
    sku: string
    price: string
    quantity: string
    size_attribute_id: string
    color_attribute_id: string
  }>
}

interface Category {
  id: number
  name: string
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  productForm: ProductFormData
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormData>>
  categories: Category[]
  sizeAttributes: Array<{ id: number; value: string }>
  colorAttributes: Array<{ id: number; value: string }>
  isEditing: boolean
  addSKU: () => void
  removeSKU: (index: number) => void
  updateSKU: (index: number, field: string, value: string) => void
}

const steps = [
  { id: 1, title: 'Basic Info', icon: '📝' },
  { id: 2, title: 'Pricing', icon: '💰' },
  { id: 3, title: 'Images', icon: '🖼️' },
  { id: 4, title: 'SKUs', icon: '📦' },
]

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productForm,
  setProductForm,
  categories,
  sizeAttributes,
  colorAttributes,
  isEditing,
  addSKU,
  removeSKU,
  updateSKU,
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  const validateStep = (step: number): boolean => {
    const errors: string[] = []
    
    switch (step) {
      case 1:
        if (!productForm.name?.trim()) errors.push('Product name is required')
        if (!productForm.summary?.trim()) errors.push('Summary is required')
        if (!productForm.description?.trim()) errors.push('Description is required')
        const categoryId = productForm.category?.trim()
        if (!categoryId || categoryId === '' || categoryId === '0' || !parseInt(categoryId)) {
          errors.push('Category is required')
        }
        break
      case 2:
        // Pricing is optional, no validation needed
        break
      case 3:
        // Images are optional, no validation needed
        break
      case 4:
        if (productForm.skus.length > 0) {
          productForm.skus.forEach((sku, index) => {
            if (!sku.sku?.trim()) errors.push(`SKU #${index + 1}: SKU code is required`)
            if (!sku.price || parseFloat(sku.price) <= 0) errors.push(`SKU #${index + 1}: Valid price is required`)
            if (!sku.quantity || parseInt(sku.quantity) < 0) errors.push(`SKU #${index + 1}: Valid quantity is required`)
          })
        }
        break
      default:
        break
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
        setValidationErrors([])
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setValidationErrors([])
    onClose()
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit()
      setCurrentStep(1)
      setValidationErrors([])
    }
  }

  // Reset step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setValidationErrors([])
      setNewImageUrl('')
    }
  }, [isOpen])

  // Clear validation errors when step changes
  useEffect(() => {
    setValidationErrors([])
  }, [currentStep])

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Input
              label="Product Name"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
            <Input
              label="Summary"
              value={productForm.summary}
              onChange={(e) => setProductForm({ ...productForm, summary: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-3">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 border border-soft focus:outline-none focus:border-primary transition-colors bg-background text-sm"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={6}
                required
                placeholder="Enter detailed product description..."
              />
            </div>
            <Select
              label="Category"
              options={[
                { value: '', label: '-- Select a category --' },
                ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
              ]}
              value={productForm.category || ''}
              onChange={(e) => {
                setProductForm({ ...productForm, category: e.target.value })
                // Clear validation error when category is selected
                if (e.target.value && e.target.value !== '') {
                  setValidationErrors(prev => prev.filter(err => !err.includes('Category')))
                }
              }}
              required
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <Input
              label="Cover Image URL"
              value={productForm.cover}
              onChange={(e) => setProductForm({ ...productForm, cover: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              label="Original Price"
              type="number"
              step="0.01"
              value={productForm.original_price}
              onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
              placeholder="0.00"
            />
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-soft hover:border-primary transition-colors">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="w-4 h-4 text-primary border-soft focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-medium text-primary">Featured Product</span>
                  <p className="text-xs text-neutral-600">Show this product prominently on the homepage</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-soft hover:border-primary transition-colors">
                <input
                  type="checkbox"
                  checked={productForm.in_stock}
                  onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                  className="w-4 h-4 text-primary border-soft focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-medium text-primary">In Stock</span>
                  <p className="text-xs text-neutral-600">Product is available for purchase</p>
                </div>
              </label>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-3">
                Product Images
              </label>
              <p className="text-xs text-neutral-600 mb-4">
                Add image URLs one at a time. The first image will be used as the cover image.
              </p>
              
              {/* Add Image URL Input */}
              <div className="flex gap-2 mb-4">
                <Input
                  label=""
                  placeholder="https://example.com/image.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const url = newImageUrl.trim()
                      if (url && !productForm.images.includes(url)) {
                        setProductForm({
                          ...productForm,
                          images: [...productForm.images, url]
                        })
                        setNewImageUrl('')
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = newImageUrl.trim()
                    if (url && !productForm.images.includes(url)) {
                      setProductForm({
                        ...productForm,
                        images: [...productForm.images, url]
                      })
                      setNewImageUrl('')
                    }
                  }}
                  className="mt-6"
                >
                  Add
                </Button>
              </div>

              {/* Image URL List */}
              {productForm.images.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-neutral-600 uppercase tracking-wider">
                    Added Images ({productForm.images.length})
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {productForm.images.map((url, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 border border-soft bg-background hover:border-primary transition-colors"
                      >
                        <span className="text-xs text-neutral-500 w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => {
                            const newImages = [...productForm.images]
                            newImages[idx] = e.target.value
                            setProductForm({ ...productForm, images: newImages })
                          }}
                          className="flex-1 px-2 py-1 text-xs border border-soft focus:outline-none focus:border-primary bg-background"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              images: productForm.images.filter((_, i) => i !== idx)
                            })
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Add - Paste Multiple URLs */}
              <div className="pt-4 border-t border-soft">
                <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-3">
                  Or Paste Multiple URLs (one per line)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-soft focus:outline-none focus:border-primary transition-colors bg-background text-sm"
                  rows={3}
                  placeholder="Paste multiple URLs here, one per line..."
                  onPaste={(e) => {
                    e.preventDefault()
                    const pastedText = e.clipboardData.getData('text')
                    const urls = pastedText
                      .split('\n')
                      .map(url => url.trim())
                      .filter(url => url && url.startsWith('http'))
                    
                    if (urls.length > 0) {
                      const newUrls = [...new Set([...productForm.images, ...urls])]
                      setProductForm({ ...productForm, images: newUrls })
                    }
                  }}
                />
              </div>

              {/* Image Preview */}
              {productForm.images.length > 0 && (
                <div className="pt-4 border-t border-soft">
                  <p className="text-xs text-neutral-600 mb-3 uppercase tracking-wider">
                    Preview ({productForm.images.length} image{productForm.images.length > 1 ? 's' : ''})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {productForm.images.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-square border border-soft overflow-hidden bg-soft">
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-neutral-400">Invalid URL</div>'
                              }
                            }}
                          />
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-primary text-background text-xs px-2 py-0.5 uppercase tracking-wider">
                            Cover
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              images: productForm.images.filter((_, i) => i !== idx)
                            })
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-background w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        >
                          ×
                        </button>
                        <button
                          onClick={() => {
                            if (idx > 0) {
                              const newImages = [...productForm.images]
                              ;[newImages[idx], newImages[0]] = [newImages[0], newImages[idx]]
                              setProductForm({ ...productForm, images: newImages })
                            }
                          }}
                          className="absolute bottom-1 left-1 bg-primary text-background text-xs px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider"
                          disabled={idx === 0}
                        >
                          Set Cover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {productForm.images.length === 0 && (
                <div className="text-center py-8 border border-soft border-dashed bg-soft">
                  <p className="text-sm text-neutral-600 mb-2">No images added</p>
                  <p className="text-xs text-neutral-500">Add image URLs above or paste multiple URLs</p>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-soft">
              <div>
                <h3 className="text-sm font-medium text-primary uppercase tracking-wider">
                  Product SKUs
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Create product variants with different sizes, colors, prices, and quantities
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addSKU}>
                + Add SKU
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {productForm.skus.map((sku, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-soft p-4 bg-background space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">SKU #{index + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeSKU(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="SKU Code"
                      value={sku.sku}
                      onChange={(e) => updateSKU(index, 'sku', e.target.value)}
                      placeholder="e.g., PROD-001"
                      required
                    />
                    <Input
                      label="Price"
                      type="number"
                      step="0.01"
                      value={sku.price}
                      onChange={(e) => updateSKU(index, 'price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Quantity"
                      type="number"
                      value={sku.quantity}
                      onChange={(e) => updateSKU(index, 'quantity', e.target.value)}
                      placeholder="0"
                      required
                    />
                    <Select
                      label="Size"
                      options={[
                        { value: '', label: 'No Size' },
                        ...sizeAttributes.map(attr => ({ value: attr.id.toString(), label: attr.value }))
                      ]}
                      value={sku.size_attribute_id}
                      onChange={(e) => updateSKU(index, 'size_attribute_id', e.target.value)}
                    />
                    <Select
                      label="Color"
                      options={[
                        { value: '', label: 'No Color' },
                        ...colorAttributes.map(attr => ({ value: attr.id.toString(), label: attr.value }))
                      ]}
                      value={sku.color_attribute_id}
                      onChange={(e) => updateSKU(index, 'color_attribute_id', e.target.value)}
                    />
                  </div>
                </motion.div>
              ))}
              {productForm.skus.length === 0 && (
                <div className="text-center py-12 border border-soft border-dashed bg-soft">
                  <p className="text-sm text-neutral-600 mb-2">No SKUs added</p>
                  <p className="text-xs text-neutral-500 mb-4">Click "Add SKU" to create product variants</p>
                  <Button variant="outline" size="sm" onClick={addSKU}>
                    Add Your First SKU
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Product' : 'Create Product'}
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    currentStep >= step.id ? 'text-primary' : 'text-neutral-400'
                  }`}
                  onClick={() => {
                    if (currentStep > step.id || validateStep(step.id)) {
                      setCurrentStep(step.id)
                    }
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep === step.id
                        ? 'border-primary bg-primary text-background'
                        : currentStep > step.id
                        ? 'border-primary bg-primary text-background'
                        : 'border-soft bg-background text-neutral-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <span className="text-sm">✓</span>
                    ) : (
                      <span className="text-sm">{step.icon}</span>
                    )}
                  </div>
                  <span className="text-xs mt-2 font-medium uppercase tracking-wider hidden sm:block">
                    {step.title}
                  </span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-primary' : 'bg-soft'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {getStepContent()}
            </motion.div>
          </AnimatePresence>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="font-medium text-red-700 mb-2 text-sm">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-xs text-red-600">{error}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-soft">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                ← Previous
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button 
                onClick={() => {
                  if (validateStep(currentStep)) {
                    handleNext()
                  }
                }}
              >
                Next →
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  if (validateStep(currentStep)) {
                    handleSubmit()
                  }
                }}
              >
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ProductFormModal
