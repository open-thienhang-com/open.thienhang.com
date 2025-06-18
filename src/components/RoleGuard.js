import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CAlert } from '@coreui/react'

const RoleGuard = ({
  children,
  allowedRoles = [],
  fallbackComponent = null,
  redirectTo = '/404',
}) => {
  const { user, isAuthenticated } = useAuth()

  // If not authenticated, don't render anything (let ProtectedRoute handle it)
  if (!isAuthenticated) {
    return null
  }

  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return children
  }

  // Check if user has required role
  const userRole = user?.role || user?.roles || []
  const hasPermission = allowedRoles.some((role) => {
    if (Array.isArray(userRole)) {
      return userRole.includes(role)
    }
    return userRole === role
  })

  if (!hasPermission) {
    // Show fallback component or redirect
    if (fallbackComponent) {
      return fallbackComponent
    }

    if (redirectTo === 'alert') {
      return (
        <div className="container mt-4">
          <CAlert color="danger">
            <h4>Access Denied</h4>
            <p>You don't have permission to access this page.</p>
          </CAlert>
        </div>
      )
    }

    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default RoleGuard
