import React from 'react'
import Button from '../Button'
import Input from '../Input'
import Modal from '../Modal'

interface CategoryFormData {
  name: string
  description: string
}

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  categoryForm: CategoryFormData
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryFormData>>
  isEditing: boolean
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categoryForm,
  setCategoryForm,
  isEditing,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create Category'}
    >
      <div className="space-y-6">
        <Input
          label="Category Name"
          value={categoryForm.name}
          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
          required
        />
        <div>
          <label className="block text-xs font-medium text-primary uppercase tracking-wider mb-3">
            Description
          </label>
          <textarea
            className="w-full px-4 py-3 border border-soft focus:outline-none focus:border-primary transition-colors bg-background text-sm"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            rows={4}
            placeholder="Enter category description..."
          />
        </div>
        <div className="flex gap-4 pt-4 border-t border-soft">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button fullWidth onClick={onSubmit}>
            {isEditing ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CategoryFormModal



