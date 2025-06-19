import api from '../api/axios'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthCookies,
  isTokenExpired,
  getTokenPayload,
  getUserData,
} from './cookies'

/**
 * Authentication utility functions
 */

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getAccessToken()
  if (!token) return false
  return !isTokenExpired(token)
}

/**
 * Get current user from cookie or token
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  // Try to get user data from cookie first
  let userData = getUserData()

  // If no user data in cookie, try to get from token
  if (!userData) {
    const token = getAccessToken()
    if (token) {
      const tokenPayload = getTokenPayload(token)
      if (tokenPayload) {
        userData = {
          id: tokenPayload.identity,
          email: tokenPayload.email || 'Unknown',
        }
      }
    }
  }

  return userData
}

/**
 * Get auth token from cookie
 * @returns {string|null}
 */
export const getToken = () => {
  return getAccessToken()
}

/**
 * Clear auth data from cookies
 */
export const clearAuthData = () => {
  clearAuthCookies()
}

/**
 * Set auth tokens in cookies
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {string} expiresAt
 */
export const setAuthTokens = (accessToken, refreshToken, expiresAt) => {
  setAccessToken(accessToken, expiresAt)
  if (refreshToken) {
    setRefreshToken(refreshToken)
  }
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
 * Refresh authentication token
 * @returns {boolean}
 */
export const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await api.post('/authentication/refresh-token', {
      refresh_token: refreshToken,
    })

    const { access_token, expires_at } = response.data
    setAccessToken(access_token, expires_at)
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
 * Check if current session is valid
 * @returns {boolean}
 */
export const isSessionValid = () => {
  const token = getAccessToken()
  const refreshToken = getRefreshToken()

  if (!token && !refreshToken) return false
  if (token && !isTokenExpired(token)) return true
  if (refreshToken) return true // Can attempt refresh

  return false
}

/**
 * Logout user completely
 */
export const logoutUser = () => {
  clearAuthCookies()
  window.location.href = '/login'
}
