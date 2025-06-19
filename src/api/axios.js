import axios from 'axios'
import { toast } from 'react-toastify'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearAuthCookies,
  isTokenExpired,
} from '../utils/cookies'

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'

console.log('🔧 Environment:', process.env.NODE_ENV)
console.log('🔧 Is Development:', isDevelopment)
console.log('🔧 Base URL will be:', isDevelopment ? '/api' : 'https://api.thienhang.com')

// Create axios instance - use proxy in development, direct API in production
const api = axios.create({
  baseURL: isDevelopment ? '/api' : 'https://api.thienhang.com',
  timeout: 15000,
  withCredentials: true, // Enable cookies for HttpOnly authentication
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Flag to prevent multiple refresh requests
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Helper function to create authenticated request config
const createAuthenticatedConfig = (config = {}) => {
  const sessionToken = getAccessToken()

  if (!sessionToken) {
    throw new Error('AUTHENTICATION_REQUIRED')
  }

  // For HttpOnly cookies, don't send Authorization header
  // Browser will automatically include HttpOnly cookies in requests
  return {
    ...config,
    withCredentials: true, // Ensure cookies are sent
    headers: {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest',
    },
  }
}

// Secure API wrapper that requires explicit authentication
const secureApi = {
  // GET request with authentication
  get: async (url, config = {}) => {
    try {
      const authConfig = createAuthenticatedConfig(config)
      return await api.get(url, authConfig)
    } catch (error) {
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        const refreshed = await handleTokenRefresh()
        if (refreshed) {
          const authConfig = createAuthenticatedConfig(config)
          return await api.get(url, authConfig)
        }
        throw new Error('Authentication failed')
      }
      throw error
    }
  },

  // POST request with authentication
  post: async (url, data, config = {}) => {
    try {
      const authConfig = createAuthenticatedConfig(config)
      return await api.post(url, data, authConfig)
    } catch (error) {
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        const refreshed = await handleTokenRefresh()
        if (refreshed) {
          const authConfig = createAuthenticatedConfig(config)
          return await api.post(url, data, authConfig)
        }
        throw new Error('Authentication failed')
      }
      throw error
    }
  },

  // PUT request with authentication
  put: async (url, data, config = {}) => {
    try {
      const authConfig = createAuthenticatedConfig(config)
      return await api.put(url, data, authConfig)
    } catch (error) {
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        const refreshed = await handleTokenRefresh()
        if (refreshed) {
          const authConfig = createAuthenticatedConfig(config)
          return await api.put(url, data, authConfig)
        }
        throw new Error('Authentication failed')
      }
      throw error
    }
  },

  // DELETE request with authentication
  delete: async (url, config = {}) => {
    try {
      const authConfig = createAuthenticatedConfig(config)
      return await api.delete(url, authConfig)
    } catch (error) {
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        const refreshed = await handleTokenRefresh()
        if (refreshed) {
          const authConfig = createAuthenticatedConfig(config)
          return await api.delete(url, authConfig)
        }
        throw new Error('Authentication failed')
      }
      throw error
    }
  },

  // PATCH request with authentication
  patch: async (url, data, config = {}) => {
    try {
      const authConfig = createAuthenticatedConfig(config)
      return await api.patch(url, data, authConfig)
    } catch (error) {
      if (error.message === 'AUTHENTICATION_REQUIRED') {
        const refreshed = await handleTokenRefresh()
        if (refreshed) {
          const authConfig = createAuthenticatedConfig(config)
          return await api.patch(url, data, authConfig)
        }
        throw new Error('Authentication failed')
      }
      throw error
    }
  },
}

// Public API for non-authenticated requests
const publicApi = {
  get: (url, config = {}) =>
    api.get(url, {
      ...config,
      withCredentials: true, // Enable cookies for HttpOnly responses
      headers: {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
      },
    }),

  post: (url, data, config = {}) =>
    api.post(url, data, {
      ...config,
      withCredentials: true, // Enable cookies for HttpOnly responses
      headers: {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
      },
    }),

  put: (url, data, config = {}) =>
    api.put(url, data, {
      ...config,
      withCredentials: true, // Enable cookies for HttpOnly responses
      headers: {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
      },
    }),

  delete: (url, config = {}) =>
    api.delete(url, {
      ...config,
      withCredentials: true, // Enable cookies for HttpOnly responses
      headers: {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
      },
    }),

  patch: (url, data, config = {}) =>
    api.patch(url, data, {
      ...config,
      withCredentials: true, // Enable cookies for HttpOnly responses
      headers: {
        ...config.headers,
        'X-Requested-With': 'XMLHttpRequest',
      },
    }),
}

// Handle token refresh manually
const handleTokenRefresh = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearAuthCookies()
    processQueue(new Error('No refresh token'), null)
    isRefreshing = false
    return false
  }

  try {
    console.log('🔄 Attempting token refresh...')

    const response = await api.post(
      '/authentication/refresh',
      {
        refresh_token: refreshToken,
      },
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    )

    const { access_token, expires_at } = response.data
    setAccessToken(access_token, expires_at)

    console.log('✅ Token refreshed successfully')

    // Process queued requests
    processQueue(null, access_token)
    isRefreshing = false
    return true
  } catch (refreshError) {
    console.error('❌ Token refresh failed:', refreshError.response?.data || refreshError.message)
    processQueue(refreshError, null)
    clearAuthCookies()
    isRefreshing = false
    return false
  }
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Log errors for debugging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
      })
    } else if (error.request) {
      console.error('Network Error:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      })
    }

    // Handle errors but don't auto-refresh tokens
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          toast.error(data.detail || data.message || 'Bad request')
          break
        case 401:
          toast.error('Authentication required. Please login again.')
          clearAuthCookies()
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
          break
        case 403:
          toast.error('Access denied')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error(data.detail || data.message || 'An error occurred')
      }
    } else if (error.request) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection and try again.')
      } else {
        toast.error('Request failed. Please try again.')
      }
    } else {
      toast.error('Something went wrong')
    }

    return Promise.reject(error)
  },
)

// Authentication utilities
const auth = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAccessToken()
    return token && !isTokenExpired(token)
  },

  // Manual login function
  login: async (credentials) => {
    try {
      console.log('🔐 Attempting login...')
      const response = await publicApi.post('/authentication/login', credentials)
      const { access_token, refresh_token, expires_at } = response.data

      setAccessToken(access_token, expires_at)
      console.log('✅ Login successful')

      return response.data
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message)
      throw error
    }
  },

  // Manual logout function
  logout: () => {
    console.log('🚪 Logging out...')
    clearAuthCookies()
    window.location.href = '/login'
  },

  // Manual token refresh
  refreshToken: handleTokenRefresh,
}

// Export secure API, public API, and auth utilities
export default secureApi
export { publicApi, auth }
