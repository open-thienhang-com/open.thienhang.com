import React from 'react'
import { CCard, CCardBody, CCardHeader, CAlert } from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'
import { getAccessToken, getRefreshToken, getUserData, isTokenExpired } from '../utils/cookies'

const AuthDebug = () => {
  const { isAuthenticated, isLoading, user, error } = useAuth()

  const token = getAccessToken()
  const refreshToken = getRefreshToken()
  const userData = getUserData()
  const tokenExpired = token ? isTokenExpired(token) : 'No token'

  const debugInfo = {
    'Auth Context': {
      isAuthenticated,
      isLoading,
      user: user?.email || 'None',
      error: error || 'None',
    },
    Cookies: {
      'Access Token': token ? `${token.substring(0, 20)}...` : 'None',
      'Refresh Token': refreshToken ? `${refreshToken.substring(0, 20)}...` : 'None',
      'User Data': userData ? `${userData.email} (ID: ${userData.id})` : 'None',
      'Token Expired': tokenExpired,
    },
    'Current State': {
      'Should Show Login': !isAuthenticated && !isLoading,
      'Should Show Dashboard': isAuthenticated && !isLoading,
      'Should Show Loading': isLoading,
    },
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>🐛 Authentication Debug Info</strong>
      </CCardHeader>
      <CCardBody>
        {Object.entries(debugInfo).map(([section, data]) => (
          <div key={section} className="mb-3">
            <h6>{section}:</h6>
            {Object.entries(data).map(([key, value]) => (
              <CAlert
                key={key}
                color={
                  key.includes('Error') && value !== 'None'
                    ? 'danger'
                    : key.includes('Authenticated') && value
                      ? 'success'
                      : key.includes('Loading') && value
                        ? 'warning'
                        : 'info'
                }
                className="py-2 px-3 mb-1"
              >
                <strong>{key}:</strong> {String(value)}
              </CAlert>
            ))}
          </div>
        ))}

        <div className="mt-4">
          <h6>🔍 Recommendations:</h6>
          {!isAuthenticated && !isLoading && (
            <CAlert color="warning">User should see login page</CAlert>
          )}
          {isAuthenticated && !isLoading && (
            <CAlert color="success">User should see dashboard</CAlert>
          )}
          {isLoading && <CAlert color="info">System is checking authentication</CAlert>}
          {error && <CAlert color="danger">There's an error: {error}</CAlert>}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default AuthDebug
