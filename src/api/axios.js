import axios from 'axios'
import { toast } from 'react-toastify'
import { clearAuthCookies } from '../utils/cookies'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : 'https://api.thienhang.com',
  timeout: 15000,
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Alternative direct API instance for fallback
const directApi = axios.create({
  baseURL: 'https://api.thienhang.com',
  timeout: 15000,
  withCredentials: true, // Send HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
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

// Request interceptor - HttpOnly cookies are sent automatically
api.interceptors.request.use(
  (config) => {
    // HttpOnly cookies are sent automatically with withCredentials: true
    // No need to manually add Authorization header
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If proxy fails with CORS, try direct API
    if (error.code === 'ERR_NETWORK' || error.response?.status === 0) {
      console.log('Proxy failed, trying direct API...')
      try {
        // HttpOnly cookies will be sent automatically
        const headers = { ...originalRequest.headers }

        const directResponse = await directApi({
          ...originalRequest,
          url: originalRequest.url.replace('/api', ''),
          headers,
        })
        return directResponse
      } catch (directError) {
        console.error('Direct API also failed:', directError)
        // Continue with original error handling
      }
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            // HttpOnly cookies updated automatically by server
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try refresh with proxy first, then direct
        // Server will automatically refresh HttpOnly cookies on success
        let response
        try {
          const refreshUrl =
            process.env.NODE_ENV === 'development'
              ? '/api/authentication/refresh-token'
              : 'https://api.thienhang.com/authentication/refresh-token'

          response = await axios.post(
            refreshUrl,
            {},
            {
              withCredentials: true, // Send existing refresh token cookie
            },
          )
        } catch (proxyError) {
          console.log('Refresh via proxy failed, trying direct API...')
          response = await directApi.post('/authentication/refresh-token', {})
        }

        // Server updates HttpOnly cookies automatically
        console.log('🔄 Token refreshed by server, HttpOnly cookies updated')

        // Process queued requests
        processQueue(null, true)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthCookies()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          toast.error(data.detail || data.message || 'Bad request')
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
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('Something went wrong')
    }

    return Promise.reject(error)
  },
)

// Export both instances
export default api
export { directApi }
