import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import api, { directApi } from '../api/axios'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
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
    const checkAuth = () => {
      console.log('🔍 Checking authentication on app load...')

      // Clear any old localStorage tokens to avoid conflicts
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('user')

      const token = getAccessToken()
      const userData = getUserData()

      console.log('🍪 Found token in cookies:', !!token)
      console.log('🍪 Found user data in cookies:', !!userData)

      if (!token || isTokenExpired(token)) {
        console.log('❌ No valid token found')
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        return
      }

      if (!userData) {
        console.log('❌ No user data found')
        clearAuthCookies()
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
        return
      }

      console.log('✅ Authentication restored for user:', userData.email)
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: userData,
      })
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

      // Store tokens in cookies
      console.log(
        '💾 About to store access token:',
        access_token ? `${access_token.substring(0, 50)}...` : 'NULL',
      )
      setAccessToken(access_token, expires_at)
      setRefreshToken(refresh_token)

      // Verify tokens were stored immediately
      const storedToken = getAccessToken()
      const storedRefresh = getRefreshToken()
      console.log(
        '🔍 Verification - stored token:',
        storedToken ? `${storedToken.substring(0, 20)}...` : 'NULL',
      )
      console.log(
        '🔍 Verification - stored refresh:',
        storedRefresh ? `${storedRefresh.substring(0, 20)}...` : 'NULL',
      )

      // Create user data
      const tokenPayload = getTokenPayload(access_token)
      const userData = {
        id: tokenPayload?.identity,
        email: email,
        token_type,
        scope,
        expires_at,
        loginTime: new Date().toISOString(),
      }

      // Store user data in cookie
      setUserData(userData)
      console.log('💾 User data stored:', userData.email)

      // Final verification of all cookies
      console.log('🔍 Final cookie verification:')
      console.log('  - Access token:', !!getAccessToken())
      console.log('  - Refresh token:', !!getRefreshToken())
      console.log('  - User data:', !!getUserData())

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: userData,
          token: access_token,
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
    const refresh = getRefreshToken()
    if (!refresh) return false

    try {
      let response

      try {
        response = await api.post('/authentication/refresh', {
          refresh_token: refresh,
        })
      } catch (proxyError) {
        response = await directApi.post('/authentication/refresh', {
          refresh_token: refresh,
        })
      }

      const { access_token, expires_at } = response.data
      setAccessToken(access_token, expires_at)
      console.log('🔄 Token refreshed successfully')
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
