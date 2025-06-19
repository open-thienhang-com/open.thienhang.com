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
  // Store user data in localStorage for reliability
  // This avoids cookie domain/security issues
  localStorage.setItem('user_data', JSON.stringify(userData))
  console.log('💾 User data stored in localStorage:', userData.email)
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

      // Debug the expiration check
      const now = new Date()

      // Server sends time without timezone, treat as UTC
      let expiresAt
      if (parsed.expiresAt.includes('Z')) {
        expiresAt = new Date(parsed.expiresAt)
      } else {
        // Add Z to treat server time as UTC
        expiresAt = new Date(parsed.expiresAt + 'Z')
      }

      const isExpired = expiresAt <= now

      console.log('🔍 Token expiration check:')
      console.log('  - Current time:', now.toISOString())
      console.log('  - Expires at:', expiresAt.toISOString())
      console.log('  - Is expired:', isExpired)
      console.log('  - Time diff (minutes):', (expiresAt - now) / 1000 / 60)

      if (parsed.hasToken && parsed.expiresAt && !isExpired) {
        console.log('🍪 Session indicates valid HttpOnly token exists')
        return 'httponly_token_exists' // Placeholder to indicate token exists
      } else {
        console.log('🍪 Session exists but token is expired or invalid')
        // Clear invalid session
        localStorage.removeItem('auth_session')
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
  const userData = localStorage.getItem('user_data')
  console.log('💾 Getting user data from localStorage:', !!userData)

  if (!userData) return null

  try {
    const parsed = JSON.parse(userData)
    console.log('💾 User data parsed:', parsed.email)
    return parsed
  } catch (error) {
    console.error('💾 Error parsing user data:', error)
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
  localStorage.removeItem('user_data')

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
        if (!parsed.hasToken || !parsed.expiresAt) return true

        // Handle timezone the same way as getAccessToken
        let expiresAt
        if (parsed.expiresAt.includes('Z')) {
          expiresAt = new Date(parsed.expiresAt)
        } else {
          expiresAt = new Date(parsed.expiresAt + 'Z')
        }

        return expiresAt <= new Date()
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

/**
 * Verify if HttpOnly cookies actually exist by making a test API call
 * This is needed because localStorage session might exist but cookies could be deleted in DevTools
 * @returns {Promise<boolean>}
 */
export const verifyHttpOnlyCookiesExist = async () => {
  console.log('🔍 Verifying HttpOnly cookies exist by testing API call...')

  // First check if we have session info
  const sessionInfo = localStorage.getItem('auth_session')
  if (!sessionInfo) {
    console.log('🍪 No session info found in localStorage')
    return false
  }

  try {
    const parsed = JSON.parse(sessionInfo)
    const now = new Date()
    const expiresAt = parsed.expiresAt.includes('Z')
      ? new Date(parsed.expiresAt)
      : new Date(parsed.expiresAt + 'Z')

    // Check if session is expired
    if (!parsed.hasToken || expiresAt <= now) {
      console.log('🍪 Session expired in localStorage')
      return false
    }

    // Make a test API call to verify HttpOnly cookies are actually present
    // Use fetch to avoid axios interceptors that might interfere
    const testUrl = isDevelopment
      ? '/api/authentication/me' // Via proxy
      : 'https://api.thienhang.com/authentication/me' // Direct

    console.log('🔍 Testing HttpOnly cookies with API call to:', testUrl)

    const response = await fetch(testUrl, {
      method: 'GET',
      credentials: 'include', // Send HttpOnly cookies
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })

    console.log('🔍 API response status:', response.status)

    // If we get 200, cookies are present and valid
    if (response.status === 200) {
      console.log('✅ HttpOnly cookies verified - API call successful')
      return true
    }

    // If we get 401/403, cookies are missing or invalid
    if (response.status === 401 || response.status === 403) {
      console.log('❌ HttpOnly cookies missing or invalid - API returned', response.status)
      return false
    }

    // For other status codes, assume cookies are present but there's another issue
    console.log('⚠️ API call returned unexpected status:', response.status)
    return true
  } catch (error) {
    console.log('❌ Error verifying HttpOnly cookies:', error.message)
    // Network error or other issue - assume cookies are missing
    return false
  }
}
