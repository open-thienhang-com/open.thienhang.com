import { CAlert, CCard, CCardBody, CCardHeader, CButton } from '@coreui/react'
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { verifyHttpOnlyCookiesExist } from '../utils/cookies'

const AuthDebug = () => {
  const { isAuthenticated, isLoading, user, error } = useAuth()

  const handleVerifyCookies = async () => {
    console.log('🔍 Manual verification of HttpOnly cookies...')
    const result = await verifyHttpOnlyCookiesExist()
    console.log('🔍 Verification result:', result)
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>🐛 Authentication Debug Info (HttpOnly Cookies)</strong>
      </CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <h6>📊 Current State:</h6>
          <ul>
            <li>
              <strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
            </li>
            <li>
              <strong>Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}
            </li>
            <li>
              <strong>User Data:</strong> {user?.email || 'None'}
            </li>
            <li>
              <strong>Error:</strong> {error || 'None'}
            </li>
          </ul>
        </div>

        <div className="mb-3">
          <h6>🍪 HttpOnly Cookies:</h6>
          <p className="text-muted">
            Access and refresh tokens are stored as HttpOnly cookies by the server. JavaScript
            cannot read these cookies directly for security.
          </p>
          <CButton color="info" size="sm" onClick={handleVerifyCookies}>
            Verify HttpOnly Cookies
          </CButton>
        </div>

        <div className="mt-4">
          <h6>🔍 Recommendations:</h6>
          {!isAuthenticated && !isLoading && (
            <CAlert color="warning">User should see login page</CAlert>
          )}
          {isAuthenticated && !isLoading && (
            <CAlert color="success">User should see dashboard - HttpOnly cookies working</CAlert>
          )}
          {isLoading && <CAlert color="info">System is checking authentication</CAlert>}
          {error && <CAlert color="danger">There's an error: {error}</CAlert>}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default AuthDebug
