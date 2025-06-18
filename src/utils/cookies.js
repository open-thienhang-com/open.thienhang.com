import Cookies from 'js-cookie'

/**
 * Cookie utility functions for authentication
 */

// Cookie names
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
}

// Cookie options - DISABLE secure for localhost
const COOKIE_OPTIONS = {
  secure: false, // Disable secure for localhost development
  sameSite: 'lax', // Changed from strict to lax for better compatibility
  path: '/',
}

/**
 * Set access token in cookie
 * @param {string} token
 * @param {Date} expiresAt - Optional expiration date
 */
export const setAccessToken = (token, expiresAt = null) => {
  console.log('🍪 Setting access token:', token ? `${token.substring(0, 20)}...` : 'null')
  console.log('🍪 Token length:', token?.length || 0)
  console.log('🍪 Token expires at:', expiresAt)

  const options = { ...COOKIE_OPTIONS }

  if (expiresAt) {
    // Handle both string and Date formats
    const expireDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
    console.log('🍪 Parsed expire date:', expireDate)

    // Only set expiration if it's a valid future date
    if (expireDate && expireDate > new Date()) {
      options.expires = expireDate
    } else {
      console.log('⚠️ Invalid expiration date, using default 1 day')
      options.expires = 1
    }
  } else {
    // Default to 1 day if no expiration provided
    options.expires = 1
  }

  console.log('🍪 Cookie options:', options)

  // Try to set cookie first
  try {
    Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, token, options)

    // Verify cookie was set
    const stored = Cookies.get(COOKIE_NAMES.ACCESS_TOKEN)
    if (stored) {
      console.log('🍪 Token stored in cookie successfully')
      // Clear any sessionStorage backup
      sessionStorage.removeItem(COOKIE_NAMES.ACCESS_TOKEN)
    } else {
      throw new Error('Cookie not stored')
    }
  } catch (error) {
    console.log('⚠️ Cookie storage failed, trying sessionStorage:', error.message)
    // Fallback to sessionStorage for large tokens
    sessionStorage.setItem(COOKIE_NAMES.ACCESS_TOKEN, token)
    const sessionStored = sessionStorage.getItem(COOKIE_NAMES.ACCESS_TOKEN)
    console.log('🍪 Token stored in sessionStorage:', !!sessionStored)
  }
}

/**
 * Set refresh token in cookie
 * @param {string} token
 */
export const setRefreshToken = (token) => {
  const options = {
    ...COOKIE_OPTIONS,
    expires: 7, // 7 days for refresh token
  }

  Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, token, options)
}

/**
 * Set user data in cookie
 * @param {Object} userData
 */
export const setUserData = (userData) => {
  const options = {
    ...COOKIE_OPTIONS,
    expires: 1, // 1 day
  }

  Cookies.set(COOKIE_NAMES.USER_DATA, JSON.stringify(userData), options)
}

/**
 * Get access token from cookie
 * @returns {string|null}
 */
export const getAccessToken = () => {
  // Try cookie first
  let token = Cookies.get(COOKIE_NAMES.ACCESS_TOKEN)

  // Fallback to sessionStorage if not in cookie
  if (!token) {
    token = sessionStorage.getItem(COOKIE_NAMES.ACCESS_TOKEN)
    if (token) {
      console.log('🍪 Getting access token from sessionStorage:', `${token.substring(0, 20)}...`)
    }
  } else {
    console.log('🍪 Getting access token from cookie:', `${token.substring(0, 20)}...`)
  }

  if (!token) {
    console.log('🍪 No access token found in cookie or sessionStorage')
  }

  return token || null
}

/**
 * Get refresh token from cookie
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  return Cookies.get(COOKIE_NAMES.REFRESH_TOKEN) || null
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
 * Remove all auth cookies
 */
export const clearAuthCookies = () => {
  console.log('🗑️ Clearing all auth cookies and sessionStorage')

  // Clear cookies
  Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' })
  Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' })
  Cookies.remove(COOKIE_NAMES.USER_DATA, { path: '/' })

  // Clear sessionStorage
  sessionStorage.removeItem(COOKIE_NAMES.ACCESS_TOKEN)
  sessionStorage.removeItem(COOKIE_NAMES.REFRESH_TOKEN)
  sessionStorage.removeItem(COOKIE_NAMES.USER_DATA)

  // Verify cookies were removed
  const tokenRemaining = Cookies.get(COOKIE_NAMES.ACCESS_TOKEN)
  const refreshRemaining = Cookies.get(COOKIE_NAMES.REFRESH_TOKEN)
  const userRemaining = Cookies.get(COOKIE_NAMES.USER_DATA)

  // Verify sessionStorage was cleared
  const sessionTokenRemaining = sessionStorage.getItem(COOKIE_NAMES.ACCESS_TOKEN)

  console.log('🗑️ Auth storage cleared:', {
    cookieToken: !tokenRemaining,
    cookieRefresh: !refreshRemaining,
    cookieUser: !userRemaining,
    sessionToken: !sessionTokenRemaining,
  })
}

/**
 * Check if token is expired
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
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
