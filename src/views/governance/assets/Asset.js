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
  CFormSelect,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'
import api, { directApi } from '../../../api/axios'

const Asset = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [policyOptions, setPolicyOptions] = useState([])
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    source: '',
    location: '',
    owner: '',
    sensitivity: '',
    description: '',
    policies: [],
  })

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await api.get('/governance/policies')
        if (response.data?.data) {
          setPolicyOptions(
            response.data.data.map(item => ({
              label: item.policy_name,
              value: item.policy_name,
            }))
          )
        } else {
          setError('Policy not found')
        }
      } catch {
        setError('Failed to load policies')
      }
    }

    fetchPolicies()
  }, [])

  useEffect(() => {
    if (id) fetchAssetDetail(id)
  }, [id])

  const fetchAssetDetail = async assetId => {
    setLoading(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching asset detail via proxy...', assetId)
        response = await api.get(`/governance/asset/${assetId}`)
      } catch {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.get(`/governance/asset/${assetId}`)
      }

      console.log('✅ Asset detail API response:', response.data)

      if (response.data?.data) {
        setFormData(response.data.data)
      } else {
        setError('Asset not found')
      }
    } catch (err) {
      console.error('❌ Error fetching asset detail:', err)
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch asset details'
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
        name: formData.name,
        type: formData.type,
        source: formData.source,
        owner: formData.owner,
        description: formData.description,
        location: formData.location,
        sensitivity: formData.sensitivity,
        policies: formData.policies,
      }

      console.log('Creating asset with payload:', payload)

      const response = id
        ? await api.patch(`/governance/asset/${id}`, payload)
        : await api.post('/governance/asset', payload)

      toast.success(response.data.message || 'Successfully!')

      navigate('/governance/assets')
    } catch (error) {
      console.error('Error creating asset:', error)

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
                <h4 className="mb-0">{id ? 'Asset Detail' : 'Create New Asset'}</h4>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/governance/assets')}>
                  <CIcon icon={cilArrowLeft} className="me-2" />
                  Back to Assets
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
                    { id: 'name', label: 'Name *', required: true },
                    { id: 'type', label: 'Type *', required: true },
                    { id: 'source', label: 'Source *', required: true },
                    { id: 'location', label: 'Location' },
                    { id: 'owner', label: 'Owner' },
                    { id: 'sensitivity', label: 'Sensitivity' },
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

                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="policies">Policies *</CFormLabel>
                      <CFormSelect
                        multiple
                        id="policies"
                        name="policies"
                        value={formData.policies}
                        options={policyOptions}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CCol>

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
                        onClick={() => navigate('/governance/assets')}
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
                            {id ? 'Update Asset' : 'Create Asset'}
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

export default Asset
