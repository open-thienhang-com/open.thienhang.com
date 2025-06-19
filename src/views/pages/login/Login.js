import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useAuth } from '../../../contexts/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'duy@thienhang.com',
    password: 'stringst',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, isAuthenticated, error, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Simple redirect logic
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirectPath = location.state?.from?.pathname || '/dashboard'
      console.log('🔄 Redirecting authenticated user to:', redirectPath)
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, isLoading])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        // Let the useEffect handle the redirect
        console.log('✅ Login successful, redirect will be handled by useEffect')
      }
    } catch (err) {
      console.error('❌ Login error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="bg-body-tertiary min-vh-100 d-flex justify-content-center align-items-center">
        <CSpinner color="primary" variant="grow" />
        <span className="ms-2">Loading...</span>
      </div>
    )
  }

  // Don't show login if already authenticated
  if (isAuthenticated) {
    return (
      <div className="bg-body-tertiary min-vh-100 d-flex justify-content-center align-items-center">
        <CSpinner color="primary" variant="grow" />
        <span className="ms-2">Redirecting...</span>
      </div>
    )
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    {error && (
                      <CAlert color="danger" className="mb-3">
                        {error}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        required
                        disabled={isSubmitting}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                        required
                        disabled={isSubmitting}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Signing in...
                            </>
                          ) : (
                            'Login'
                          )}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Create a new account to access all features and functionalities of our platform.
                      It's quick and easy!
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
