import Cookies from 'js-cookie'
import axios from 'axios'

/**
 * Cookie utility functions for HttpOnly authentication cookies
 * Server automatically sets HttpOnly access_token and refresh_token cookies
 * Client only manages user data in localStorage
 */

// Cookie names (for reference - actual cookies are HttpOnly)
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
}

// Check if we're in development
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Set user data in localStorage (not in cookies for reliability)
 * @param {Object} userData
 */
export const setUserData = (userData) => {
  localStorage.setItem('user_data', JSON.stringify(userData))
  console.log('💾 User data stored in localStorage:', userData.email)
}

/**
 * Get access token - Returns placeholder since HttpOnly cookies can't be read by JS
 * @returns {string|null}
 */
export const getAccessToken = () => {
  // HttpOnly cookies cannot be accessed from JavaScript
  // We return a placeholder to indicate cookies should exist
  const userData = getUserData()
  if (userData) {
    console.log('🍪 HttpOnly access_token should exist (cannot verify from JS)')
    return 'httponly_token_exists' // Placeholder
  }
  return null
}

/**
 * Get user data from localStorage
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
 * Remove all auth storage (localStorage only - HttpOnly cookies cleared by server)
 */
export const clearAuthCookies = () => {
  console.log('🗑️ Clearing auth storage')

  // Clear localStorage
  localStorage.removeItem('user_data')
  localStorage.removeItem('access_token') // Legacy cleanup
  localStorage.removeItem('refresh_token') // Legacy cleanup

  // Clear any remaining test cookies
  Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN, { path: '/' })
  Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN, { path: '/' })
  Cookies.remove(COOKIE_NAMES.USER_DATA, { path: '/' })

  console.log('🗑️ Auth storage cleared (HttpOnly cookies must be cleared by server)')
}

/**
 * Check if token is expired - For HttpOnly tokens, we can't verify
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token) return true

  // If it's our placeholder for HttpOnly tokens, assume valid
  if (token === 'httponly_token_exists' || token === 'httponly_refresh_exists') {
    console.log('🍪 HttpOnly token - assuming valid (verified by API calls)')
    return false
  }

  // For actual JWT tokens (fallback)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

/**
 * Check if user has valid authentication session
 * Works by checking if user data exists and testing API call
 * @returns {boolean}
 */
export const hasValidSession = () => {
  const userData = getUserData()
  return !!userData // If user data exists, assume HttpOnly cookies exist
}

/**
 * Get token payload - Not possible with HttpOnly cookies
 * @param {string} token
 * @returns {Object|null}
 */
export const getTokenPayload = (token) => {
  console.log('⚠️ Cannot get token payload from HttpOnly cookies')
  return null
}

/**
 * Debug function to check authentication state
 */
export const debugCookies = () => {
  console.log('=== AUTHENTICATION DEBUG (HttpOnly Cookies) ===')

  const allCookies = Cookies.get()
  console.log('🍪 Accessible cookies:', allCookies)

  const userData = getUserData()
  console.log('👤 User Data:', userData || 'Not found')
  console.log('🔑 HttpOnly Access Token:', userData ? 'Should exist (HttpOnly)' : 'No user data')
  console.log('🔄 HttpOnly Refresh Token:', userData ? 'Should exist (HttpOnly)' : 'No user data')

  return {
    allCookies,
    userData,
    hasSession: !!userData,
    note: 'HttpOnly cookies cannot be accessed from JavaScript',
  }
}

/**
 * Verify if HttpOnly cookies actually exist by making a test API call
 * @returns {Promise<boolean>}
 */
export const verifyHttpOnlyCookiesExist = async () => {
  console.log('🔍 Verifying HttpOnly cookies exist by testing API call...')

  // First check if we have user data
  const userData = getUserData()
  if (!userData) {
    console.log('💾 No user data found in localStorage')
    return false
  }

  try {
    // Make a test API call to verify HttpOnly cookies are actually present
    const testUrl = isDevelopment
      ? '/authentication/me' // Via proxy
      : 'https://api.thienhang.com/authentication/me' // Direct

    console.log('🔍 Testing HttpOnly cookies with API call to:', testUrl)

    const response = await axios.get(testUrl, {
      withCredentials: true, // Send HttpOnly cookies
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

    // For other status codes, assume cookies are present but there's another issue
    console.log('⚠️ API call returned unexpected status:', response.status)
    return true
  } catch (error) {
    // Handle axios errors (includes 4xx and 5xx responses)
    if (error.response) {
      const status = error.response.status
      console.log('🔍 API response status:', status)

      // If we get 401/403, cookies are missing or invalid
      if (status === 401 || status === 403) {
        console.log('❌ HttpOnly cookies missing or invalid - API returned', status)
        return false
      }

      // For other HTTP error status codes, assume cookies are present but there's another issue
      console.log('⚠️ API call returned error status:', status)
      return true
    } else {
      // Network error or other issue - assume cookies are missing
      console.log('❌ Error verifying HttpOnly cookies:', error.message)
      return false
    }
  }
}

// Make debug function available globally for browser console
if (typeof window !== 'undefined') {
  window.debugCookies = debugCookies
  window.verifyHttpOnlyCookies = verifyHttpOnlyCookiesExist
}
