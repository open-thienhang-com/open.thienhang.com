import React, { useState, useEffect } from 'react'
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
  CFormCheck,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axiosWithInterceptors from '../../../api/axios'
import api, { directApi } from '../../../api/axios'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'

const UpdateHotel = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    price_per_day: 0,
    total_area: 0,
    bedrooms: 0,
    bathrooms: 0,
    hotline: '',
    email: '',
    currency: 'USD',
    is_furnished: false,
    is_garage: false,
    is_booked: false,
    is_active: true,

    property: {
      id: '',
      name: '',
      description: '',
      has_pool: false,
      has_elevator: false,
      total_apartments: 0,
    },

    address: {
      country: '',
      city: '',
      street: '',
      house_number: '',
      latitude: 0,
      longitude: 0,
    },

    propertyAddress: {
      country: '',
      city: '',
      street: '',
      house_number: '',
      latitude: 0,
      longitude: 0,
    },

    amenities: [],
  })

  // Load existing hotel data
  useEffect(() => {
    if (id) {
      fetchHotelData()
    }
  }, [id])

  const fetchHotelData = async () => {
    setLoadingData(true)
    setError(null)

    try {
      let response

      try {
        console.log('🏨 Fetching hotel data via proxy...')
        response = await api.get(`/services/hotel/apartment/apartment/${id}`)
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, trying direct API...')
        response = await directApi.get(`/services/hotel/apartment/apartment/${id}`)
      }

      console.log('✅ Hotel data API response:', response.data)

      if (response.data && response.data.data) {
        const hotelData = response.data.data

        // Map API response to form data structure
        setFormData({
          _id: hotelData._id || '',
          title: hotelData.title || '',
          description: hotelData.description || '',
          price_per_day: hotelData.price_per_day || 0,
          total_area: hotelData.total_area || 0,
          bedrooms: hotelData.bedrooms || 0,
          bathrooms: hotelData.bathrooms || 0,
          hotline: hotelData.hotline || '',
          email: hotelData.email || '',
          currency: hotelData.currency || 'USD',
          is_furnished: hotelData.is_furnished || false,
          is_garage: hotelData.is_garage || false,
          is_booked: hotelData.is_booked || false,
          is_active: hotelData.is_active !== false, // Default to true if not specified

          property: {
            id: hotelData.property?.id || '',
            name: hotelData.property?.name || '',
            description: hotelData.property?.description || '',
            has_pool: hotelData.property?.has_pool || false,
            has_elevator: hotelData.property?.has_elevator || false,
            total_apartments: hotelData.property?.total_apartments || 0,
          },

          address: {
            country: hotelData.address?.country || '',
            city: hotelData.address?.city || '',
            street: hotelData.address?.street || '',
            house_number: hotelData.address?.house_number || '',
            latitude: hotelData.address?.latitude || 0,
            longitude: hotelData.address?.longitude || 0,
          },

          // Use same address for property if not specified separately
          propertyAddress: {
            country: hotelData.property?.address?.country || hotelData.address?.country || '',
            city: hotelData.property?.address?.city || hotelData.address?.city || '',
            street: hotelData.property?.address?.street || hotelData.address?.street || '',
            house_number:
              hotelData.property?.address?.house_number || hotelData.address?.house_number || '',
            latitude: hotelData.property?.address?.latitude || hotelData.address?.latitude || 0,
            longitude: hotelData.property?.address?.longitude || hotelData.address?.longitude || 0,
          },

          amenities: hotelData.amenities || [],
        })
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('❌ Error fetching hotel data:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch hotel data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e, section = null, index = null, field = null) => {
    const { name, value, type, checked } = e.target
    const finalValue =
      type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value

    if (section && index !== null && field) {
      // For amenities array
      setFormData((prev) => ({
        ...prev,
        [section]: prev[section].map((item, i) =>
          i === index ? { ...item, [field]: finalValue } : item,
        ),
      }))
    } else if (section) {
      // For nested objects like property, address, etc.
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: finalValue,
        },
      }))
    } else {
      // For direct form fields
      setFormData((prev) => ({
        ...prev,
        [name]: finalValue,
      }))
    }
  }

  const addAmenity = () => {
    setFormData((prev) => ({
      ...prev,
      amenities: [
        ...prev.amenities,
        {
          id: '',
          name: '',
          description: '',
          is_available: true,
        },
      ],
    }))
  }

  const removeAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the payload according to API format
      const payload = {
        _id: formData._id,
        property: {
          id: formData.property.id,
          name: formData.property.name,
          description: formData.property.description,
          has_pool: formData.property.has_pool,
          has_elevator: formData.property.has_elevator,
          total_apartments: formData.property.total_apartments,
          address: formData.propertyAddress,
        },
        amenities: formData.amenities.map((amenity) => ({
          id: amenity.id || '',
          name: amenity.name,
          description: amenity.description,
          is_available: amenity.is_available,
        })),
        address: formData.address,
        hotline: formData.hotline,
        email: formData.email,
        title: formData.title,
        description: formData.description,
        price_per_day: formData.price_per_day,
        total_area: formData.total_area,
        is_furnished: formData.is_furnished,
        is_garage: formData.is_garage,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        is_booked: formData.is_booked,
        is_active: formData.is_active,
        currency: formData.currency,
      }

      console.log('Updating hotel with payload:', payload)

      const response = await axiosWithInterceptors.put(
        `/services/hotel/apartment/apartment/${id}`,
        payload,
      )

      console.log('Hotel updated successfully:', response.data)

      toast.success(response.data.message || 'Hotel updated successfully!')

      // Navigate back to hotel detail or hotels list
      navigate(`/hotels/${id}`)
    } catch (error) {
      console.error('Error updating hotel:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to update hotel. Please try again.'

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <CContainer>
        <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardBody className="text-center py-5">
                <CSpinner color="primary" variant="grow" />
                <div className="mt-3">Loading hotel data...</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  if (error) {
    return (
      <CContainer>
        <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardBody>
                <CAlert color="danger">
                  <strong>Error:</strong> {error}
                  <div className="mt-2">
                    <CButton color="primary" size="sm" onClick={fetchHotelData}>
                      Retry
                    </CButton>
                    <CButton
                      color="secondary"
                      size="sm"
                      className="ms-2"
                      onClick={() => navigate('/hotels')}
                    >
                      Back to Hotels
                    </CButton>
                  </div>
                </CAlert>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    )
  }

  return (
    <CContainer>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Update Hotel</h4>
                <div>
                  <CButton
                    color="info"
                    variant="outline"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/hotels/${id}`)}
                  >
                    View Details
                  </CButton>
                  <CButton color="secondary" variant="outline" onClick={() => navigate('/hotels')}>
                    <CIcon icon={cilArrowLeft} className="me-2" />
                    Back to Hotels
                  </CButton>
                </div>
              </div>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                {/* Basic Information */}
                <CRow className="mb-4">
                  <CCol xs={12}>
                    <h5 className="text-primary border-bottom pb-2">Basic Information</h5>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="title">Title *</CFormLabel>
                      <CFormInput
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="email">Email *</CFormLabel>
                      <CFormInput
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="hotline">Hotline *</CFormLabel>
                      <CFormInput
                        type="text"
                        id="hotline"
                        name="hotline"
                        value={formData.hotline}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="currency">Currency</CFormLabel>
                      <CFormInput
                        type="text"
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
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

                {/* Pricing & Space */}
                <CRow className="mb-4">
                  <CCol xs={12}>
                    <h5 className="text-primary border-bottom pb-2">Pricing & Space</h5>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="price_per_day">Price per Day *</CFormLabel>
                      <CInputGroup>
                        <CInputGroupText>$</CInputGroupText>
                        <CFormInput
                          type="number"
                          id="price_per_day"
                          name="price_per_day"
                          value={formData.price_per_day}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="total_area">Total Area (m²) *</CFormLabel>
                      <CFormInput
                        type="number"
                        id="total_area"
                        name="total_area"
                        value={formData.total_area}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="bedrooms">Bedrooms *</CFormLabel>
                      <CFormInput
                        type="number"
                        id="bedrooms"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="bathrooms">Bathrooms *</CFormLabel>
                      <CFormInput
                        type="number"
                        id="bathrooms"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>
                  </CCol>
                </CRow>

                {/* Features */}
                <CRow className="mb-4">
                  <CCol xs={12}>
                    <h5 className="text-primary border-bottom pb-2">Features</h5>
                  </CCol>
                  <CCol md={3}>
                    <CFormCheck
                      id="is_furnished"
                      name="is_furnished"
                      checked={formData.is_furnished}
                      onChange={handleInputChange}
                      label="Furnished"
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormCheck
                      id="is_garage"
                      name="is_garage"
                      checked={formData.is_garage}
                      onChange={handleInputChange}
                      label="Has Garage"
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormCheck
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      label="Active"
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormCheck
                      id="is_booked"
                      name="is_booked"
                      checked={formData.is_booked}
                      onChange={handleInputChange}
                      label="Currently Booked"
                    />
                  </CCol>
                </CRow>

                {/* Property Information */}
                <CRow className="mb-4">
                  <CCol xs={12}>
                    <h5 className="text-primary border-bottom pb-2">Property Information</h5>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="property_name">Property Name *</CFormLabel>
                      <CFormInput
                        type="text"
                        id="property_name"
                        name="name"
                        value={formData.property.name}
                        onChange={(e) => handleInputChange(e, 'property')}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="total_apartments">Total Apartments</CFormLabel>
                      <CFormInput
                        type="number"
                        id="total_apartments"
                        name="total_apartments"
                        value={formData.property.total_apartments}
                        onChange={(e) => handleInputChange(e, 'property')}
                        min="0"
                      />
                    </div>
                  </CCol>
                  <CCol xs={12}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="property_description">Property Description</CFormLabel>
                      <CFormTextarea
                        id="property_description"
                        name="description"
                        rows={2}
                        value={formData.property.description}
                        onChange={(e) => handleInputChange(e, 'property')}
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <CFormCheck
                      id="has_pool"
                      name="has_pool"
                      checked={formData.property.has_pool}
                      onChange={(e) => handleInputChange(e, 'property')}
                      label="Has Pool"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormCheck
                      id="has_elevator"
                      name="has_elevator"
                      checked={formData.property.has_elevator}
                      onChange={(e) => handleInputChange(e, 'property')}
                      label="Has Elevator"
                    />
                  </CCol>
                </CRow>

                {/* Address */}
                <CRow className="mb-4">
                  <CCol xs={12}>
                    <h5 className="text-primary border-bottom pb-2">Address</h5>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="country">Country *</CFormLabel>
                      <CFormInput
                        type="text"
                        id="country"
                        name="country"
                        value={formData.address.country}
                        onChange={(e) => handleInputChange(e, 'address')}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="city">City *</CFormLabel>
                      <CFormInput
                        type="text"
                        id="city"
                        name="city"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange(e, 'address')}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="street">Street *</CFormLabel>
                      <CFormInput
                        type="text"
                        id="street"
                        name="street"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange(e, 'address')}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={2}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="house_number">House No. *</CFormLabel>
                      <CFormInput
                        type="text"
                        id="house_number"
                        name="house_number"
                        value={formData.address.house_number}
                        onChange={(e) => handleInputChange(e, 'address')}
                        required
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="latitude">Latitude</CFormLabel>
                      <CFormInput
                        type="number"
                        id="latitude"
                        name="latitude"
                        value={formData.address.latitude}
                        onChange={(e) => handleInputChange(e, 'address')}
                        step="any"
                      />
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="longitude">Longitude</CFormLabel>
                      <CFormInput
                        type="number"
                        id="longitude"
                        name="longitude"
                        value={formData.address.longitude}
                        onChange={(e) => handleInputChange(e, 'address')}
                        step="any"
                      />
                    </div>
                  </CCol>
                </CRow>

                {/* Amenities */}
                <CRow className="mb-4">
                  <CCol xs={12}>
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                      <h5 className="text-primary mb-0">Amenities</h5>
                      <CButton color="primary" variant="outline" size="sm" onClick={addAmenity}>
                        Add Amenity
                      </CButton>
                    </div>
                  </CCol>
                  {formData.amenities.map((amenity, index) => (
                    <CCol xs={12} key={index}>
                      <CCard className="mb-3 border-start border-4 border-primary">
                        <CCardBody>
                          <CRow>
                            <CCol md={4}>
                              <div className="mb-2">
                                <CFormLabel htmlFor={`amenity_name_${index}`}>Name</CFormLabel>
                                <CFormInput
                                  type="text"
                                  id={`amenity_name_${index}`}
                                  value={amenity.name || ''}
                                  onChange={(e) => handleInputChange(e, 'amenities', index, 'name')}
                                  required
                                />
                              </div>
                            </CCol>
                            <CCol md={6}>
                              <div className="mb-2">
                                <CFormLabel htmlFor={`amenity_description_${index}`}>
                                  Description
                                </CFormLabel>
                                <CFormInput
                                  type="text"
                                  id={`amenity_description_${index}`}
                                  value={amenity.description || ''}
                                  onChange={(e) =>
                                    handleInputChange(e, 'amenities', index, 'description')
                                  }
                                />
                              </div>
                            </CCol>
                            <CCol md={2}>
                              <div className="d-flex align-items-end justify-content-between h-100">
                                <CFormCheck
                                  id={`amenity_available_${index}`}
                                  checked={amenity.is_available}
                                  onChange={(e) =>
                                    handleInputChange(e, 'amenities', index, 'is_available')
                                  }
                                  label="Available"
                                />
                                <CButton
                                  color="danger"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAmenity(index)}
                                >
                                  Remove
                                </CButton>
                              </div>
                            </CCol>
                          </CRow>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>

                {/* Submit Button */}
                <CRow>
                  <CCol xs={12}>
                    <div className="d-flex justify-content-end gap-2">
                      <CButton
                        color="secondary"
                        onClick={() => navigate(`/hotels/${id}`)}
                        disabled={loading}
                      >
                        Cancel
                      </CButton>
                      <CButton color="primary" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilSave} className="me-2" />
                            Update Hotel
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

export default UpdateHotel
