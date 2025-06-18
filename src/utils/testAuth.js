import {
  getAccessToken,
  getRefreshToken,
  getUserData,
  setAccessToken,
  setRefreshToken,
  setUserData,
  clearAuthCookies,
  isTokenExpired,
  debugCookies,
} from './cookies'

/**
 * Test authentication flow with mock data
 */
export const testAuthFlow = () => {
  console.log('🧪 Testing authentication flow...')

  // Clear existing cookies
  clearAuthCookies()

  // Mock login response data
  const mockLoginResponse = {
    access_token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTksImlkZW50aXR5IjoidGVzdC11c2VyIn0.example',
    refresh_token: 'refresh_token_example_123456789',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    token_type: 'Bearer',
    scope: 'read write',
  }

  const mockUserData = {
    id: 'test-user',
    email: 'duy@thienhang.com',
    token_type: mockLoginResponse.token_type,
    scope: mockLoginResponse.scope,
    expires_at: mockLoginResponse.expires_at,
    loginTime: new Date().toISOString(),
  }

  // Test setting cookies
  console.log('🧪 Setting mock tokens and user data...')
  setAccessToken(mockLoginResponse.access_token, mockLoginResponse.expires_at)
  setRefreshToken(mockLoginResponse.refresh_token)
  setUserData(mockUserData)

  // Test getting cookies
  console.log('🧪 Testing cookie retrieval...')
  const token = getAccessToken()
  const refresh = getRefreshToken()
  const userData = getUserData()

  console.log('🧪 Retrieved token:', !!token)
  console.log('🧪 Retrieved refresh:', !!refresh)
  console.log('🧪 Retrieved user data:', !!userData)

  // Test token expiration
  const expired = isTokenExpired(token)
  console.log('🧪 Token expired:', expired)

  // Debug all cookies
  debugCookies()

  return {
    success: !!(token && refresh && userData && !expired),
    token: !!token,
    refresh: !!refresh,
    userData: !!userData,
    expired,
  }
}

/**
 * Test cookie persistence (call this after page refresh)
 */
export const testPersistence = () => {
  console.log('🧪 Testing cookie persistence after page reload...')

  const token = getAccessToken()
  const refresh = getRefreshToken()
  const userData = getUserData()

  const hasValidAuth = !!(token && !isTokenExpired(token) && userData)

  console.log('🧪 Persistence test results:', {
    hasToken: !!token,
    hasRefresh: !!refresh,
    hasUserData: !!userData,
    tokenValid: token ? !isTokenExpired(token) : false,
    overallValid: hasValidAuth,
  })

  return hasValidAuth
}

// Make test functions available globally
if (typeof window !== 'undefined') {
  window.testAuthFlow = testAuthFlow
  window.testPersistence = testPersistence
}
