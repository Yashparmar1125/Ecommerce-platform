import React from 'react'
import { motion } from 'framer-motion'
import Button from '../Button'
import type { Category } from '../../types/admin'

interface AdminCategoriesProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
  onCreate: () => void
}

const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onEdit,
  onDelete,
  onCreate,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-medium text-primary">Categories</h2>
          <p className="text-sm text-neutral-600 mt-1">Organize your products by category</p>
        </div>
        <Button onClick={onCreate}>
          + Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="border border-soft border-dashed p-12 text-center bg-soft">
          <p className="text-sm text-neutral-600 mb-2">No categories found</p>
          <p className="text-xs text-neutral-500 mb-6">Create categories to organize your products</p>
          <Button onClick={onCreate}>Create Category</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-soft bg-background hover:border-primary transition-colors p-5"
            >
              <h3 className="font-medium text-primary mb-2">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{category.description}</p>
              )}
              <div className="flex gap-2 pt-4 border-t border-soft">
                <Button variant="outline" size="sm" fullWidth onClick={() => onEdit(category)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" fullWidth onClick={() => onDelete(category.id)}>
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

export default AdminCategories

