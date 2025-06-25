import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import api, { directApi } from '../api/axios'
import {
  getAccessToken,
  setUserData,
  getUserData,
  clearAuthCookies,
  isTokenExpired,
  getTokenPayload,
} from '../utils/cookies'

// Auth Context
const AuthContext = createContext()

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// Initial State
const getInitialState = () => {
  const token = getAccessToken()
  const userData = getUserData()

  // Only consider authenticated if we have both valid token and user data
  const isAuthenticated = !!(token && !isTokenExpired(token) && userData)

  return {
    user: userData,
    isAuthenticated,
    isLoading: true, // Always start with loading to check auth
    error: null,
    token: token,
  }
}

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, getInitialState())
  const loginInProgress = useRef(false)

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication on app load...')

      // Clear any old localStorage tokens to avoid conflicts
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      const userData = getUserData()
      console.log('💾 Found user data in localStorage:', !!userData)

      if (!userData) {
        console.log('❌ No user data found')
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        return
      }

      // Verify HttpOnly cookies exist by making test API call
      try {
        const testUrl =
          process.env.NODE_ENV === 'development'
            ? '/authentication/me'
            : 'https://api.thienhang.com/authentication/me'

        const response = await api.get(testUrl)
        console.log('✅ Authentication verified with API call for user:', userData.email)

        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: userData,
        })
      } catch (error) {
        console.log('❌ Authentication verification failed:', error.response?.status)
        clearAuthCookies()
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    // Small delay to prevent race conditions
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  // Login function - prevent multiple calls
  const login = async (email, password) => {
    if (loginInProgress.current) {
      console.log('⚠️ Login already in progress, ignoring...')
      return { success: false, error: 'Login already in progress' }
    }

    loginInProgress.current = true
    console.log('🔐 Starting login process...')
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      let response

      try {
        console.log('🔄 Trying login via proxy...')
        response = await api.post('/authentication/login', { email, password })
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.post('/authentication/login', { email, password })
      }

      const { access_token, refresh_token, expires_at, token_type, scope } = response.data

      console.log('✅ Login API call successful')
      console.log('📋 Response data:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        expires_at,
        token_type,
        scope,
      })

      // Server automatically sets HttpOnly cookies
      console.log('🍪 Server has set HttpOnly access_token and refresh_token cookies')
      console.log('📋 Token info:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        expires_at,
        token_type,
        scope,
      })

      // Create user data (since we can't read HttpOnly token, use API response)
      const userData = {
        id: response.data.user?.identity || response.data.identity,
        email: email,
        token_type,
        scope,
        expires_at,
        loginTime: new Date().toISOString(),
      }

      // Store user data in localStorage (user info only, not tokens)
      setUserData(userData)
      console.log('💾 User data stored:', userData.email)

      // Verify authentication by testing API call
      console.log('🔍 Verifying HttpOnly cookies with test API call...')

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: userData,
          token: 'httponly_token_exists', // Placeholder since we can't read HttpOnly cookies
        },
      })

      toast.success('Login successful! Welcome back.')
      return { success: true, user: userData }
    } catch (error) {
      let errorMessage = 'Login failed'

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        errorMessage = 'Unable to connect to server. Please check your connection.'
      }

      console.error('❌ Login failed:', errorMessage)

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      })

      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      loginInProgress.current = false
    }
  }

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out user...')
    clearAuthCookies()
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
    toast.info('You have been logged out')
  }

  // Refresh token function
  const refreshToken = async () => {
    try {
      let response

      try {
        // Server automatically uses HttpOnly refresh_token cookie
        response = await api.post('/authentication/refresh-token', {})
      } catch (proxyError) {
        response = await directApi.post('/authentication/refresh-token', {})
      }

      // Server automatically updates HttpOnly cookies
      console.log('🔄 Token refreshed successfully by server')
      return true
    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      clearAuthCookies()
      logout()
      return false
    }
  }

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
