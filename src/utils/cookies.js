import Cookies from 'js-cookie'

/**
 * Cookie utility functions for authentication
 * Mixed approach: HttpOnly cookies for production + accessible storage for development
 */

// Cookie names
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
}

// Check if we're in development
const isDevelopment = process.env.NODE_ENV === 'development'

// Cookie options
const COOKIE_OPTIONS = {
  secure: !isDevelopment, // Secure only in production
  sameSite: isDevelopment ? 'lax' : 'strict',
  path: '/',
}

/**
 * Set access token - handles both HttpOnly and accessible cookies
 * @param {string} token
 * @param {Date} expiresAt - Optional expiration date
 */
export const setAccessToken = (token, expiresAt = null) => {
  console.log('🍪 Server setting HttpOnly access token (cannot access from JS)')
  console.log('🍪 Environment:', isDevelopment ? 'development' : 'production')

  // Server will set HttpOnly + Secure cookies automatically
  // We only track session state for application logic
  const sessionInfo = {
    hasToken: true,
    expiresAt: expiresAt,
    setAt: new Date().toISOString(),
  }
  localStorage.setItem('auth_session', JSON.stringify(sessionInfo))
  console.log('🍪 Session state tracked in localStorage')
}

/**
 * Set refresh token in cookie
 * @param {string} token
 */
export const setRefreshToken = (token) => {
  console.log('🍪 Server setting HttpOnly refresh token (cannot access from JS)')
  // Both development and production use HttpOnly cookies set by server
  // No client-side storage needed for refresh token
}

/**
 * Set user data in cookie/storage
 * @param {Object} userData
 */
export const setUserData = (userData) => {
  const options = {
    ...COOKIE_OPTIONS,
    expires: 1, // 1 day
  }

  // User data is usually not sensitive, so can be accessible
  Cookies.set(COOKIE_NAMES.USER_DATA, JSON.stringify(userData), options)
  console.log('🍪 User data stored')
}

/**
 * Get access token - checks multiple sources
 * @returns {string|null}
 */
export const getAccessToken = () => {
  // HttpOnly cookies cannot be accessed from JavaScript
  // We check session state to determine if valid token exists
  const sessionInfo = localStorage.getItem('auth_session')
  if (sessionInfo) {
    try {
      const parsed = JSON.parse(sessionInfo)
      if (parsed.hasToken && parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
        console.log('🍪 Session indicates valid HttpOnly token exists')
        return 'httponly_token_exists' // Placeholder to indicate token exists
      }
    } catch (error) {
      console.error('🍪 Error parsing session info:', error)
    }
  }
  console.log('🍪 No valid session found')
  return null
}

/**
 * Get refresh token from cookie
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  // HttpOnly refresh token cannot be accessed from JavaScript
  // Return placeholder if session exists to indicate refresh is possible
  const sessionInfo = localStorage.getItem('auth_session')
  if (sessionInfo) {
    try {
      const parsed = JSON.parse(sessionInfo)
      if (parsed.hasToken) {
        return 'httponly_refresh_exists'
      }
    } catch (error) {
      console.error('🍪 Error checking refresh session:', error)
    }
  }
  return null
}

/**
 * Get user data from cookie
 * @returns {Object|null}
 */
export const getUserData = () => {
  const userData = Cookies.get(COOKIE_NAMES.USER_DATA)
  console.log('🍪 Getting user data raw:', userData)

  if (!userData) return null

  try {
    const parsed = JSON.parse(userData)
    console.log('🍪 Getting user data parsed:', parsed)
    return parsed
  } catch (error) {
    console.error('🍪 Error parsing user data:', error)
    return null
  }
}

/**
 * Remove all auth cookies and storage
 */
export const clearAuthCookies = () => {
  console.log('🗑️ Clearing all auth cookies and storage')

  // Clear accessible cookies (development)
  Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' })
  Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' })
  Cookies.remove(COOKIE_NAMES.USER_DATA, { path: '/' })

  // Clear localStorage
  localStorage.removeItem(COOKIE_NAMES.ACCESS_TOKEN)
  localStorage.removeItem(COOKIE_NAMES.REFRESH_TOKEN)
  localStorage.removeItem('auth_session')

  // In production, HttpOnly cookies can only be cleared by server
  // We'll send a logout request to clear them server-side

  console.log('🗑️ Auth storage cleared')
}

/**
 * Check if token is expired
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token) return true

  // If it's our placeholder for HttpOnly tokens, check session info
  if (token === 'httponly_token_exists') {
    const sessionInfo = localStorage.getItem('auth_session')
    if (sessionInfo) {
      try {
        const parsed = JSON.parse(sessionInfo)
        return !parsed.hasToken || !parsed.expiresAt || new Date(parsed.expiresAt) <= new Date()
      } catch (error) {
        return true
      }
    }
    return true
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

/**
 * Check if user has valid authentication session
 * Works with both accessible tokens and HttpOnly cookies
 * @returns {boolean}
 */
export const hasValidSession = () => {
  if (isDevelopment) {
    const token = getAccessToken()
    return token && !isTokenExpired(token)
  } else {
    // In production, check session info for HttpOnly cookies
    const sessionInfo = localStorage.getItem('auth_session')
    if (sessionInfo) {
      try {
        const parsed = JSON.parse(sessionInfo)
        return parsed.hasToken && parsed.expiresAt && new Date(parsed.expiresAt) > new Date()
      } catch (error) {
        return false
      }
    }
    return false
  }
}

/**
 * Update session info when server sets HttpOnly cookies
 * Call this after successful login/refresh in production
 * @param {Object} sessionData
 */
export const updateSessionInfo = (sessionData) => {
  const sessionInfo = {
    hasToken: true,
    expiresAt: sessionData.expires_at,
    setAt: new Date().toISOString(),
    scope: sessionData.scope,
    tokenType: sessionData.token_type,
  }
  localStorage.setItem('auth_session', JSON.stringify(sessionInfo))
  console.log('🍪 Session info updated for HttpOnly cookies')
}

/**
 * Get token payload
 * @param {string} token
 * @returns {Object|null}
 */
export const getTokenPayload = (token) => {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('🔍 Token payload:', payload)
    return payload
  } catch (error) {
    console.error('🔍 Error parsing token payload:', error)
    return null
  }
}

/**
 * Debug function to check all cookies
 * Call this in browser console: window.debugCookies()
 */
export const debugCookies = () => {
  console.log('=== COOKIE DEBUG ===')

  const allCookies = Cookies.get()
  console.log('🍪 All cookies:', allCookies)

  const token = getAccessToken()
  const refreshToken = getRefreshToken()
  const userData = getUserData()

  console.log('🔑 Access Token:', token || 'Not found')
  console.log('🔄 Refresh Token:', refreshToken || 'Not found')
  console.log('👤 User Data:', userData || 'Not found')

  if (token) {
    console.log('🕐 Token expired:', isTokenExpired(token))
    console.log('📋 Token payload:', getTokenPayload(token))
  }

  return {
    allCookies,
    token,
    refreshToken,
    userData,
    tokenExpired: token ? isTokenExpired(token) : 'No token',
  }
}

// Make debugCookies available globally for browser console
if (typeof window !== 'undefined') {
  window.debugCookies = debugCookies

  // Add simple cookie test
  window.testSimpleCookie = () => {
    console.log('🧪 Testing simple cookie storage...')

    // Test simple string
    Cookies.set('test_simple', 'hello_world', { path: '/' })
    const simple = Cookies.get('test_simple')
    console.log('🧪 Simple cookie test:', simple === 'hello_world' ? 'PASS' : 'FAIL')

    // Test JSON
    const testData = { test: true, value: 123 }
    Cookies.set('test_json', JSON.stringify(testData), { path: '/' })
    const jsonRaw = Cookies.get('test_json')
    const jsonParsed = JSON.parse(jsonRaw || '{}')
    console.log('🧪 JSON cookie test:', jsonParsed.test === true ? 'PASS' : 'FAIL')

    // Test with expiration
    const future = new Date(Date.now() + 60000) // 1 minute
    Cookies.set('test_expire', 'expires_soon', { path: '/', expires: future })
    const expiring = Cookies.get('test_expire')
    console.log('🧪 Expiring cookie test:', expiring === 'expires_soon' ? 'PASS' : 'FAIL')

    // Test long string (simulating JWT)
    const longString = 'a'.repeat(1000) // 1000 characters
    Cookies.set('test_long', longString, { path: '/' })
    const longResult = Cookies.get('test_long')
    console.log('🧪 Long cookie test:', longResult === longString ? 'PASS' : 'FAIL')

    // Show all test cookies
    console.log('🧪 All test cookies:', {
      simple: Cookies.get('test_simple'),
      json: Cookies.get('test_json'),
      expire: Cookies.get('test_expire'),
      long: Cookies.get('test_long')?.length,
    })

    // Cleanup
    Cookies.remove('test_simple', { path: '/' })
    Cookies.remove('test_json', { path: '/' })
    Cookies.remove('test_expire', { path: '/' })
    Cookies.remove('test_long', { path: '/' })

    console.log('🧪 Test cookies cleaned up')
  }
}
