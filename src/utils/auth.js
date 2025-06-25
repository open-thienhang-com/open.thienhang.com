import api from '../api/axios'
import {
  getAccessToken,
  clearAuthCookies,
  isTokenExpired,
  getTokenPayload,
  getUserData,
} from './cookies'

/**
 * Authentication utility functions
 */

/**
 * Check if user is authenticated (works with HttpOnly cookies)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const userData = getUserData()
  return !!userData // If user data exists, assume HttpOnly cookies exist
}

/**
 * Get current user from localStorage (HttpOnly tokens can't be read)
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  return getUserData()
}

/**
 * Get auth token - Not possible with HttpOnly cookies
 * @returns {string|null}
 */
export const getToken = () => {
  console.log('⚠️ Cannot access HttpOnly tokens from JavaScript')
  return null
}

/**
 * Clear auth data from cookies
 */
export const clearAuthData = () => {
  clearAuthCookies()
}

/**
 * Set auth tokens - Not needed with HttpOnly cookies (server handles this)
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {string} expiresAt
 */
export const setAuthTokens = (accessToken, refreshToken, expiresAt) => {
  console.log('⚠️ Tokens are set as HttpOnly cookies by the server automatically')
  // Server handles HttpOnly cookie setting
}

/**
 * Check if user has specific role
 * @param {string|Array} userRoles
 * @param {string} requiredRole
 * @returns {boolean}
 */
export const hasRole = (userRoles, requiredRole) => {
  if (!userRoles || !requiredRole) return false

  if (Array.isArray(userRoles)) {
    return userRoles.includes(requiredRole)
  }

  return userRoles === requiredRole
}

/**
 * Check if user has any of the required roles
 * @param {string|Array} userRoles
 * @param {Array} requiredRoles
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  if (!userRoles || !requiredRoles || !Array.isArray(requiredRoles)) return false

  return requiredRoles.some((role) => hasRole(userRoles, role))
}

/**
 * API request wrapper with authentication (using axios instance)
 * @param {string} url
 * @param {Object} options
 * @returns {Promise}
 */
export const authenticatedRequest = async (url, options = {}) => {
  try {
    const response = await api({
      url,
      ...options,
    })
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Refresh authentication token (HttpOnly cookies handled by server)
 * @returns {boolean}
 */
export const refreshAuthToken = async () => {
  try {
    // Server automatically uses HttpOnly refresh_token cookie and updates access_token
    const response = await api.post('/authentication/refresh-token', {})
    console.log('🔄 Token refreshed by server, HttpOnly cookies updated')
    return true
  } catch (error) {
    console.error('Token refresh failed:', error)
    clearAuthCookies()
    return false
  }
}

/**
 * Get user profile from API
 * @returns {Promise<Object>}
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get user short profile from API
 * @returns {Promise<Object>}
 */
export const getUserShortProfile = async () => {
  try {
    const response = await api.get('/user/me')
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Check if current session is valid (works with HttpOnly cookies)
 * @returns {boolean}
 */
export const isSessionValid = () => {
  const userData = getUserData()
  return !!userData // If user data exists, assume HttpOnly cookies exist
}

/**
 * Logout user completely
 */
export const logoutUser = () => {
  clearAuthCookies()
  window.location.href = '/login'
}
