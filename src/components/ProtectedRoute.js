import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  console.log('🔒 ProtectedRoute - Auth status:', {
    isAuthenticated,
    isLoading,
    path: location.pathname,
  })

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ ProtectedRoute - Still loading, showing spinner')
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <CSpinner color="primary" variant="grow" />
        <span className="ms-2">Checking authentication...</span>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated, render the protected component
  console.log('✅ ProtectedRoute - Authenticated, rendering children')
  return children
}

export default ProtectedRoute
