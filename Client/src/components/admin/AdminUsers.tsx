import React from 'react'
import { motion } from 'framer-motion'
import type { User } from '../../types/admin'

interface AdminUsersProps {
  users: User[]
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-medium text-primary">Users</h2>
        <p className="text-sm text-neutral-600 mt-1">View and manage user accounts</p>
      </div>

      {users.length === 0 ? (
        <div className="border border-soft border-dashed p-12 text-center bg-soft">
          <p className="text-sm text-neutral-600">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-soft bg-background hover:border-primary transition-colors p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-background font-medium text-sm">
                        {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-primary text-sm">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username}
                      </h3>
                      <p className="text-xs text-neutral-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider">Orders</p>
                      <p className="text-sm font-medium text-primary">{user.order_count}</p>
                    </div>
                    {user.phone_number && (
                      <div>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider">Phone</p>
                        <p className="text-sm text-neutral-600">{user.phone_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-soft">
                {user.is_active ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 uppercase tracking-wider">
                    Active
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 uppercase tracking-wider">
                    Inactive
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminUsers

