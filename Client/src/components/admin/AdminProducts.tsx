import React from 'react'
import { motion } from 'framer-motion'
import Button from '../Button'
import type { Product } from '../../types/admin'

interface AdminProductsProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

const AdminProducts: React.FC<AdminProductsProps> = ({ products, onEdit, onDelete, onCreate }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-medium text-primary">Products</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={onCreate}>
          + Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="border border-soft border-dashed p-12 text-center bg-soft">
          <p className="text-sm text-neutral-600 mb-2">No products found</p>
          <p className="text-xs text-neutral-500 mb-6">Get started by creating your first product</p>
          <Button onClick={onCreate}>Create Product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-soft bg-background hover:border-primary transition-colors p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-primary mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-neutral-600 mb-3">{product.category_name}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.featured && (
                      <span className="text-xs bg-primary text-background px-2 py-1 uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                    {product.in_stock ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 uppercase tracking-wider">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 uppercase tracking-wider">
                        Out of Stock
                      </span>
                    )}
                    {product.skus && product.skus.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 uppercase tracking-wider">
                        {product.skus.length} SKU{product.skus.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-soft">
                <Button variant="outline" size="sm" fullWidth onClick={() => onEdit(product)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" fullWidth onClick={() => onDelete(product.id)}>
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminProducts

