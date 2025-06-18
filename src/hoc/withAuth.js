import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Higher-Order Component for authentication
 * Wraps any component and ensures user is authenticated before rendering
 *
 * Usage:
 * const ProtectedComponent = withAuth(YourComponent)
 *
 * @param {React.Component} WrappedComponent - Component to protect
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - Where to redirect if not authenticated
 * @param {Array} options.allowedRoles - Roles allowed to access this component
 * @returns {React.Component} - Protected component
 */
const withAuth = (WrappedComponent, options = {}) => {
  const { redirectTo = '/login', allowedRoles = [] } = options

  const AuthenticatedComponent = (props) => {
    const { isAuthenticated, isLoading, user } = useAuth()

    const navigate = useNavigate()
    const location = useLocation()

    // Show loading spinner while checking authentication
    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <CSpinner color="primary" variant="grow" />
          <span className="ms-2">Checking authentication...</span>
        </div>
      )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate(redirectTo, {
        state: { from: location },
        replace: true,
      })
      return null
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0) {
      const userRole = user?.role || user?.roles || []
      const hasPermission = allowedRoles.some((role) => {
        if (Array.isArray(userRole)) {
          return userRole.includes(role)
        }
        return userRole === role
      })

      if (!hasPermission) {
        navigate('/404', { replace: true })
        return null
      }
    }

    // User is authenticated and authorized, render the component
    return <WrappedComponent {...props} />
  }

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`

  return AuthenticatedComponent
}

export default withAuth
