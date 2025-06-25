import React, { useState } from 'react'
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
  CBadge,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axiosWithInterceptors from '../../../api/axios'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'

const CreateHotel = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Basic apartment info with default values for quick testing
    title: 'Premium Apartment in City Center',
    description:
      'Beautiful modern apartment with all amenities in the heart of the city. Perfect for business travelers and tourists.',
    price_per_day: 150,
    total_area: 85,
    bedrooms: 2,
    bathrooms: 1,
    hotline: '+1-555-0123',
    email: 'info@thienhang.com',
    currency: 'USD',
    is_furnished: true,
    is_garage: false,
    is_booked: false,
    is_active: true,

    // Property info
    property: {
      name: 'ThienHang Premium Residence',
      description: 'Modern residential complex with luxury amenities',
      has_pool: true,
      has_elevator: true,
      total_apartments: 50,
    },

    // Apartment address
    address: {
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      street: 'Nguyen Hue',
      house_number: '123',
      latitude: 10.7769,
      longitude: 106.7009,
    },

    // Property address (same as apartment for simplicity)
    propertyAddress: {
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      street: 'Nguyen Hue',
      house_number: '123',
      latitude: 10.7769,
      longitude: 106.7009,
    },

    // Amenities
    amenities: [
      {
        name: 'WiFi',
        description: 'High-speed internet connection',
        is_available: true,
      },
      {
        name: 'Air Conditioning',
        description: 'Central air conditioning system',
        is_available: true,
      },
      {
        name: 'Kitchen',
        description: 'Fully equipped modern kitchen',
        is_available: true,
      },
    ],
  })

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
        property: {
          name: formData.property.name,
          description: formData.property.description,
          has_pool: formData.property.has_pool,
          has_elevator: formData.property.has_elevator,
          total_apartments: formData.property.total_apartments,
          address: formData.propertyAddress,
        },
        amenities: formData.amenities.map((amenity) => ({
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

      console.log('Creating hotel with payload:', payload)

      const response = await axiosWithInterceptors.post(
        '/services/hotel/apartment/apartment',
        payload,
      )

      console.log('Hotel created successfully:', response.data)

      toast.success(response.data.message || 'Hotel created successfully!')

      // Navigate back to hotels list or to the new hotel detail
      navigate('/hotels')
    } catch (error) {
      console.error('Error creating hotel:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create hotel. Please try again.'

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
                <h4 className="mb-0">Create New Hotel</h4>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/hotels')}>
                  <CIcon icon={cilArrowLeft} className="me-2" />
                  Back to Hotels
                </CButton>
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
                                  value={amenity.name}
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
                                  value={amenity.description}
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
                        onClick={() => navigate('/hotels')}
                        disabled={loading}
                      >
                        Cancel
                      </CButton>
                      <CButton color="primary" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CIcon icon={cilSave} className="me-2" />
                            Create Hotel
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

export default CreateHotel
