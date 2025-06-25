import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api, { directApi } from '../../../api/axios'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'

const Permisison = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  })

  useEffect(() => {
    if (id) fetchPermissionDetail(id)
  }, [id])

  const fetchPermissionDetail = async permissionId => {
    setLoading(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching permission detail via proxy...', permissionId)
        response = await api.get(`/governance/permission/${permissionId}`)
      } catch {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.get(`/governance/permission/${permissionId}`)
      }

      console.log('✅ Permission detail API response:', response.data)

      if (response.data?.data) {
        setFormData(response.data.data)
      } else {
        setError('Permission not found')
      }
    } catch (err) {
      console.error('❌ Error fetching permission detail:', err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch permission details'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = e => {
    const { name, value, type, checked, multiple, selectedOptions } = e.target

    const finalValue =
      type === 'checkbox'
        ? checked
        : type === 'number'
          ? parseFloat(value) || 0
          : multiple
            ? Array.from(selectedOptions, opt => opt.value)
            : value

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        code: formData.code,
        name: formData.name,        
        description: formData.description,        
      }

      console.log('Creating permission with payload:', payload)

      const response = id
        ? await api.patch(`/governance/permission/${id}`, payload)
        : await api.post('/governance/permission', payload)

      toast.success(response.data.message || 'Successfully!')

      navigate('/governance/permissions')
    } catch (error) {
      console.error('Error creating permission:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error. Please try again.'

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CContainer>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">{id ? 'Permisison Detail' : 'Create New Permisison'}</h4>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/governance/permissions')}>
                  <CIcon icon={cilArrowLeft} className="me-2" />
                  Back to Permisisons
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-4">
                  <CCol xs={12}>
                    <h5 className="text-primary border-bottom pb-2">Basic Information</h5>
                  </CCol>

                  {[
                    { id: 'code', label: 'Code *', required: true },
                    { id: 'name', label: 'Name *', required: true },                
                  ].map(({ id, label, required }) => (
                    <CCol md={6} key={id}>
                      <div className="mb-3">
                        <CFormLabel htmlFor={id}>{label}</CFormLabel>
                        <CFormInput
                          type="text"
                          id={id}
                          name={id}
                          value={formData[id]}
                          onChange={handleInputChange}
                          required={required}
                        />
                      </div>
                    </CCol>
                  ))}
                  <CCol xs={12}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="description">Description</CFormLabel>
                      <CFormTextarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol xs={12}>
                    <div className="d-flex justify-content-end gap-2">
                      <CButton
                        color="secondary"
                        onClick={() => navigate('/governance/permissions')}
                        disabled={loading}
                      >
                        Cancel
                      </CButton>
                      <CButton color="primary" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            {id ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilSave} className="me-2" />
                              {id ? 'Update Permisison' : 'Create Permisison'}
                          </>
                        )}
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Permisison
